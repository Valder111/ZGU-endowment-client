import { staffBase } from '@/api/staff';
import { validPaymentReference, type CheckoutResult } from '@/api/payments';

const key = `zgu:checkout:${staffBase}`;
const changeEvent = 'zgu-checkout-change';

export type CheckoutContext = Omit<CheckoutResult, 'redirectUrl'> & {
  amountMinor: number;
  createdAt: string;
};

export function rememberCheckout(result: CheckoutResult, amountMinor: number) {
  try {
    const { paymentId, donationId, orderId } = result;
    const value: CheckoutContext = {
      paymentId,
      donationId,
      orderId,
      amountMinor,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(changeEvent));
  } catch {
    // Payment can continue even if session storage is unavailable.
  }
}

export function checkoutSnapshot() {
  try {
    return sessionStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export function staffSessionSnapshot() {
  try {
    return (
      sessionStorage.getItem(`zgu:staff-session:${staffBase}`) === 'active'
    );
  } catch {
    return false;
  }
}

export function subscribeCheckout(change: () => void) {
  window.addEventListener('storage', change);
  window.addEventListener(changeEvent, change);
  return () => {
    window.removeEventListener('storage', change);
    window.removeEventListener(changeEvent, change);
  };
}

export function readCheckout(raw: string): CheckoutContext | null {
  try {
    const data = JSON.parse(raw) as Partial<CheckoutContext> | null;
    if (
      !data ||
      !validPaymentReference(data.paymentId) ||
      !validPaymentReference(data.donationId) ||
      typeof data.orderId !== 'string' ||
      !/^[a-zA-Z0-9_-]{1,100}$/.test(data.orderId) ||
      !Number.isSafeInteger(data.amountMinor) ||
      data.amountMinor! < 0 ||
      typeof data.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(data.createdAt))
    )
      return null;
    return data as CheckoutContext;
  } catch {
    return null;
  }
}
