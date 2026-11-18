import { useRef, useState, type FormEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { StaffApiError, staffError, type StaffRequest } from '@/api/staff';
import type { PaymentRow } from '@/api/payment-analytics';
import { formatPaymentAmount, moneyMinor } from '@/api/payments';
import {
  availableRefundMinor,
  requestPaymentRefund,
} from '@/api/payment-refunds';
import { Button } from '@/components/ui/button';
import { formatGroupedAmountChange } from '@/utils/grouped-amount';
import {
  formatTargetAmount,
  formatTargetAmountInput,
  normalizeTargetAmount,
} from './content-fields';
import { StaffFeedback } from './staff-controls';

export function PaymentRefundForm({
  row,
  request,
  disabled,
  held,
  onHold,
  onPending,
  onChanged,
}: {
  row: PaymentRow;
  request: StaffRequest;
  disabled: boolean;
  held: boolean;
  onHold: (hold: boolean) => void;
  onPending: (pending: boolean) => void;
  onChanged: () => void;
}) {
  const available = availableRefundMinor(row);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState<{
    amountMinor: number;
    reason: string;
  }>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const locked = useRef(false);

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const amountMinor = moneyMinor(normalizeTargetAmount(amount));
      if (amountMinor > available)
        throw new Error(
          `Доступно к возврату ${formatPaymentAmount(available)}.`,
        );
      const text = reason.trim();
      if (!text || [...text].length > 2000)
        throw new Error(
          'Укажите причину возврата длиной от 1 до 2000 символов.',
        );
      setConfirmation({ amountMinor, reason: text });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Проверьте сумму возврата.',
      );
    }
  }

  async function refund() {
    if (locked.current || disabled || held || !confirmation) return;
    if (confirmation.amountMinor > available) {
      setError('Остаток платежа изменился. Обновите сумму возврата.');
      setConfirmation(undefined);
      return;
    }
    locked.current = true;
    setPending(true);
    onPending(true);
    onHold(true);
    setError('');
    try {
      await requestPaymentRefund(
        request,
        row,
        confirmation.amountMinor,
        confirmation.reason,
      );
      setNotice(
        'Запрос на возврат отправлен. Результат и сумму возврата проверяем по данным банка.',
      );
      setEditing(false);
    } catch (failure) {
      if (
        failure instanceof StaffApiError &&
        failure.status >= 400 &&
        failure.status < 500 &&
        failure.status !== 408
      ) {
        onHold(false);
        setError(staffError(failure));
      } else {
        setEditing(false);
        setError(
          'Не удалось подтвердить результат возврата. Сверьте платёж с банком перед повторной операцией.',
        );
      }
    } finally {
      setConfirmation(undefined);
      locked.current = false;
      setPending(false);
      onPending(false);
      onChanged();
    }
  }

  return (
    <section className="payment-refund" aria-label="Возврат платежа">
      <h3>Возврат платежа</h3>
      <dl className="payment-detail-facts">
        <div>
          <dt>Возвращено</dt>
          <dd>{formatPaymentAmount(row.refundedMinor)}</dd>
        </div>
        {row.pendingRefundMinor > 0 && (
          <div>
            <dt>Возврат в обработке</dt>
            <dd>{formatPaymentAmount(row.pendingRefundMinor)}</dd>
          </div>
        )}
        <div>
          <dt>Доступно к возврату</dt>
          <dd>{formatPaymentAmount(available)}</dd>
        </div>
      </dl>
      <StaffFeedback error={error} notice={notice} />
      {held && (
        <p className="payment-hint" role="status">
          Запрос уже отправлен. Дождитесь обновления данных или нажмите «Сверить
          с банком».
        </p>
      )}
      {!held && available > 0 && !editing && (
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => {
            setAmount(formatTargetAmount((available / 100).toFixed(2)));
            setReason('');
            setError('');
            setNotice('');
            setEditing(true);
          }}
        >
          <RotateCcw /> Оформить возврат
        </Button>
      )}
      {!held && editing && available > 0 && (
        <form onSubmit={review}>
          <fieldset disabled={disabled || pending}>
            <label className="staff-field">
              Сумма возврата, ₽
              <input
                inputMode="decimal"
                required
                value={amount}
                onChange={(event) => {
                  setAmount(
                    formatGroupedAmountChange(event, (raw, pasted) =>
                      pasted
                        ? formatTargetAmount(raw)
                        : formatTargetAmountInput(raw),
                    ),
                  );
                  setConfirmation(undefined);
                }}
                onBlur={() => setAmount(formatTargetAmount(amount))}
              />
            </label>
            <label className="staff-field">
              Причина возврата
              <textarea
                rows={3}
                required
                maxLength={2000}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setConfirmation(undefined);
                }}
              />
            </label>
            {!confirmation ? (
              <div className="payment-refund-actions">
                <Button type="submit" variant="outline">
                  Проверить возврат
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Отмена
                </Button>
              </div>
            ) : (
              <div
                className="payment-refund-confirm"
                role="group"
                aria-label="Подтверждение возврата"
              >
                <strong>
                  Вернуть {formatPaymentAmount(confirmation.amountMinor)}?
                </strong>
                <p>
                  Заказ № {row.providerId}. Причина: {confirmation.reason}
                </p>
                <div className="payment-refund-actions">
                  <Button
                    type="button"
                    variant="destructive"
                    className="max-w-full whitespace-normal"
                    onClick={() => void refund()}
                  >
                    Подтвердить возврат{' '}
                    {formatPaymentAmount(confirmation.amountMinor)}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmation(undefined)}
                  >
                    Изменить
                  </Button>
                </div>
              </div>
            )}
          </fieldset>
        </form>
      )}
      {pending && <p role="status">Отправляем запрос на возврат…</p>}
      {!available && !held && (
        <p className="payment-hint">
          {row.pendingRefundMinor > 0
            ? 'Дождитесь завершения текущего возврата.'
            : row.refundedMinor >= row.amountMinor
              ? 'Вся сумма платежа уже возвращена.'
              : 'Возврат доступен для оплаченного платежа с номером заказа банка.'}
        </p>
      )}
    </section>
  );
}
