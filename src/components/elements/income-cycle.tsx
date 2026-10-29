import { useId, useState } from 'react';
import { incomeCycle } from '@/constants/transparency';
import { SiteLink } from '@/components/elements/site-link';
import { readableText } from '@/utils/typography';

export function IncomeCycle() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  return (
    <section
      className="income-cycle editorial-section"
      aria-labelledby={`${id}-title`}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">ОТ&nbsp;РЕШЕНИЯ К&nbsp;РЕЗУЛЬТАТУ</span>
          <h2 id={`${id}-title`}>Как доход становится поддержкой</h2>
        </div>
        <p>Последовательность решений в&nbsp;течение отчётного цикла</p>
      </div>
      <ol className="cycle-steps">
        {incomeCycle.map((step, index) => (
          <li key={step.title} data-active={selected === index}>
            <button
              type="button"
              aria-pressed={selected === index}
              aria-controls={`${id}-step-${index}`}
              onClick={() => setSelected(index)}
            >
              <span className="cycle-number">0{index + 1}</span>
              <span>{readableText(step.title)}</span>
            </button>
            <div id={`${id}-step-${index}`} className="cycle-description">
              <span className="eyebrow">{step.who}</span>
              <p>{readableText(step.text)}</p>
              <strong>{readableText(step.result)}</strong>
            </div>
          </li>
        ))}
      </ol>
      <p className="section-note">
        Показана общая модель. Порядок работы фонда определяется утверждёнными
        документами.{' '}
        <SiteLink href="/about/reporting/">К&nbsp;отчётности ↗</SiteLink>
      </p>
    </section>
  );
}
