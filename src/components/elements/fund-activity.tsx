import { useId, useState } from 'react';
import {
  Coins,
  HeartHandshake,
  Layers3,
  Landmark,
  ArrowUpRight,
} from 'lucide-react';
import { fundActivity, fundraising } from '@/constants/fund-activity';
import { SiteLink } from '@/components/elements/site-link';
import { formatRubles, readableText } from '@/utils/typography';

const icons = [Coins, HeartHandshake, Layers3, Landmark];

export function FundActivity() {
  const [selected, setSelected] = useState(0);
  const panelId = useId();
  const current = fundActivity[selected] ?? fundActivity[0];
  const progress = Math.min(
    100,
    Math.max(0, (fundraising.collected / fundraising.target) * 100),
  );
  return (
    <section
      className="fund-activity"
      id="fund-activity"
      aria-labelledby={`${panelId}-heading`}
    >
      <div className="wrap">
        <div className="activity-heading">
          <div>
            <span className="eyebrow">СМЫСЛ КАЖДОГО ВКЛАДА</span>
            <h2 id={`${panelId}-heading`}>Вместе развиваем университет</h2>
          </div>
        </div>
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
            <span>{Math.round(progress)}% от&nbsp;цели</span>
          </div>
        </div>
        <div className="activity-layout">
          <div
            className="activity-metrics"
            role="group"
            aria-label="О поддержке университета"
          >
            {fundActivity.map((metric, index) => {
              const Icon = icons[index] ?? Coins;
              return (
                <button
                  className="metric-card"
                  key={metric.id}
                  type="button"
                  aria-pressed={selected === index}
                  aria-controls={panelId}
                  onClick={() => setSelected(index)}
                >
                  <span className="metric-card-top">
                    <Icon size={23} aria-hidden="true" />
                    <span aria-hidden="true">
                      0{index + 1}
                      <ArrowUpRight size={17} />
                    </span>
                  </span>
                  <span className="metric-value">{metric.value}</span>
                  <span className="metric-label">{metric.label}</span>
                </button>
              );
            })}
          </div>
          <div className="activity-focus">
            <div className="activity-dial" aria-hidden="true">
              <svg viewBox="0 0 320 320" fill="none">
                <circle className="dial-halo" cx="160" cy="160" r="147" />
                <circle cx="160" cy="160" r="120" />
                <circle className="dial-inner" cx="160" cy="160" r="99" />
                {[0, 1, 2, 3].map((i) => (
                  <g key={i} transform={`rotate(${i * 90} 160 160)`}>
                    <path d="M160 31v18" />
                    <circle cx="160" cy="40" r="3" />
                  </g>
                ))}
                <g
                  className="dial-selection"
                  style={{ transform: `rotate(${selected * 90}deg)` }}
                >
                  <path d="M75.15 75.15a120 120 0 0 1 169.7 0" />
                  <circle cx="160" cy="40" r="7" />
                </g>
                <g className="dial-star">
                  <path d="m160 8 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" />
                </g>
              </svg>
              <div className="activity-dial-value">
                <strong key={current.id}>{current.value}</strong>
                <span>{current.unit}</span>
              </div>
            </div>
            <div
              id={panelId}
              className="activity-stories"
              role="region"
              aria-label="О выбранной теме"
              aria-live="polite"
              aria-atomic="true"
            >
              {fundActivity.map((metric, index) => (
                <div
                  key={metric.id}
                  className="activity-story"
                  data-active={selected === index}
                >
                  <span className="eyebrow">0{index + 1} / ВАШЕ УЧАСТИЕ</span>
                  <h3>{metric.label}</h3>
                  <p>{readableText(metric.description)}</p>
                  <small>{readableText(metric.detail)}</small>
                  <SiteLink href={metric.href} className="text-link">
                    {metric.link} <ArrowUpRight size={17} aria-hidden="true" />
                  </SiteLink>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="activity-bottom">
          <p>
            Участие начинается с&nbsp;близкой вам идеи. Продолжение —
            в&nbsp;образовании, науке и&nbsp;новых связях.
          </p>
          <SiteLink href="/about/reporting/" className="text-link">
            Отчётность фонда <ArrowUpRight size={17} aria-hidden="true" />
          </SiteLink>
        </div>
      </div>
    </section>
  );
}
