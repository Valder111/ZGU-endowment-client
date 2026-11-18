import { staffApi, type StaffRequest } from '@/api/staff';
import { moneyMinor, validPaymentReference } from '@/api/payments';

export type ProjectAdjustment = {
  id: string;
  amountMinor: number;
  comment: string;
  createdAt: string;
};

export async function getProjectAdjustments(
  request: StaffRequest,
  projectId: string,
  signal: AbortSignal,
) {
  if (!validPaymentReference(projectId))
    throw new Error('Некорректный идентификатор проекта.');
  const params = { signal, timeout: 15_000, withCredentials: true };
  const [project, adjustments] = await Promise.all([
    request(staffApi.projects.projectsDetail(projectId, params)),
    request(staffApi.projects.adjustmentsList(projectId, params)),
  ]);
  if (
    project.id !== projectId ||
    !Array.isArray(adjustments) ||
    !project.currency ||
    !/^[A-Z]{3}$/.test(project.currency)
  )
    throw new Error('Некорректный ответ API пополнений.');
  const rows = adjustments.map((row): ProjectAdjustment => {
    if (
      !validPaymentReference(row.id) ||
      row.project_id !== projectId ||
      typeof row.comment !== 'string' ||
      !row.created_at ||
      !Number.isFinite(Date.parse(row.created_at))
    )
      throw new Error('Некорректная запись пополнения.');
    const amountMinor = moneyMinor(row.amount);
    if (!amountMinor) throw new Error('Некорректная сумма пополнения.');
    return {
      id: row.id,
      amountMinor,
      comment: row.comment,
      createdAt: row.created_at,
    };
  });
  return {
    currentMinor:
      project.current_amount === undefined
        ? null
        : moneyMinor(project.current_amount),
    currency: project.currency,
    adjustments: rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}
