import { staffApi, type StaffRequest } from '@/api/staff';
import { moneyMinor, validPaymentReference } from '@/api/payments';

export type PaymentRow = {
  id: string;
  donationId: string;
  projectId: string | null;
  project: string;
  amountMinor: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt: string;
  paidAt: string | null;
  providerId: string | null;
  refundedMinor: number;
};
type RefundRow = {
  id: string;
  paymentId: string;
  amountMinor: number;
  completedAt: string;
};
export type PaymentLedger = {
  payments: PaymentRow[];
  refunds: RefundRow[];
  loadedAt: string;
};
export type DonationMonth = {
  month: string;
  amountMinor: number;
  count: number;
  refundMinor: number;
};
export type DonationSummary = {
  currentMonth: string;
  months: DonationMonth[];
  excludedCurrencies: number;
  receivedMinor: number;
  refundMinor: number;
  count: number;
};

function id(value: unknown) {
  if (!validPaymentReference(value))
    throw new Error('Некорректный идентификатор в API платежей.');
  return value;
}
function date(value: unknown) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)))
    throw new Error('Некорректная дата в API платежей.');
  return value;
}
function unique<T extends { id: string }>(rows: T[]) {
  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

export async function getPaymentLedger(
  request: StaffRequest,
  signal: AbortSignal,
): Promise<PaymentLedger> {
  const params = { signal, timeout: 15_000, withCredentials: true };
  const [paymentData, donationData, refundData, projectData] =
    await Promise.all([
      request(staffApi.payments.paymentsList(params)),
      request(staffApi.payments.donationsList(params)),
      request(staffApi.payments.refundsList(params)),
      request(staffApi.projects.projectsList(params)),
    ]);
  if (
    ![paymentData, donationData, refundData, projectData].every(Array.isArray)
  )
    throw new Error('Некорректный ответ API статистики.');
  const projects = new Map(
    projectData.map((row) => [id(row.id), row.name || row.id!]),
  );
  const donations = new Map(
    donationData.map((row) => [id(row.id), id(row.project_id)]),
  );
  const payments = unique(
    paymentData.map((row): PaymentRow => {
      if (
        !['pending', 'paid', 'failed', 'cancelled'].includes(
          row.status ?? '',
        ) ||
        typeof row.currency !== 'string' ||
        !/^[A-Z]{3}$/.test(row.currency)
      )
        throw new Error('Некорректный статус или валюта платежа.');
      const donationId = id(row.donation_id);
      const projectId = donations.get(donationId) ?? null;
      const paidAt = row.paid_at ? date(row.paid_at) : null;
      if (row.status === 'paid' && !paidAt)
        throw new Error('В API отсутствует дата оплаченного платежа.');
      return {
        id: id(row.id),
        donationId,
        projectId,
        project: projects.get(projectId ?? '') ?? 'Проект не найден',
        amountMinor: moneyMinor(row.amount),
        currency: row.currency,
        status: row.status as PaymentRow['status'],
        createdAt: date(row.created_at),
        paidAt,
        providerId: row.provider_payment_id || null,
        refundedMinor: 0,
      };
    }),
  );
  const byPayment = new Map(payments.map((row) => [row.id, row]));
  const refunds = unique(
    refundData
      .filter((row) => row.status === 'completed')
      .map((row): RefundRow => ({
        id: id(row.id),
        paymentId: id(row.payment_id),
        amountMinor: moneyMinor(row.amount),
        completedAt: date(row.completed_at),
      })),
  );
  for (const refund of refunds) {
    const payment = byPayment.get(refund.paymentId);
    if (!payment)
      throw new Error(
        'В API отсутствует платёж для возврата. Обновите данные.',
      );
    payment.refundedMinor += refund.amountMinor;
    if (
      !Number.isSafeInteger(payment.refundedMinor) ||
      payment.refundedMinor > payment.amountMinor
    )
      throw new Error('Сумма возвратов превышает сумму платежа.');
  }
  return {
    payments: payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    refunds,
    loadedAt: new Date().toISOString(),
  };
}

const periodFormat = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: '2-digit',
  timeZone: 'Asia/Krasnoyarsk',
});
export function monthKey(raw: Date | string) {
  const parts = periodFormat.formatToParts(
    typeof raw === 'string' ? new Date(raw) : raw,
  );
  return `${parts.find((part) => part.type === 'year')!.value}-${parts.find((part) => part.type === 'month')!.value}`;
}
function add(value: number, amount: number) {
  const sum = value + amount;
  if (!Number.isSafeInteger(sum))
    throw new Error('Сумма статистики превышает допустимую точность.');
  return sum;
}

export function donationSummary(
  ledger: PaymentLedger,
  count: number,
  now = new Date(),
): DonationSummary {
  const currentMonth = monthKey(now);
  const months = Array.from({ length: count }, (_, index): DonationMonth => {
    const date = new Date(`${currentMonth}-01T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() - count + index + 1);
    return {
      month: date.toISOString().slice(0, 7),
      amountMinor: 0,
      refundMinor: 0,
      count: 0,
    };
  });
  const byMonth = new Map(months.map((row) => [row.month, row]));
  const payments = new Map(ledger.payments.map((row) => [row.id, row]));
  for (const payment of ledger.payments) {
    if (payment.currency !== 'RUB' || !payment.paidAt) continue;
    const month = byMonth.get(monthKey(payment.paidAt));
    if (month) {
      month.amountMinor = add(month.amountMinor, payment.amountMinor);
      month.count += 1;
    }
  }
  for (const refund of ledger.refunds) {
    const payment = payments.get(refund.paymentId);
    // Releasing an uncaptured hold is not an outgoing refund of received funds.
    if (payment?.currency !== 'RUB' || !payment.paidAt) continue;
    const month = byMonth.get(monthKey(refund.completedAt));
    if (month) month.refundMinor = add(month.refundMinor, refund.amountMinor);
  }
  return {
    currentMonth,
    months,
    receivedMinor: months.reduce((sum, row) => add(sum, row.amountMinor), 0),
    refundMinor: months.reduce((sum, row) => add(sum, row.refundMinor), 0),
    count: months.reduce((sum, row) => sum + row.count, 0),
    excludedCurrencies: ledger.payments.filter((row) => row.currency !== 'RUB')
      .length,
  };
}
