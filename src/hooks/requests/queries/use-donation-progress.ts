import { getDonationProgress } from '@/api/payments';
import { staffBase } from '@/api/staff';
import { usePaymentResource } from './use-payment-resource';

export function useDonationProgress() {
  return usePaymentResource(getDonationProgress, Boolean(staffBase), 20_000);
}
