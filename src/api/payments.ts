import { isAxiosError } from 'axios';
import { staffApi, staffBase } from '@/api/staff';
import type { HandlerCheckoutRequest } from '@/api/generated/data-contracts';
import { legalContent } from '@/constants/legal';
import { donationDirections, projects } from '@/constants/projects';
import { sitePath } from '@/utils/paths';

export const paymentsEnabled =
  Boolean(staffBase) && import.meta.env.VITE_PAYMENTS_ENABLED !== 'false';

const uuid =
  /^(?!00000000-0000-0000-0000-000000000000$)[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const maxAmountMinor = 999_999_999_999;
export const validPaymentReference = (value: unknown): value is string =>
  typeof value === 'string' && uuid.test(value);

export function validPaymentTarget(value: string) {
  return (
    value === 'fund' ||
    projects.some(({ id }) => value === `direction:${id}`) ||
    (value.startsWith('project:') && validPaymentReference(value.slice(8)))
  );
}

function projectMap(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(
      import.meta.env.VITE_DONATION_PROJECT_MAP || '{}',
    );
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([key, value]) =>
          (key === 'fund' ||
            projects.some(({ id }) => key === `direction:${id}`)) &&
          validPaymentReference(value),
      ),
    );
  } catch {
    return {};
  }
}
const mappedProjects = projectMap();

export function paymentProjectId(target: string) {
  const id = target.startsWith('project:')
    ? target.slice(8)
    : (mappedProjects[target] ??
      (donationDirections.some(({ value }) => value === target)
        ? mappedProjects.fund
        : undefined));
  return validPaymentReference(id) ? id : null;
}

export function parseDonationAmount(value: string) {
  const normalized = value.trim().replace(/[ \u00a0\u202f]/g, '.');
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(normalized))
    return null;
  const [rubles = '', fraction = ''] = normalized.split(',');
  const amount =
    Number(rubles.replace(/\./g, '')) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(amount) &&
    amount >= 10_000 &&
    amount <= maxAmountMinor
    ? amount
    : null;
}

export function moneyMinor(value: unknown) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value))
    throw new Error('Некорректная сумма в ответе API.');
  const [whole = '', fraction = ''] = value.split('.');
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(minor) || minor < 0)
    throw new Error('Некорректная сумма в ответе API.');
  return minor;
}

export function moneyString(minor: number) {
  if (!Number.isSafeInteger(minor) || minor < 0)
    throw new Error('Некорректная сумма.');
  return `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, '0')}`;
}

export const formatPaymentAmount = (minor: number, currency = 'RUB') =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);

export type DonationDraft = {
  amountMinor: number;
  currency: 'RUB';
  projectId: string;
  method: 'card' | 'sbp';
  email?: string;
  offerAcceptedAt: string;
  personalDataConsent: boolean;
};

export type PaymentResult =
  | { status: 'pending' | 'failed' | 'unavailable' }
  | { status: 'succeeded'; amountMinor: number };

export type CheckoutResult = {
  paymentId: string;
  donationId: string;
  orderId: string;
  redirectUrl: string;
};

export type ProgressTotal = {
  collectedMinor: number | null;
  targetMinor: number | null;
};
export type FundTotal = ProgressTotal & { collectedMinor: number };
export type DonationProgress = {
  fund?: FundTotal;
  targets: Map<string, ProgressTotal>;
};

export class PaymentsApiError extends Error {
  constructor(
    public status: number,
    public detail?: string,
  ) {
    super(detail ?? `Payments API: HTTP ${status}`);
  }
}

function retryableCheckout(error: unknown) {
  return (
    error instanceof PaymentsApiError &&
    (error.status === 502 ||
      error.status === 504 ||
      (error.status === 503 && error.detail === 'Платёжный сервис недоступен'))
  );
}

export function paymentError(error: unknown) {
  if (!(error instanceof PaymentsApiError))
    return 'Не удалось получить ответ. Повторите отправку этой формы, чтобы продолжить ту же попытку.';
  if (error.status === 404)
    return 'Онлайн-оплата пока недоступна. Попробуйте позже или свяжитесь с фондом.';
  if (retryableCheckout(error))
    return 'Связь с платёжным сервисом прервалась. Повторите отправку этой формы, чтобы продолжить ту же попытку.';
  if (error.status === 503)
    return 'Платёжный сервис временно недоступен. Попробуйте позже или выберите другой способ поддержки.';
  if (error.status === 429)
    return 'Слишком много запросов. Подождите немного и повторите попытку.';
  if ([400, 409].includes(error.status))
    return error.detail || 'Проверьте сумму и выбранный проект.';
  return 'Не удалось получить ответ от платёжного сервиса. Попробуйте позже.';
}

async function paymentResponse<T>(operation: Promise<{ data: T }>): Promise<T> {
  try {
    return (await operation).data;
  } catch (error) {
    if (!isAxiosError(error) || !error.response) throw error;
    const body: unknown = error.response.data;
    const detail =
      body &&
      typeof body === 'object' &&
      'error' in body &&
      typeof body.error === 'string'
        ? body.error.slice(0, 500)
        : undefined;
    throw new PaymentsApiError(error.response.status, detail);
  }
}

function providerUrl(value: unknown) {
  const url = typeof value === 'string' ? URL.parse(value) : null;
  const origins = ['https://pay.best2pay.net'];
  if (import.meta.env.VITE_PAYMENTS_SANDBOX === 'true')
    origins.push('https://test.best2pay.net');
  if (!url || !origins.includes(url.origin) || url.username || url.password)
    throw new Error('Некорректный адрес платёжной страницы.');
  return url.href;
}

async function offerVersion() {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(legalContent.offer)),
  );
  return `text-sha256:${Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('')}`;
}

export async function startPayment(
  draft: DonationDraft,
  requestId: string,
  signal?: AbortSignal,
): Promise<CheckoutResult> {
  if (!paymentsEnabled) throw new Error('Онлайн-оплата недоступна.');
  if (
    !validPaymentReference(draft.projectId) ||
    !validPaymentReference(requestId) ||
    parseDonationAmount(moneyString(draft.amountMinor).replace('.', ',')) !==
      draft.amountMinor ||
    draft.amountMinor % 100 !== 0 ||
    !Number.isFinite(Date.parse(draft.offerAcceptedAt)) ||
    (draft.email && !draft.personalDataConsent)
  )
    throw new Error('Проверьте данные пожертвования.');
  const body: HandlerCheckoutRequest = {
    project_id: draft.projectId,
    amount: moneyString(draft.amountMinor),
    currency: draft.currency,
    method: draft.method,
    idempotency_key: requestId,
    is_anonymous: true,
    ...(draft.email ? { donor_email: draft.email } : {}),
    offer_version: await offerVersion(),
    offer_accepted_at: draft.offerAcceptedAt,
  };
  const send = () =>
    paymentResponse(
      staffApi.payments.checkoutCreate(body, {
        withCredentials: false,
        timeout: 75_000,
        signal,
      }),
    );
  const data = await send().catch(async (error: unknown) => {
    if (!retryableCheckout(error) || signal?.aborted) throw error;
    await new Promise((resolve) => setTimeout(resolve, 600));
    signal?.throwIfAborted();
    return send();
  });
  if (
    !validPaymentReference(data.payment_id) ||
    !validPaymentReference(data.donation_id) ||
    typeof data.order_id !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(data.order_id)
  )
    throw new Error('Некорректный ответ платёжного сервиса.');
  return {
    paymentId: data.payment_id,
    donationId: data.donation_id,
    orderId: data.order_id,
    redirectUrl: providerUrl(data.payment_url),
  };
}

// This endpoint is restricted to staff in the current server.
export async function getPayment(
  id: string,
  signal: AbortSignal,
): Promise<PaymentResult> {
  if (!validPaymentReference(id))
    throw new Error('Некорректный номер платежа.');
  const data = await paymentResponse(
    staffApi.payments.paymentsDetail(id, {
      withCredentials: true,
      timeout: 15_000,
      signal,
    }),
  ).catch((error: unknown) => {
    if (error instanceof PaymentsApiError && [401, 403].includes(error.status))
      return null;
    throw error;
  });
  if (data === null) return { status: 'unavailable' };
  if (data.id !== id) throw new Error('Ответ относится к другому платежу.');
  if (data.status === 'paid' && data.currency === 'RUB')
    return { status: 'succeeded', amountMinor: moneyMinor(data.amount) };
  if (data.status === 'failed' || data.status === 'cancelled')
    return { status: 'failed' };
  if (data.status === 'pending') return { status: 'pending' };
  throw new Error('Неизвестный статус платежа.');
}

export async function getDonationProgress(
  signal: AbortSignal,
): Promise<DonationProgress> {
  const data = await paymentResponse(
    staffApi.projects.projectsList({
      withCredentials: false,
      timeout: 15_000,
      signal,
    }),
  );
  if (!Array.isArray(data)) throw new Error('Некорректный ответ API проектов.');
  const targets = new Map<string, ProgressTotal>();
  for (const row of data) {
    if (
      !validPaymentReference(row.id) ||
      !['published', 'completed'].includes(row.status ?? '') ||
      row.currency !== 'RUB' ||
      !row.target_amount
    )
      continue;
    const targetMinor = moneyMinor(row.target_amount);
    if (targetMinor)
      targets.set(`project:${row.id}`, { targetMinor, collectedMinor: null });
  }
  return { targets };
}

export function donationHref(
  target = 'fund',
  amountMinor?: number,
  recurring = false,
) {
  const query = new URLSearchParams();
  if (target !== 'fund' && validPaymentTarget(target))
    query.set('target', target);
  if (
    amountMinor &&
    parseDonationAmount(String(amountMinor / 100).replace('.', ',')) ===
      amountMinor
  )
    query.set('amount', String(amountMinor / 100).replace('.', ','));
  if (recurring) query.set('mode', 'recurring');
  return `/donate/${query.size ? `?${query}` : ''}`;
}

export function donationResultPath(
  reference: string,
  status: PaymentResult['status'],
) {
  return sitePath(
    `/donate/${status === 'failed' ? 'failure' : 'success'}/?${new URLSearchParams({ payment_id: reference })}`,
  );
}
