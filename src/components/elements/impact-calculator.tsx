import { useId, useState } from 'react';
import { formatRubles, formatYears } from '@/utils/typography';

export function ImpactCalculator() {
  const id = useId();
  const [capital, setCapital] = useState(100_000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(10);
  const annual = Math.round((capital * rate) / 100);
  return (
    <section
      className="impact-calculator editorial-section"
      aria-labelledby={`${id}-title`}
    >
      <div className="calculator-copy">
        <span className="eyebrow">КАЛЬКУЛЯТОР ПОДДЕРЖКИ</span>
        <h2 id={`${id}-title`}>Долгий горизонт поддержки</h2>
        <p>
          Посмотрите, как сумма капитала и&nbsp;выбранная ставка связаны
          с&nbsp;возможным доходом для программ.
        </p>
        <p className="risk-note">
          Расчёт по&nbsp;заданным параметрам. Доходность не&nbsp;гарантирована,
          стоимость капитала может снижаться.
        </p>
      </div>
      <div className="calculator-controls">
        <label htmlFor={`${id}-capital`}>
          Сумма капитала <strong>{formatRubles(capital)}</strong>
        </label>
        <input
          id={`${id}-capital`}
          type="range"
          min="1000"
          max="1000000"
          step="1000"
          value={capital}
          onChange={(event) => setCapital(Number(event.target.value))}
          aria-valuetext={formatRubles(capital)}
        />
        <label htmlFor={`${id}-rate`}>
          Ставка для расчёта в&nbsp;год <strong>{rate}%</strong>
        </label>
        <input
          id={`${id}-rate`}
          type="range"
          min="-10"
          max="15"
          step="1"
          value={rate}
          onChange={(event) => setRate(Number(event.target.value))}
          aria-valuetext={`${rate} процентов`}
        />
        <label htmlFor={`${id}-years`}>
          Горизонт расчёта <strong>{formatYears(years)}</strong>
        </label>
        <input
          id={`${id}-years`}
          type="range"
          min="1"
          max="20"
          step="1"
          value={years}
          onChange={(event) => setYears(Number(event.target.value))}
        />
        <div
          className="calculator-results"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>
            {annual < 0
              ? 'Расчётное снижение за год'
              : 'Расчётный доход за год'}
            <strong data-testid="annual-income">{formatRubles(annual)}</strong>
          </span>
          <span>
            За&nbsp;выбранный период
            <strong data-testid="total-income">
              {formatRubles(annual * years)}
            </strong>
          </span>
        </div>
        <p className="section-note">
          Сумма × ставка ÷ 100 × количество лет. Постоянные сумма и&nbsp;ставка,
          без реинвестирования, комиссий, налогов и&nbsp;инфляции. При
          отрицательном результате модель показывает снижение, а&nbsp;не
          средства для распределения.
        </p>
      </div>
    </section>
  );
}
