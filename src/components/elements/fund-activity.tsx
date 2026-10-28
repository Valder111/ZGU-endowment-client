import { useId, useState } from 'react';
import {
  Coins,
  HeartHandshake,
  Layers3,
  Landmark,
  ArrowUpRight,
} from 'lucide-react';
import { fundActivity, fundActivitySummary } from '@/constants/fund-activity';
import { SiteLink } from '@/components/elements/site-link';

const icons = [Coins, HeartHandshake, Layers3, Landmark];
const formatValue = (value: number | null) =>
  value === null
    ? '—'
    : new Intl.NumberFormat('ru-RU', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value);

export function FundActivity() {
  const [selected, setSelected] = useState(0);
  const panelId = useId();
  const current = fundActivity[selected] ?? fundActivity[0];
  const progress = Math.min(
    100,
    Math.max(0, (fundActivity[0].value / fundActivitySummary.target) * 100),
  );
  const markerAngle = (((progress / 100) * 360 - 90) * Math.PI) / 180;
  return (
    <section
      className="fund-activity"
      id="fund-activity"
      aria-labelledby={`${panelId}-heading`}
    >
      <div className="wrap">
        <div className="activity-heading">
          <div>
            <span className="eyebrow">ОТ УЧАСТИЯ К РЕЗУЛЬТАТАМ</span>
            <h2 id={`${panelId}-heading`}>Показатели деятельности</h2>
          </div>
          <span className="activity-status">
            <span aria-hidden="true" />
            {fundActivitySummary.isDemo
              ? 'Демонстрационные данные'
              : 'По данным отчётности фонда'}
          </span>
        </div>
        <div className="activity-layout">
          <div
            className="activity-metrics"
            role="group"
            aria-label="Выберите показатель фонда"
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
                  <span className="metric-value">
                    {formatValue(metric.value)}
                    {metric.value !== null && metric.unit && (
                      <small> {metric.unit}</small>
                    )}
                  </span>
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-availability">
                    {metric.value === null
                      ? 'Ожидаем подтверждённые данные'
                      : fundActivitySummary.isDemo
                        ? 'Демонстрационный пример'
                        : 'По данным отчётности фонда'}
                  </span>
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
                {selected === 0 ? (
                  <g className="dial-funding">
                    <circle
                      cx="160"
                      cy="160"
                      r="120"
                      pathLength="100"
                      strokeDasharray={`${progress} 100`}
                      transform="rotate(-90 160 160)"
                    />
                    <circle
                      cx={160 + 120 * Math.cos(markerAngle)}
                      cy={160 + 120 * Math.sin(markerAngle)}
                      r="7"
                    />
                  </g>
                ) : (
                  <g
                    className="dial-selection"
                    style={{ transform: `rotate(${selected * 90}deg)` }}
                  >
                    <path d="M75.15 75.15a120 120 0 0 1 169.7 0" />
                    <circle cx="160" cy="40" r="7" />
                  </g>
                )}
                <g className="dial-star">
                  <path d="m160 8 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" />
                </g>
              </svg>
              <div className="activity-dial-value">
                <strong key={current.id}>{formatValue(current.value)}</strong>
                <span>
                  {current.value === null
                    ? 'ДАННЫЕ ГОТОВЯТСЯ'
                    : current.unit || 'УСЛОВНЫЙ ПРИМЕР'}
                </span>
                {selected === 0 && (
                  <small>{Math.round(progress)}% от цели</small>
                )}
              </div>
            </div>
            <div
              id={panelId}
              className="activity-stories"
              role="region"
              aria-label="О показателе"
              aria-live="polite"
              aria-atomic="true"
            >
              {fundActivity.map((metric, index) => (
                <div
                  key={metric.id}
                  className="activity-story"
                  data-active={selected === index}
                >
                  <span className="eyebrow">0{index + 1} / ОРИЕНТИР ФОНДА</span>
                  <h3>{metric.label}</h3>
                  {index === 0 && (
                    <p className="activity-target">
                      Цель сбора:{' '}
                      <strong>
                        {formatValue(fundActivitySummary.target)} ₽
                      </strong>
                      <span>Достигнуто {Math.round(progress)}%</span>
                    </p>
                  )}
                  <p>{metric.description}</p>
                  <small>{metric.detail}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="activity-bottom">
          <p>
            {fundActivitySummary.isDemo
              ? 'Все суммы и количества условные: это пример заполнения, а не фактические результаты деятельности фонда.'
              : 'Подтверждённые результаты фонда. Подробные данные доступны в отчётности.'}
          </p>
          <SiteLink href="/about/reporting/" className="text-link">
            Отчётность фонда <ArrowUpRight size={17} aria-hidden="true" />
          </SiteLink>
        </div>
      </div>
    </section>
  );
}
