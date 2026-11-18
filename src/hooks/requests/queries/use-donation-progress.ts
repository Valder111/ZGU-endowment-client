import { getDonationProgress } from '@/api/payments';
import { staffBase } from '@/api/staff';
import { usePaymentResource } from './use-payment-resource';

export function useDonationProgress(enabled = true) {
  return usePaymentResource(
    getDonationProgress,
    Boolean(staffBase && enabled),
    20_000,
  );
}
