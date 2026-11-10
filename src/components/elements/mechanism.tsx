import { useId, useState } from 'react';
import { ProcessIcon } from '@/assets/svg/process-icon';
import { mechanismSteps } from '@/constants/mechanism';
import { SiteLink } from '@/components/elements/site-link';

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
              Вклад сегодня –
              <br />
              возможности навсегда
            </h2>
          </div>
          <p>
            Эндаумент объединяет университет,
            <br />
            выпускников и&nbsp;партнёров
            <br />
            вокруг общих целей.
          </p>
        </div>
        <div className="steps interactive-steps">
          <div
            className="steps-progress"
            aria-hidden="true"
            style={{
              width: `${((selected + 1) / mechanismSteps.length) * 100}%`,
            }}
          />
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
          <div className="journey-indicator">
            <span>МАРШРУТ ВАШЕГО ВКЛАДА</span>
            <div
              className="journey-controls"
              role="group"
              aria-label="Маршрут вашего вклада"
            >
              {mechanismSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  aria-pressed={selected === index}
                  aria-controls={`${instanceId}-${step.id}`}
                  onClick={() => setSelected(index)}
                >
                  <span className="journey-dot" aria-hidden="true" />
                  {step.label}
                </button>
              ))}
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
        <SiteLink className="text-link" href="/about/reporting/">
          Как распределяется доход ↗
        </SiteLink>
      </div>
    </section>
  );
}
