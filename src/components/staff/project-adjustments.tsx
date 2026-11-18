import { useCallback, useId, useState, type FormEvent } from 'react';
import { Plus, RefreshCw, Trash2, Wallet } from 'lucide-react';
import {
  staffApi,
  staffError,
  StaffApiError,
  type StaffRequest,
} from '@/api/staff';
import { formatPaymentAmount } from '@/api/payments';
import { getProjectAdjustments } from '@/api/project-adjustments';
import { usePaymentResource } from '@/hooks/requests/queries/use-payment-resource';
import {
  invalidStaffForm,
  useStaffAction,
} from '@/hooks/requests/mutations/use-staff-action';
import { formatGroupedAmountChange } from '@/utils/grouped-amount';
import { Button } from '@/components/ui/button';
import {
  formatTargetAmount,
  formatTargetAmountInput,
  normalizeTargetAmount,
} from './content-fields';
import { StaffFeedback, StaffLoad } from './staff-controls';
import { StaffConfirm } from './staff-confirm';

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Krasnoyarsk',
});

export function ProjectAdjustments({
  request,
  projectId,
  canManage,
  onChanged,
}: {
  request: StaffRequest;
  projectId: string;
  canManage: boolean;
  onChanged: () => void;
}) {
  const titleId = useId();
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const action = useStaffAction();
  const load = useCallback(
    (signal: AbortSignal) => getProjectAdjustments(request, projectId, signal),
    [request, projectId],
  );
  const balance = usePaymentResource(load, true, 30_000);
  const currency = balance.data?.currency ?? 'RUB';

  function refresh() {
    balance.refresh();
    onChanged();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !balance.data || balance.error) return;
    void action.run(async () => {
      const normalized = normalizeTargetAmount(amount);
      const trimmed = comment.trim();
      if (!trimmed || [...trimmed].length > 2000)
        invalidStaffForm('Укажите комментарий длиной от 1 до 2000 символов.');
      try {
        await request(
          staffApi.projects.adjustmentsCreate(projectId, {
            amount: normalized,
            comment: trimmed,
          }),
        );
      } catch (error) {
        if (!(error instanceof StaffApiError) || error.status >= 500) {
          balance.refresh();
          invalidStaffForm(
            'Не удалось подтвердить сохранение. Проверьте обновлённую историю пополнений перед повторной отправкой.',
          );
        }
        throw error;
      }
      setAmount('');
      setComment('');
      refresh();
    }, 'Ручное пополнение добавлено.');
  }

  function remove(id: string) {
    if (!canManage) return;
    void action.run(async () => {
      await request(staffApi.projects.adjustmentsDelete(projectId, id));
      refresh();
    }, 'Ручное пополнение удалено.');
  }

  return (
    <section
      className="staff-card project-adjustments"
      aria-labelledby={titleId}
    >
      <div className="staff-workspace-heading">
        <div>
          <span className="eyebrow">УЧЁТ ПОСТУПЛЕНИЙ</span>
          <h3 id={titleId}>Ручные пополнения</h3>
        </div>
        <Button
          variant="outline"
          onClick={balance.refresh}
          disabled={balance.loading || action.pending}
        >
          <RefreshCw /> Обновить пополнения
        </Button>
      </div>
      <p className="staff-hint">
        Учитывайте переводы, поступившие вне сайта. Собранная сумма проекта
        включает онлайн-платежи, возвраты и ручные пополнения.
      </p>
      <StaffFeedback error={action.error} notice={action.notice} />
      <StaffLoad
        loading={balance.loading}
        error={balance.error ? staffError(balance.error) : undefined}
        reload={balance.refresh}
      >
        {balance.data && (
          <>
            <div className="project-adjustments-balance">
              <Wallet aria-hidden="true" />
              <dl>
                <dt>Собрано в проекте</dt>
                <dd>
                  {balance.data.currentMinor === null
                    ? '—'
                    : formatPaymentAmount(balance.data.currentMinor, currency)}
                </dd>
              </dl>
            </div>
            {canManage ? (
              <form className="project-adjustments-form" onSubmit={submit}>
                <fieldset disabled={action.pending || Boolean(balance.error)}>
                  <label className="staff-field">
                    Сумма пополнения, {currency}
                    <input
                      value={amount}
                      inputMode="decimal"
                      required
                      placeholder="Например, 10.000,50"
                      onChange={(event) =>
                        setAmount(
                          formatGroupedAmountChange(event, (raw, pasted) =>
                            pasted
                              ? formatTargetAmount(raw)
                              : formatTargetAmountInput(raw),
                          ),
                        )
                      }
                      onBlur={() => setAmount(formatTargetAmount(amount))}
                    />
                  </label>
                  <label className="staff-field">
                    Комментарий к пополнению
                    <textarea
                      value={comment}
                      required
                      maxLength={2000}
                      rows={3}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Основание перевода или номер платёжного документа"
                    />
                  </label>
                  <Button variant="brand" type="submit">
                    <Plus />{' '}
                    {action.pending ? 'Сохраняем…' : 'Добавить пополнение'}
                  </Button>
                </fieldset>
              </form>
            ) : (
              <p className="staff-hint">
                Добавлять и удалять пополнения может администратор.
              </p>
            )}
            {balance.data.adjustments.length ? (
              <ul
                className="project-adjustments-list"
                aria-label="История ручных пополнений"
              >
                {balance.data.adjustments.map((row) => (
                  <li key={row.id}>
                    <div>
                      <strong>
                        {formatPaymentAmount(row.amountMinor, currency)}
                      </strong>
                      <time dateTime={row.createdAt}>
                        {dateFormat.format(new Date(row.createdAt))}
                      </time>
                      <p>{row.comment}</p>
                    </div>
                    {canManage && (
                      <StaffConfirm
                        trigger={
                          <Button
                            variant="outline"
                            disabled={action.pending}
                            aria-label={`Удалить пополнение ${formatPaymentAmount(row.amountMinor, currency)}`}
                          >
                            <Trash2 />
                          </Button>
                        }
                        title="Удалить ручное пополнение?"
                        description={`Собранная сумма проекта уменьшится на ${formatPaymentAmount(row.amountMinor, currency)}. Основание: ${row.comment}`}
                        label="Удалить пополнение"
                        danger
                        onConfirm={() => remove(row.id)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="staff-empty">Ручных пополнений пока нет.</p>
            )}
          </>
        )}
      </StaffLoad>
    </section>
  );
}
