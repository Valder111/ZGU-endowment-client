import { useCallback, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Clock3,
  FolderHeart,
  Info,
  RefreshCw,
  RotateCcw,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import { formatPaymentAmount } from '@/api/payments';
import {
  donationSummary,
  getPaymentLedger,
  monthKey,
  type PaymentRow,
} from '@/api/payment-analytics';
import {
  staffApi,
  staffBase,
  staffError,
  type StaffRequest,
} from '@/api/staff';
import { usePaymentResource } from '@/hooks/requests/queries/use-payment-resource';
import { useStaffAction } from '@/hooks/requests/mutations/use-staff-action';
import { StaffFeedback } from '@/components/staff/staff-controls';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatNumber } from '@/utils/typography';

const monthName = new Intl.DateTimeFormat('ru-RU', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const fullMonth = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const dayName = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeZone: 'Asia/Krasnoyarsk',
});
const timeName = new Intl.DateTimeFormat('ru-RU', {
  timeStyle: 'short',
  timeZone: 'Asia/Krasnoyarsk',
});
const dateName = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Krasnoyarsk',
});
const labels = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  failed: 'Ошибка',
  cancelled: 'Отменён',
};
const states = [
  { value: 'paid', color: '#21857e' },
  { value: 'pending', color: '#dcaf68' },
  { value: 'cancelled', color: '#7f91a4' },
  { value: 'failed', color: '#b85c70' },
] as const;
const pageSize = 10;

function StateBadge({ row }: { row: PaymentRow }) {
  return (
    <span className="payment-state" data-status={row.status}>
      <span aria-hidden="true" />
      {labels[row.status]}
    </span>
  );
}

export function PaymentsWorkspace({ request }: { request: StaffRequest }) {
  const [period, setPeriod] = useState(6);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const action = useStaffAction();
  const load = useCallback(
    (signal: AbortSignal) => getPaymentLedger(request, signal),
    [request],
  );
  const { data, error, loading, refresh } = usePaymentResource(
    load,
    Boolean(staffBase),
    30_000,
  );
  const calculated = useMemo(() => {
    try {
      return {
        summary: data ? donationSummary(data, period) : null,
        error: '',
      };
    } catch {
      return {
        summary: null,
        error:
          'Не удалось рассчитать итоговые суммы. Проверьте данные платежей и обновите реестр.',
      };
    }
  }, [data, period]);
  const summary = calculated.summary;
  const months = new Set(summary?.months.map((row) => row.month));
  const periodRows = (data?.payments ?? []).filter(
    (row) =>
      row.currency === 'RUB' &&
      months.has(monthKey(row.paidAt ?? row.createdAt)),
  );
  const query = search.trim().toLocaleLowerCase('ru-RU');
  const rows = periodRows.filter(
    (row) =>
      (status === 'all' || row.status === status) &&
      (!activeMonth || monthKey(row.paidAt ?? row.createdAt) === activeMonth) &&
      (!query ||
        [
          row.project,
          row.id,
          row.providerId,
          row.donationId,
          row.projectId,
        ].some((value) => value?.toLocaleLowerCase('ru-RU').includes(query))),
  );
  const current = summary?.months.find(
    ({ month }) => month === summary.currentMonth,
  );
  const maximum = Math.max(
    1,
    ...(summary?.months.flatMap((row) => [row.amountMinor, row.refundMinor]) ??
      []),
  );
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pages);
  const statusCounts = new Map(
    states.map(({ value }) => [
      value,
      periodRows.filter((row) => row.status === value).length,
    ]),
  );
  let angle = 0;
  const segments = states.map(({ value, color }) => {
    const start = angle;
    angle +=
      ((statusCounts.get(value) ?? 0) / Math.max(1, periodRows.length)) * 360;
    return `${color} ${start}deg ${angle}deg`;
  });
  const inspected = data?.payments.find(({ id }) => id === detailId);
  const largest = Math.max(
    0,
    ...periodRows.filter((row) => row.paidAt).map((row) => row.amountMinor),
  );

  function synchronize(row: PaymentRow) {
    void action.run(async () => {
      await request(staffApi.payments.syncCreate(row.id, { timeout: 75_000 }));
      refresh();
    }, 'Статус платежа обновлён.');
  }

  function filterStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <section
      className="staff-card payments-workspace payments-dashboard"
      aria-labelledby="payments-workspace-title"
    >
      <header className="payments-dashboard-hero">
        <div>
          <span className="payments-live">
            <span aria-hidden="true" />
            ФИНАНСЫ ФОНДА
          </span>
          <h2 id="payments-workspace-title">Пожертвования</h2>
          <p>Каждый вклад — часть большого будущего.</p>
          <span className="payments-update">
            {data
              ? `Обновлено ${timeName.format(new Date(data.loadedAt))} · Норильск`
              : 'Поступления, операции и возвраты в одном месте'}
          </span>
        </div>
        <div className="payments-workspace-controls">
          <label className="staff-field">
            Период
            <select
              value={period}
              onChange={(event) => {
                setPeriod(Number(event.target.value));
                setActiveMonth(null);
                setPage(1);
              }}
            >
              <option value={3}>3 месяца</option>
              <option value={6}>6 месяцев</option>
              <option value={12}>12 месяцев</option>
            </select>
          </label>
          <Button
            variant="outline"
            disabled={loading || action.pending}
            onClick={refresh}
          >
            <RefreshCw aria-hidden="true" />
            Обновить
          </Button>
        </div>
      </header>

      {loading && !data && (
        <p className="payments-loading" role="status">
          <RefreshCw aria-hidden="true" />
          Загружаем финансовую картину…
        </p>
      )}
      {Boolean(error) && (
        <p role="status" className="payment-error payments-alert">
          {data
            ? 'Не удалось обновить статистику. Показаны последние полученные данные.'
            : staffError(error)}
        </p>
      )}
      {calculated.error && (
        <p role="alert" className="payment-error payments-alert">
          {calculated.error}
        </p>
      )}
      {(action.error || action.notice) && (
        <StaffFeedback error={action.error} notice={action.notice} />
      )}

      {summary && (
        <>
          <dl className="payment-kpis">
            <div className="payment-kpi-primary">
              <dt>
                <span className="payment-kpi-icon" aria-hidden="true">
                  <ArrowDownLeft />
                </span>
                <span className="payment-kpi-label">
                  Поступило в этом месяце
                </span>
              </dt>
              <dd>
                <strong className="payment-kpi-value">
                  {formatPaymentAmount(current?.amountMinor ?? 0)}
                </strong>
                <small>Подтверждённые поступления</small>
              </dd>
            </div>
            <div>
              <dt>
                <span className="payment-kpi-icon" aria-hidden="true">
                  <Wallet />
                </span>
                <span className="payment-kpi-label">
                  За период с учётом возвратов
                </span>
              </dt>
              <dd>
                <strong className="payment-kpi-value">
                  {formatPaymentAmount(
                    summary.receivedMinor - summary.refundMinor,
                  )}
                </strong>
                <small>Чистые поступления за {period} мес.</small>
              </dd>
            </div>
            <div>
              <dt>
                <span className="payment-kpi-icon" aria-hidden="true">
                  <RotateCcw />
                </span>
                <span className="payment-kpi-label">Возвращено за период</span>
              </dt>
              <dd>
                <strong className="payment-kpi-value">
                  {formatPaymentAmount(summary.refundMinor)}
                </strong>
                <small>Только завершённые возвраты</small>
              </dd>
            </div>
            <div>
              <dt>
                <span className="payment-kpi-icon" aria-hidden="true">
                  <CircleCheck />
                </span>
                <span className="payment-kpi-label">
                  Оплаченных платежей за период
                </span>
              </dt>
              <dd>
                <strong className="payment-kpi-value">
                  {formatNumber(summary.count)}
                </strong>
                <small>С подтверждённым списанием</small>
              </dd>
            </div>
          </dl>

          <div className="payments-analysis-grid">
            <section
              className="payment-chart payments-chart-panel"
              aria-labelledby="payment-chart-title"
            >
              <div className="payments-section-heading">
                <div>
                  <span className="payments-section-kicker">
                    ОТ ВКЛАДА К РЕЗУЛЬТАТУ
                  </span>
                  <h3 id="payment-chart-title">Динамика поступлений</h3>
                </div>
                <ChartNoAxesColumnIncreasing aria-hidden="true" />
              </div>
              <div className="payments-chart-legend">
                <span>
                  <i data-kind="received" />
                  Поступления
                </span>
                <span>
                  <i data-kind="refund" />
                  Возвраты
                </span>
              </div>
              <div
                className="payments-chart-scroll"
                tabIndex={0}
                role="group"
                aria-label="График по месяцам"
              >
                <ul
                  className="payments-months"
                  aria-label="Суммы и число платежей по месяцам"
                  style={{
                    gridTemplateColumns: `repeat(${period}, minmax(68px, 1fr))`,
                    minWidth: period * 68,
                  }}
                >
                  {summary.months.map(
                    ({ month, amountMinor, refundMinor, count }) => (
                      <li
                        key={month}
                        data-current={month === summary.currentMonth}
                        data-selected={month === activeMonth}
                      >
                        <strong>{formatPaymentAmount(amountMinor)}</strong>
                        <button
                          type="button"
                          className="payment-month-bars"
                          aria-pressed={month === activeMonth}
                          aria-label={`${fullMonth.format(new Date(month + '-01T00:00:00Z'))}: ${formatPaymentAmount(amountMinor)}, платежей ${count}, возвраты ${formatPaymentAmount(refundMinor)}`}
                          onClick={() => {
                            setActiveMonth(
                              activeMonth === month ? null : month,
                            );
                            setPage(1);
                          }}
                        >
                          <span
                            className="payment-month-received"
                            style={{
                              height: `${Math.max(amountMinor ? 2 : 0, (amountMinor / maximum) * 100)}%`,
                            }}
                          />
                          {refundMinor > 0 && (
                            <span
                              className="payment-month-refunded"
                              style={{
                                height: `${Math.max(2, (refundMinor / maximum) * 100)}%`,
                              }}
                            />
                          )}
                        </button>
                        <time dateTime={month}>
                          {monthName.format(new Date(month + '-01T00:00:00Z'))}
                        </time>
                        <span className="payment-month-count">
                          {count}
                          <span className="sr-only"> — число платежей</span>
                        </span>
                        {refundMinor > 0 && (
                          <span className="sr-only">
                            Возвраты за месяц {formatPaymentAmount(refundMinor)}
                          </span>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <p className="payments-chart-help">
                Нажмите на месяц, чтобы посмотреть его платежи. Поступления
                учитываются по дате списания, возвраты — по дате завершения.
              </p>
            </section>

            <aside
              className="payments-status-panel"
              aria-labelledby="payments-status-title"
            >
              <span className="payments-section-kicker">
                ОПЕРАЦИИ ЗА ПЕРИОД
              </span>
              <h3 id="payments-status-title">Состояние платежей</h3>
              <div
                className="payments-status-circle"
                role="img"
                aria-label={`Всего операций: ${periodRows.length}. ${states.map(({ value }) => `${labels[value]}: ${statusCounts.get(value) ?? 0}`).join('. ')}`}
                style={{
                  background: periodRows.length
                    ? `conic-gradient(${segments.join(',')})`
                    : '#e8eff0',
                }}
              >
                <div>
                  <strong>{formatNumber(periodRows.length)}</strong>
                  <span>операций</span>
                </div>
              </div>
              <div className="payments-status-list">
                {states.map(({ value, color }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={status === value}
                    onClick={() =>
                      filterStatus(status === value ? 'all' : value)
                    }
                  >
                    <span
                      className="payments-status-dot"
                      style={{ background: color }}
                    />
                    <span>{labels[value]}</span>
                    <strong>{statusCounts.get(value) ?? 0}</strong>
                  </button>
                ))}
              </div>
              <dl className="payments-extra-stats">
                <div>
                  <dt>Средний вклад</dt>
                  <dd>
                    {summary.count
                      ? formatPaymentAmount(
                          Math.round(summary.receivedMinor / summary.count),
                        )
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Крупнейший вклад</dt>
                  <dd>{largest ? formatPaymentAmount(largest) : '—'}</dd>
                </div>
              </dl>
            </aside>
          </div>

          {summary.excludedCurrencies > 0 && (
            <p className="payment-hint">
              Платежи в других валютах не включены в рублёвую статистику.
            </p>
          )}

          <section
            className="payments-ledger"
            aria-labelledby="payments-ledger-title"
          >
            <div className="payments-ledger-heading">
              <div>
                <span className="payments-section-kicker">ПОЛНАЯ ИСТОРИЯ</span>
                <h3 id="payments-ledger-title">
                  Платежи за период{' '}
                  <span className="payments-record-count">{rows.length}</span>
                </h3>
              </div>
              <span className="payments-ledger-meta">
                <Clock3 aria-hidden="true" />
                Обновление каждые 30 сек.
              </span>
            </div>
            <div className="payments-ledger-toolbar">
              <label className="payments-search">
                <Search aria-hidden="true" />
                <span className="sr-only">Поиск платежей</span>
                <input
                  type="search"
                  placeholder="Проект, номер заказа или ID платежа"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <label className="staff-field payments-status-filter">
                Статус платежа
                <select
                  value={status}
                  onChange={(event) => filterStatus(event.target.value)}
                >
                  <option value="all">Все статусы</option>
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {activeMonth && (
              <div className="payments-active-filter">
                <CalendarDays aria-hidden="true" />
                {fullMonth.format(new Date(activeMonth + '-01T00:00:00Z'))}
                <button
                  type="button"
                  aria-label="Показать все месяцы периода"
                  onClick={() => {
                    setActiveMonth(null);
                    setPage(1);
                  }}
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            )}
            {!rows.length ? (
              <div className="payments-empty">
                <Search aria-hidden="true" />
                <h4>Подходящих платежей нет</h4>
                <p>Измените фильтры или выберите другой период.</p>
                {(search || status !== 'all' || activeMonth) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                      setActiveMonth(null);
                      setPage(1);
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="payment-table-wrap">
                  <table
                    className="payment-table"
                    aria-label="Реестр платежей"
                    role="table"
                  >
                    <thead>
                      <tr>
                        <th scope="col">Дата и время</th>
                        <th scope="col">Платёж</th>
                        <th scope="col">Проект</th>
                        <th scope="col">Сумма</th>
                        <th scope="col">Статус</th>
                        <th scope="col">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows
                        .slice(
                          (currentPage - 1) * pageSize,
                          currentPage * pageSize,
                        )
                        .map((row) => (
                          <tr key={row.id}>
                            <td data-label="Дата и время" data-cell="date">
                              <time dateTime={row.paidAt ?? row.createdAt}>
                                {dayName.format(
                                  new Date(row.paidAt ?? row.createdAt),
                                )}
                                <small>
                                  {timeName.format(
                                    new Date(row.paidAt ?? row.createdAt),
                                  )}
                                </small>
                              </time>
                            </td>
                            <td data-label="Платёж" data-cell="payment">
                              <strong className="payment-order-number">
                                {row.providerId
                                  ? `№ ${row.providerId}`
                                  : 'Без номера заказа'}
                              </strong>
                              <small title={row.id}>
                                ID {row.id.slice(0, 8)}
                              </small>
                            </td>
                            <td data-label="Проект" data-cell="project">
                              <strong>{row.project}</strong>
                            </td>
                            <td data-label="Сумма" data-cell="amount">
                              <strong>
                                {formatPaymentAmount(row.amountMinor)}
                              </strong>
                              {row.refundedMinor > 0 && (
                                <small>
                                  Возврат{' '}
                                  {formatPaymentAmount(row.refundedMinor)}
                                </small>
                              )}
                            </td>
                            <td data-label="Статус" data-cell="status">
                              <StateBadge row={row} />
                            </td>
                            <td data-cell="actions">
                              <div className="payment-row-actions">
                                <Button
                                  variant="outline"
                                  disabled={action.pending || !row.providerId}
                                  onClick={() => synchronize(row)}
                                  aria-label={'Сверить платёж ' + row.id}
                                >
                                  <RefreshCw aria-hidden="true" />
                                  Сверить
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDetailId(row.id)}
                                  aria-label={'Подробнее о платеже ' + row.id}
                                >
                                  <ArrowUpRight aria-hidden="true" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <nav
                  className="payment-pagination"
                  aria-label="Страницы платежей"
                >
                  <span className="payments-page-summary">
                    Показано {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, rows.length)} из{' '}
                    {rows.length}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <ChevronLeft aria-hidden="true" />
                    Назад
                  </Button>
                  <span>
                    {currentPage} / {pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === pages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Далее
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </nav>
              </>
            )}
          </section>
        </>
      )}

      <Dialog
        open={Boolean(detailId)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent className="payment-detail-dialog">
          <span className="payments-section-kicker">КАРТОЧКА ОПЕРАЦИИ</span>
          <DialogTitle>
            {inspected?.providerId
              ? `Заказ № ${inspected.providerId}`
              : 'Платёж фонда'}
          </DialogTitle>
          <DialogDescription>
            Данные операции и её связь с проектом.
          </DialogDescription>
          {inspected ? (
            <>
              <div className="payment-detail-amount">
                <strong>
                  {formatPaymentAmount(
                    inspected.amountMinor,
                    inspected.currency,
                  )}
                </strong>
                <StateBadge row={inspected} />
              </div>
              <div className="payment-detail-project">
                <FolderHeart aria-hidden="true" />
                <div>
                  <small>Проект пожертвования</small>
                  <strong>{inspected.project}</strong>
                </div>
              </div>
              <dl className="payment-detail-facts">
                <div>
                  <dt>Создан</dt>
                  <dd>{dateName.format(new Date(inspected.createdAt))}</dd>
                </div>
                <div>
                  <dt>Дата оплаты</dt>
                  <dd>
                    {inspected.paidAt
                      ? dateName.format(new Date(inspected.paidAt))
                      : 'Подтверждение не получено'}
                  </dd>
                </div>
                <div>
                  <dt>Номер заказа банка</dt>
                  <dd>{inspected.providerId ?? 'Номер заказа не получен'}</dd>
                </div>
                <div>
                  <dt>ID платежа</dt>
                  <dd>{inspected.id}</dd>
                </div>
                <div>
                  <dt>ID пожертвования</dt>
                  <dd>{inspected.donationId}</dd>
                </div>
                <div>
                  <dt>ID проекта</dt>
                  <dd>{inspected.projectId ?? 'Проект недоступен'}</dd>
                </div>
                {inspected.refundedMinor > 0 && (
                  <div>
                    <dt>Завершённые возвраты</dt>
                    <dd>{formatPaymentAmount(inspected.refundedMinor)}</dd>
                  </div>
                )}
              </dl>
              {inspected.status === 'pending' && (
                <p className="payment-detail-note">
                  <Info aria-hidden="true" />
                  {inspected.providerId
                    ? 'Если оплата уже прошла, сверьте операцию с банком. Уведомление об оплате могло ещё не поступить.'
                    : 'Номер заказа процессинга не получен. Эта запись хранит попытку оформления платежа.'}
                </p>
              )}
              {(action.error || action.notice) && (
                <StaffFeedback error={action.error} notice={action.notice} />
              )}
              {inspected.providerId && (
                <Button
                  variant="outline"
                  disabled={action.pending}
                  onClick={() => synchronize(inspected)}
                >
                  <RefreshCw aria-hidden="true" />
                  Сверить с банком
                </Button>
              )}
              {!inspected.providerId && (
                <p className="payment-hint">
                  <CircleHelp aria-hidden="true" />
                  Сверка станет доступна после получения номера банковского
                  заказа.
                </p>
              )}
            </>
          ) : (
            <p>Операция больше не отображается в текущем реестре.</p>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
