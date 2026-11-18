import { staffApi, staffBase, type StaffRequest } from '@/api/staff';
import { moneyString, validPaymentReference } from '@/api/payments';
import type { PaymentRow } from '@/api/payment-analytics';

export function availableRefundMinor(row: PaymentRow) {
  return row.status === 'paid' &&
    row.paidAt &&
    row.providerId &&
    row.currency === 'RUB' &&
    row.pendingRefundMinor === 0
    ? Math.max(0, row.amountMinor - row.refundedMinor)
    : 0;
}

export async function requestPaymentRefund(
  request: StaffRequest,
  row: PaymentRow,
  amountMinor: number,
  reason: string,
) {
  if (
    !validPaymentReference(row.id) ||
    !Number.isSafeInteger(amountMinor) ||
    amountMinor <= 0 ||
    amountMinor > availableRefundMinor(row) ||
    !reason.trim() ||
    [...reason.trim()].length > 2000
  )
    throw new Error('Проверьте сумму и причину возврата.');
  const response = await request(
    staffApi.payments.reverseCreate(
      row.id,
      { amount: moneyString(amountMinor), reason: reason.trim() },
      { timeout: 75_000 },
    ),
  );
  if (
    response.payment_id !== row.id ||
    response.donation_id !== row.donationId ||
    (response.refund_id && !validPaymentReference(response.refund_id))
  )
    throw new Error('Не удалось сопоставить ответ возврата с платежом.');
  return response;
}

// Remember an ambiguous request across dialog reopening and page reload.
const holdKey = `zgu:refund-holds:${staffBase}`;
export function readRefundHolds(): Record<string, number> {
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(holdKey) ?? '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.fromEntries(
      Object.entries(data).filter(
        ([id, value]) =>
          validPaymentReference(id) &&
          typeof value === 'number' &&
          Number.isSafeInteger(value) &&
          value >= 0,
      ),
    );
  } catch {
    return {};
  }
}
export function writeRefundHolds(holds: Record<string, number>) {
  try {
    sessionStorage.setItem(holdKey, JSON.stringify(holds));
  } catch {
    /* In-memory guard remains active. */
  }
}
