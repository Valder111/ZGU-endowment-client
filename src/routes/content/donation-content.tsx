import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  ArrowUpRight,
  CircleCheck,
  CircleX,
  Clock3,
  CreditCard,
  QrCode,
  LockKeyhole,
} from 'lucide-react';
import {
  donationResultPath,
  formatPaymentAmount,
  getPayment,
  parseDonationAmount,
  minimumDonationRubles,
  paymentsEnabled,
  paymentError,
  paymentProjectId,
  normalizeDonationTarget,
  startPayment,
  validPaymentReference,
  type DonationDraft,
  type PaymentResult,
} from '@/api/payments';
import {
  donationProjectOptions,
  donationTargetOptions,
} from '@/api/donation-projects';
import { staffBase } from '@/api/staff';
import { LegalLinks } from '@/components/elements/legal-links';
import { PersonalDataConsent } from '@/components/elements/personal-data-consent';
import { legalDocument } from '@/constants/legal';
import { SiteLink } from '@/components/elements/site-link';
import { Button } from '@/components/ui/button';
import { donationFundLabel } from '@/constants/donation-fund';
import {
  checkoutSnapshot,
  readCheckout,
  rememberCheckout,
  staffSessionSnapshot,
  subscribeCheckout,
} from '@/api/payment-context';
import { usePaymentResource } from '@/hooks/requests/queries/use-payment-resource';
import { useDonationProjects } from '@/hooks/requests/queries/use-donation-projects';
import { DonationTargetSelect } from '@/components/elements/donation-target-select';
import {
  formatGroupedAmountChange,
  groupAmountDigits,
} from '@/utils/grouped-amount';
import { assets } from '@/constants/assets';

const presets = [300, 500, 1000, 3000, 10000];
const offerDocument = legalDocument('offer');

function subscribeToSearch(change: () => void) {
  window.addEventListener('popstate', change);
  return () => window.removeEventListener('popstate', change);
}

function useSearch() {
  return useSyncExternalStore(
    subscribeToSearch,
    () => window.location.search,
    () => '',
  );
}

function readableAmount(amount: number) {
  return amount % 100 === 0 ? groupAmountDigits(String(amount / 100)) : '';
}

export function DonationContent() {
  const search = useSearch();
  return <DonationForm key={search} query={new URLSearchParams(search)} />;
}

function DonationForm({ query }: { query: URLSearchParams }) {
  const [target, setTarget] = useState(() =>
    normalizeDonationTarget(query.get('target')),
  );
  const [amount, setAmount] = useState(() => {
    const raw = query.get('amount');
    if (raw === null) return readableAmount(100_000);
    const parsed = parseDonationAmount(raw);
    return parsed === null ? '' : readableAmount(parsed);
  });
  const [email, setEmail] = useState('');
  const [offer, setOffer] = useState(false);
  const [offerAcceptedAt, setOfferAcceptedAt] = useState('');
  const [method, setMethod] = useState<'card' | 'sbp'>('card');
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const attempt = useRef<{ body: string; id: string } | null>(null);
  const sending = useRef(false);
  const checkoutController = useRef<AbortController | null>(null);
  const {
    data: published,
    loading: projectsLoading,
    error: projectsError,
    refresh: reloadProjects,
  } = useDonationProjects();
  const projectOptions = donationProjectOptions(published);
  const targetOptions = donationTargetOptions(published);
  const projectId = paymentProjectId(target);
  const selected = projectOptions.find(({ id }) => id === projectId);
  const targetLabel =
    target === 'fund'
      ? donationFundLabel
      : (selected?.label ?? 'Выбранный проект недоступен');
  const targetUnavailable =
    paymentsEnabled && !projectsLoading && !projectsError && !selected;
  const amountMinor = parseDonationAmount(amount);
  const hasEmail = Boolean(email.trim());

  function changeAmount(event: ChangeEvent<HTMLInputElement>) {
    setAmount(
      formatGroupedAmountChange(event, (raw) => {
        const plain = raw.replace(/[. \u00a0\u202f]/g, '');
        if (!/^[0-9]*$/.test(plain)) return amount;
        const digits = plain.replace(/^0+(?=[0-9])/, '');
        return digits.length <= 10 ? groupAmountDigits(digits) : amount;
      }),
    );
  }

  useEffect(() => {
    function restore(event: PageTransitionEvent) {
      if (event.persisted) {
        sending.current = false;
        setPending(false);
      }
    }
    window.addEventListener('pageshow', restore);
    return () => {
      window.removeEventListener('pageshow', restore);
      checkoutController.current?.abort();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!paymentsEnabled || sending.current || !offer || !consent) return;
    setAmountTouched(true);
    if (amountMinor === null) {
      event.currentTarget
        .querySelector<HTMLInputElement>('#payment-amount')
        ?.focus();
      return;
    }
    if (!selected) {
      setError(
        target === 'fund'
          ? 'Общий сбор пока недоступен. Попробуйте позже или свяжитесь с фондом.'
          : 'Выбранный проект пока недоступен. Выберите другой опубликованный проект.',
      );
      return;
    }
    sending.current = true;
    setPending(true);
    setError('');
    try {
      const draft: DonationDraft = {
        amountMinor,
        currency: 'RUB',
        projectId: selected.id,
        method,
        ...(hasEmail ? { email: email.trim() } : {}),
        offerAcceptedAt,
        personalDataConsent: consent,
      };
      const body = JSON.stringify(draft);
      if (attempt.current?.body !== body)
        attempt.current = { body, id: crypto.randomUUID() };
      checkoutController.current = new AbortController();
      const result = await startPayment(
        draft,
        attempt.current.id,
        checkoutController.current.signal,
      );
      rememberCheckout(result, amountMinor);
      window.location.assign(result.redirectUrl);
    } catch (cause) {
      setError(paymentError(cause));
      sending.current = false;
      setPending(false);
    }
  }

  return (
    <div className="payment-layout checkout-layout">
      <div className="payment-panel payment-main">
        <div className="checkout-form-heading">
          <span className="eyebrow">ПОДДЕРЖАТЬ УНИВЕРСИТЕТ</span>
          <h1>Пожертвование фонду</h1>
          <p>
            {target === 'fund'
              ? 'Поддержите общее развитие ЗГУ комфортной суммой вклада.'
              : `Выберите комфортную сумму для проекта «${targetLabel}».`}
          </p>
        </div>
        <form className="payment-form" method="post" onSubmit={submit}>
          <fieldset disabled={pending}>
            <legend className="sr-only">Данные пожертвования</legend>
            <div className="checkout-step" aria-hidden="true">
              <span>01</span> Сумма пожертвования
            </div>
            <div
              className="donation-amounts payment-presets"
              role="group"
              aria-label="Готовые суммы"
            >
              {presets.map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={value * 100 === amountMinor}
                  onClick={() => setAmount(readableAmount(value * 100))}
                >
                  {formatPaymentAmount(value * 100)}
                </button>
              ))}
            </div>
            <label className="payment-field" htmlFor="payment-amount">
              Сумма, ₽
              <input
                id="payment-amount"
                type="text"
                inputMode="numeric"
                required
                maxLength={13}
                pattern="[0-9]{1,3}([.][0-9]{3})*"
                value={amount}
                aria-invalid={amountTouched && amountMinor === null}
                aria-describedby={`payment-amount-hint${amountTouched && amountMinor === null ? ' payment-amount-error' : ''}`}
                onChange={changeAmount}
                onBlur={() => {
                  setAmountTouched(true);
                  if (amountMinor !== null)
                    setAmount(readableAmount(amountMinor));
                }}
              />
            </label>
            <p id="payment-amount-hint" className="payment-hint">
              Сумма в целых рублях, от {minimumDonationRubles} ₽.
            </p>
            {amountTouched && amountMinor === null && (
              <p id="payment-amount-error" className="payment-error">
                Укажите целую сумму от {minimumDonationRubles} ₽.
              </p>
            )}
            <DonationTargetSelect
              value={target}
              onChange={(value) => {
                setTarget(value);
                setError('');
              }}
              options={targetOptions}
            >
              <p>
                {target === 'fund'
                  ? 'Ваш вклад пополнит общий сбор университета.'
                  : 'Ваш вклад поступит в выбранный проект фонда.'}
              </p>
            </DonationTargetSelect>
            {targetUnavailable && (
              <p className="payment-error" role="alert">
                {target === 'fund'
                  ? 'Общий сбор пока недоступен. Попробуйте позже или свяжитесь с фондом.'
                  : 'Выбранный проект пока недоступен. Выберите другой опубликованный проект.'}
              </p>
            )}
            {Boolean(projectsError) && (
              <div className="payment-message" role="status">
                <p>Не удалось загрузить проекты фонда.</p>
                <Button variant="outline" onClick={reloadProjects}>
                  Повторить
                </Button>
              </div>
            )}
            <div
              className="payment-methods"
              role="group"
              aria-label="Способ оплаты"
            >
              <button
                type="button"
                aria-pressed={method === 'card'}
                onClick={() => setMethod('card')}
              >
                <CreditCard aria-hidden="true" /> Карта и другие способы
              </button>
              <button
                type="button"
                aria-pressed={method === 'sbp'}
                onClick={() => setMethod('sbp')}
              >
                <QrCode aria-hidden="true" /> СБП
              </button>
            </div>
            <div
              className="checkout-step checkout-step-contacts"
              aria-hidden="true"
            >
              <span>02</span> Контактные данные
            </div>
            <label className="payment-field" htmlFor="payment-email">
              <span>
                Электронная почта <small>Необязательно</small>
              </span>
              <input
                id="payment-email"
                type="email"
                autoComplete="email"
                maxLength={100}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setConsent(false);
                }}
                aria-describedby="payment-email-help"
              />
            </label>
            <p id="payment-email-help" className="payment-hint">
              Укажите почту, если хотите получить уведомление о результате
              платежа.
            </p>
            <label className="payment-check">
              <input
                type="checkbox"
                required
                checked={offer}
                onChange={(event) => {
                  setOffer(event.target.checked);
                  setOfferAcceptedAt(
                    event.target.checked ? new Date().toISOString() : '',
                  );
                }}
              />
              <span>
                Принимаю условия{' '}
                <SiteLink
                  href={offerDocument.path}
                  target="_blank"
                  rel="noopener"
                >
                  публичной оферты
                </SiteLink>
              </span>
            </label>
            <PersonalDataConsent checked={consent} onChange={setConsent} />
          </fieldset>
          <PaymentSummary amountMinor={amountMinor} targetLabel={targetLabel} />
          {error && !targetUnavailable && (
            <p className="payment-error" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="brand"
            disabled={
              !paymentsEnabled ||
              pending ||
              projectsLoading ||
              Boolean(projectsError) ||
              !selected ||
              !offer ||
              !consent
            }
          >
            {pending ? 'Готовим платёж…' : 'Перейти к оплате'}{' '}
            <ArrowUpRight aria-hidden="true" />
          </Button>
          {!paymentsEnabled && (
            <div className="payment-message">
              <Clock3 aria-hidden="true" />
              <p>
                Онлайн-оплата пока недоступна.{' '}
                <SiteLink className="text-link" href="/how-to-support/">
                  Другие способы поддержать фонд ↗
                </SiteLink>
              </p>
            </div>
          )}
          <div className="checkout-security">
            <LockKeyhole aria-hidden="true" />
            <p>Данные карты вводятся на защищённой странице Best2Pay.</p>
          </div>
          <LegalLinks newTab />
        </form>
      </div>
      <aside className="checkout-story" aria-labelledby="checkout-story-title">
        <div className="checkout-story-copy">
          <span className="eyebrow">СОЗДАЁМ ВОЗМОЖНОСТИ ВМЕСТЕ</span>
          <h2 id="checkout-story-title">
            Ваш вклад.
            <br />
            <em>Их будущее.</em>
          </h2>
          <p>
            Поддержите студентов, исследования и идеи, которые помогают
            развиваться университету и Северу.
          </p>
          <div className="checkout-story-tags">
            <span>Образование</span>
            <span>Наука</span>
            <span>Сообщество</span>
          </div>
        </div>
        <figure className="checkout-photo">
          <img
            src={assets.universityCommunity}
            alt="Студенты ЗГУ с флагом Политехнического колледжа"
            width="1200"
            height="800"
          />
          <figcaption>За каждым вкладом — чьи-то возможности.</figcaption>
        </figure>
        <div className="checkout-story-links">
          <SiteLink href="/about/general-information/">
            Как работает эндаумент <ArrowUpRight aria-hidden="true" />
          </SiteLink>
          <SiteLink href="/about/constituent-the-documents/">
            Документы фонда <ArrowUpRight aria-hidden="true" />
          </SiteLink>
        </div>
      </aside>
    </div>
  );
}

function PaymentSummary({
  amountMinor,
  targetLabel,
}: {
  amountMinor: number | null;
  targetLabel: string;
}) {
  return (
    <aside
      className="payment-summary checkout-summary"
      aria-label="Детали пожертвования"
    >
      <dl>
        <div>
          <dt>К оплате</dt>
          <dd className="payment-total">
            {amountMinor === null ? '—' : formatPaymentAmount(amountMinor)}
          </dd>
        </div>
        <div>
          <dt>Цель пожертвования</dt>
          <dd>{targetLabel}</dd>
        </div>
        <div>
          <dt>Формат</dt>
          <dd>Разовый вклад</dd>
        </div>
      </dl>
    </aside>
  );
}

const isFinal = (value: PaymentResult) => value.status !== 'pending';

export function DonationResultContent() {
  const query = new URLSearchParams(useSearch());
  const stored = readCheckout(
    useSyncExternalStore(subscribeCheckout, checkoutSnapshot, () => ''),
  );
  const staffSession = useSyncExternalStore(
    subscribeCheckout,
    staffSessionSnapshot,
    () => false,
  );
  const pathname = useSyncExternalStore(
    subscribeToSearch,
    () => window.location.pathname,
    () => '',
  );
  const candidate = query.get('payment_id');
  const paymentId = validPaymentReference(candidate)
    ? candidate
    : (stored?.paymentId ?? null);
  const rawOrder = query.get('order_id') || query.get('id');
  const callbackOrder =
    rawOrder && /^[a-zA-Z0-9_-]{1,100}$/.test(rawOrder) ? rawOrder : null;
  const mismatch = Boolean(
    stored &&
    ((callbackOrder && stored.orderId !== callbackOrder) ||
      (validPaymentReference(candidate) && stored.paymentId !== candidate)),
  );
  const orderId = callbackOrder ?? stored?.orderId ?? null;
  const hasReference = Boolean(paymentId || orderId) && !mismatch;
  const canReadStatus = Boolean(
    staffBase && staffSession && paymentId && !mismatch,
  );
  const load = useCallback(
    (signal: AbortSignal) => getPayment(paymentId!, signal),
    [paymentId],
  );
  const { data, error, loading, refresh } = usePaymentResource(
    load,
    canReadStatus,
    4_000,
    isFinal,
  );
  const verifiedSuccess = data?.status === 'succeeded';
  const verifiedFailure = data?.status === 'failed';
  const returnedStatus = /\/(?:donate|payment)\/success\/?$/.test(pathname)
    ? 'succeeded'
    : /\/(?:donate\/failure|payment\/fail)\/?$/.test(pathname)
      ? 'failed'
      : null;
  // The return route selects the screen; only the API confirms stored funds.
  const verifiedStatus = verifiedSuccess
    ? 'succeeded'
    : verifiedFailure
      ? 'failed'
      : null;
  const displayedStatus = hasReference
    ? (verifiedStatus ?? returnedStatus ?? 'pending')
    : 'unknown';
  const success = displayedStatus === 'succeeded';
  const failed = displayedStatus === 'failed';
  useEffect(() => {
    if (!paymentId || !hasReference || (!verifiedSuccess && !verifiedFailure))
      return;
    const path = donationResultPath(
      paymentId,
      verifiedSuccess ? 'succeeded' : 'failed',
    );
    if (window.location.pathname !== path.split('?')[0])
      window.history.replaceState(null, '', path);
  }, [paymentId, hasReference, verifiedSuccess, verifiedFailure]);
  const Icon = success ? CircleCheck : failed ? CircleX : Clock3;
  const title = success
    ? verifiedSuccess
      ? 'Пожертвование принято'
      : 'Оплата прошла успешно'
    : failed
      ? 'Платёж не прошёл'
      : 'Ожидаем подтверждения';

  return (
    <div className="wrap payment-result-wrap">
      <section
        className="payment-panel payment-result"
        data-status={displayedStatus}
        data-status-source={
          hasReference
            ? verifiedStatus
              ? 'api'
              : returnedStatus
                ? 'bank-return'
                : undefined
            : undefined
        }
        aria-labelledby="payment-result-title"
      >
        <span className="payment-emblem">
          <Icon aria-hidden="true" />
        </span>
        <div role="status" aria-atomic="true">
          <h2 id="payment-result-title">
            {!hasReference ? 'Не удалось определить платёж' : title}
          </h2>
          {!hasReference ? (
            <p>
              Откройте страницу, на которую вас вернула платёжная система. Если
              вы уже оплатили, уточните результат у фонда перед повторным
              платежом.
            </p>
          ) : data?.status === 'succeeded' ? (
            <p>
              Спасибо за вклад в будущее университета. Получено{' '}
              {formatPaymentAmount(data.amountMinor)}.
            </p>
          ) : success ? (
            <p>
              Спасибо за поддержку университета! Вы вернулись на страницу
              успешной оплаты. Подтверждение пожертвования поступит фонду от
              банка автоматически.
            </p>
          ) : verifiedFailure ? (
            <p>
              Оплату завершить не удалось. Вы можете вернуться к форме и
              попробовать снова.
            </p>
          ) : failed ? (
            <p>
              Платёжная система вернула вас на страницу неуспешной оплаты.
              Проверьте результат в приложении банка перед повторной попыткой.
            </p>
          ) : !canReadStatus || data?.status === 'unavailable' ? (
            <p>
              Фонд получит результат оплаты от банка. Проверьте уведомление на
              почте или в приложении банка. Для уточнения сообщите фонду номер
              заказа.
            </p>
          ) : error ? (
            <p>
              Не удалось проверить статус. Если вы уже оплатили, дождитесь
              подтверждения перед повторным платежом.
            </p>
          ) : (
            <p>
              Проверяем, поступило ли пожертвование. Статус обновится
              автоматически.
            </p>
          )}
        </div>
        {hasReference && (orderId || paymentId) && (
          <dl className="payment-result-reference">
            <dt>{orderId ? 'Номер заказа' : 'Номер платежа'}</dt>
            <dd>{orderId ?? paymentId}</dd>
          </dl>
        )}
        {canReadStatus &&
          !success &&
          !failed &&
          data?.status !== 'unavailable' && (
            <Button variant="outline" onClick={refresh} disabled={loading}>
              {loading ? 'Проверяем…' : 'Проверить статус'}
            </Button>
          )}
        <div className="payment-result-actions">
          {(failed || !hasReference) && (
            <SiteLink className="button primary" href="/donate/">
              {failed ? 'Попробовать ещё раз' : 'К форме пожертвования'} ↗
            </SiteLink>
          )}
          <SiteLink className="text-link" href="/projects/">
            К проектам фонда ↗
          </SiteLink>
          {!success && (
            <SiteLink className="text-link" href="/contacts-and-requisites/">
              Связаться с фондом ↗
            </SiteLink>
          )}
        </div>
      </section>
    </div>
  );
}
