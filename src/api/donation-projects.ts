import type { RequestParams } from '@/api/generated/http-client';
import { paymentProjectId, validPaymentReference } from '@/api/payments';
import { donationFundLabel } from '@/constants/donation-fund';
import { collectionApi, publicContentParams } from '@/api/staff-content';
import type { ContentRecord } from '@/api/staff';

export const loadDonationProjects = (params: RequestParams) =>
  collectionApi.projects.list({
    ...publicContentParams,
    timeout: 15_000,
    ...params,
  });

export function donationProjectOptions(records?: ContentRecord[]) {
  return (Array.isArray(records) ? records : []).flatMap((project) => {
    const label = project.name || project.title;
    return validPaymentReference(project.id) &&
      label &&
      project.status === 'published' &&
      project.currency === 'RUB'
      ? [{ id: project.id, value: `project:${project.id}`, label }]
      : [];
  });
}

export function donationTargetOptions(records?: ContentRecord[]) {
  const commonId = paymentProjectId('fund')!;
  const other = donationProjectOptions(records).filter(
    (project) => project.id !== commonId,
  );
  return [
    { id: commonId, value: 'fund', label: donationFundLabel },
    ...Array.from(new Map(other.map((option) => [option.id, option])).values()),
  ];
}
