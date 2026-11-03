import { fundraising } from '@/constants/fund-activity';
import { formatRubles } from '@/utils/typography';

export function FundraisingCard() {
  const progress = Math.min(
    100,
    Math.max(0, (fundraising.collected / fundraising.target) * 100),
  );
  return (
    <div
      className="fundraising-summary"
      role="group"
      aria-label="Сбор целевого капитала"
    >
      <dl className="fundraising-amounts">
        <div>
          <dt>Собрано</dt>
          <dd>{formatRubles(fundraising.collected)}</dd>
        </div>
        <div>
          <dt>Цель сбора</dt>
          <dd>{formatRubles(fundraising.target)}</dd>
        </div>
      </dl>
      <div className="fundraising-progress">
        <progress
          value={fundraising.collected}
          max={fundraising.target}
          aria-label="Прогресс сбора"
          aria-valuetext={`${formatRubles(fundraising.collected)} из ${formatRubles(fundraising.target)}`}
        />
        <span>
          {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(
            progress,
          )}
          % от&nbsp;цели
        </span>
      </div>
    </div>
  );
}
