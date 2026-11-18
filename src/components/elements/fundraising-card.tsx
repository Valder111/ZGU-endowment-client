import { fundraising } from '@/constants/fund-activity';
import {
  formatPaymentAmount,
  type ProgressTotal,
  type FundTotal,
} from '@/api/payments';
import { useDonationProgress } from '@/hooks/requests/queries/use-donation-progress';
import { formatRubles } from '@/utils/typography';

const publishedTotals: FundTotal = {
  collectedMinor: fundraising.collected * 100,
  targetMinor: fundraising.target * 100,
};
const formatPercent = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

export function LiveFundraisingCard() {
  const { data } = useDonationProgress();
  return <FundraisingCard totals={data?.fund} />;
}

function ProgressIndicator({
  collectedMinor,
  targetMinor,
}: {
  collectedMinor: number;
  targetMinor: number;
}) {
  return (
    <div className="fundraising-progress">
      <progress
        value={Math.min(collectedMinor, targetMinor) / 100}
        max={targetMinor / 100}
        aria-label="Прогресс сбора"
        aria-valuetext={`${formatPaymentAmount(collectedMinor)} из ${formatPaymentAmount(targetMinor)}`}
      />
      <span>{`${formatPercent.format((collectedMinor / targetMinor) * 100)}% от\u00a0цели`}</span>
    </div>
  );
}

export function ProjectFundraising({ totals }: { totals?: ProgressTotal }) {
  if (!totals) return null;
  return (
    <div className="project-funding-meter">
      <dl>
        <div>
          <dt>Собрано</dt>
          <dd>
            {totals.collectedMinor === null
              ? '—'
              : formatPaymentAmount(totals.collectedMinor)}
          </dd>
        </div>
        {totals.targetMinor !== null && (
          <div>
            <dt>Цель</dt>
            <dd>{formatPaymentAmount(totals.targetMinor)}</dd>
          </div>
        )}
      </dl>
      {totals.targetMinor !== null &&
        totals.targetMinor > 0 &&
        totals.collectedMinor !== null && (
          <ProgressIndicator
            collectedMinor={totals.collectedMinor}
            targetMinor={totals.targetMinor}
          />
        )}
      {totals.collectedMinor === null && (
        <p className="payment-hint">
          Информация о поступлениях уточняется фондом.
        </p>
      )}
    </div>
  );
}

export function FundraisingCard({
  totals = publishedTotals,
}: {
  totals?: FundTotal;
}) {
  const displayAmount = (minor: number) =>
    minor % 100 === 0 ? formatRubles(minor / 100) : formatPaymentAmount(minor);
  return (
    <div
      className="fundraising-summary"
      role="group"
      aria-label="Сбор целевого капитала"
    >
      <dl className="fundraising-amounts">
        <div>
          <dt>Собрано</dt>
          <dd>
            {totals.collectedMinor === null
              ? '—'
              : displayAmount(totals.collectedMinor)}
          </dd>
        </div>
        {totals.targetMinor !== null && (
          <div>
            <dt>Цель сбора</dt>
            <dd>{displayAmount(totals.targetMinor)}</dd>
          </div>
        )}
      </dl>
      {totals.targetMinor !== null &&
        totals.targetMinor > 0 &&
        totals.collectedMinor !== null && (
          <ProgressIndicator
            collectedMinor={totals.collectedMinor}
            targetMinor={totals.targetMinor}
          />
        )}
      {totals.collectedMinor === null && (
        <p className="payment-hint">
          Информация о поступлениях уточняется фондом.
        </p>
      )}
    </div>
  );
}
