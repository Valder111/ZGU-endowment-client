import { useId, useState } from 'react';
import { ProcessIcon } from '@/assets/svg/process-icon';
import { mechanismSteps } from '@/constants/mechanism';

export function Mechanism() {
  const [selected, setSelected] = useState(0);
  const instanceId = useId();
  return (
    <section
      className="section mechanism"
      id="mechanism"
      aria-label="Как работает эндаумент"
    >
      <div className="wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <span className="section-number">03 /</span> ДОЛГОСРОЧНАЯ
              ПОДДЕРЖКА
            </span>
            <h2>
              Вклад сегодня.
              <br />
              Возможности навсегда.
            </h2>
          </div>
          <p>
            Эндаумент объединяет университет,
            <br />
            выпускников и партнёров
            <br />
            вокруг общих целей.
          </p>
        </div>
        <div className="steps interactive-steps">
          <div className="steps-progress" aria-hidden="true"></div>
          {mechanismSteps.map((step, index) => (
            <article key={step.id} data-active={selected === index}>
              <span>
                {step.number} / {step.label.toLocaleUpperCase('ru')}
              </span>
              <div className="mechanism-art">
                <ProcessIcon stage={step.id} />
              </div>
              <h3>
                {step.title[0]}
                <br />
                {step.title[1]}
              </h3>
              <p>{step.summary}</p>
              <button
                className="step-action"
                type="button"
                aria-label={`Подробнее об этапе: ${step.label}`}
                aria-pressed={selected === index}
                aria-controls={`${instanceId}-${step.id}`}
                onClick={() => setSelected(index)}
              >
                Рассмотреть этап <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
        <div className="journey-explanation">
          <div className="journey-indicator" aria-hidden="true">
            <span>МАРШРУТ ВАШЕГО ВКЛАДА</span>
            <svg viewBox="0 0 260 84" fill="none">
              <path d="M35 42h190" />
              {[35, 130, 225].map((x, index) => (
                <g key={x} className={selected === index ? 'is-active' : ''}>
                  <circle cx={x} cy="42" r="10" />
                  <path d={`M${x - 3} 42h6m-3-3v6`} />
                </g>
              ))}
              <g
                className="journey-marker"
                style={{
                  transform: `translate(${35 + selected * 95}px, 42px)`,
                }}
              >
                <circle r="17" />
                <circle r="5" />
              </g>
            </svg>
            <div>
              <span>Вклад</span>
              <span>Капитал</span>
              <span>Развитие</span>
            </div>
          </div>
          <div
            className="journey-stories"
            aria-live="polite"
            aria-atomic="true"
          >
            {mechanismSteps.map((step, index) => (
              <div
                className="journey-story"
                key={step.id}
                id={`${instanceId}-${step.id}`}
                data-active={selected === index}
                role="region"
                aria-label={`Подробнее: ${step.label}`}
              >
                <span className="eyebrow">
                  {step.number} / {step.label}
                </span>
                <h3>{step.heading}</h3>
                <p>{step.description}</p>
                <small>{step.note}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
