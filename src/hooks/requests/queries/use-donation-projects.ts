import { staffBase, staffResult } from '@/api/staff';
import { loadDonationProjects } from '@/api/donation-projects';
import { usePaymentResource } from './use-payment-resource';

const load = (signal: AbortSignal) =>
  staffResult(loadDonationProjects({ signal }));
export function useDonationProjects(enabled = true) {
  return usePaymentResource(load, Boolean(staffBase && enabled), 20_000);
}
