import { useId, useState } from 'react';
import { ArrowUpRight, Landmark, Users, Award, Handshake } from 'lucide-react';
import { supportAudiences, supportMethods } from '@/constants/support';
import { projects } from '@/constants/projects';
import { siteConfig } from '@/configs/site';
import { SiteLink } from '@/components/elements/site-link';
import { ImpactCalculator } from '@/components/elements/impact-calculator';
import { readableText } from '@/utils/typography';

const methodIcons = [Landmark, Users, Award, Handshake];
export function SupportContent() {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState('Общее развитие университета');
  const audience = supportAudiences[selected] ?? supportAudiences[0];
  const emailHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent(audience.subject)}&body=${encodeURIComponent(`Здравствуйте!\n\nМеня интересует направление «${direction}». Хочу обсудить условия участия, договор пожертвования и доступные способы поддержки.\n\nМой вопрос: `)}`;
  return (
    <div className="wrap article-content">
      <div className="support-intro">
        <span className="eyebrow">УЧАСТВОВАТЬ МОЖЕТ КАЖДЫЙ</span>
        <h2>Выберите удобный путь</h2>
        <p className="lead">
          Найдите свой формат: личное участие, поддержка вместе
          с&nbsp;однокурсниками или корпоративное партнёрство
        </p>
      </div>
      <div
        className="support-selector"
        role="group"
        aria-label="Кто хочет поддержать фонд"
      >
        {supportAudiences.map((item, index) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={selected === index}
            aria-controls={`${id}-${item.id}`}
            onClick={() => setSelected(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="support-paths">
        {supportAudiences.map((item, index) => (
          <section
            className="support-path"
            key={item.id}
            id={`${id}-${item.id}`}
            data-active={selected === index}
            aria-label={item.label}
          >
            <div>
              <span className="eyebrow">0{index + 1} / ВАШ МАРШРУТ</span>
              <h2>{readableText(item.title)}</h2>
              <p>{readableText(item.text)}</p>
            </div>
            <ol>
              {item.steps.map((step, i) => (
                <li key={step}>
                  <span>0{i + 1}</span>
                  {readableText(step)}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <section className="support-enquiry" aria-labelledby={`${id}-enquiry`}>
        <div>
          <h3 id={`${id}-enquiry`}>Начните с&nbsp;разговора</h3>
          <p>
            Обратитесь в&nbsp;ЗГУ, чтобы связаться с&nbsp;командой фонда. Кнопка
            «Обсудить участие» откроет письмо в&nbsp;почтовой программе.
          </p>
        </div>
        <div>
          <label htmlFor={`${id}-direction`}>
            Что вы&nbsp;хотите поддержать?
          </label>
          <select
            id={`${id}-direction`}
            value={direction}
            onChange={(event) => setDirection(event.target.value)}
          >
            <option>Общее развитие университета</option>
            {projects.map((project) => (
              <option key={project.id}>{project.title}</option>
            ))}
            <option>Именной или корпоративный капитал</option>
          </select>
          <a href={emailHref} className="button primary">
            Обсудить участие <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section className="editorial-section" aria-label="Форматы поддержки">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ФОРМАТЫ ПОДДЕРЖКИ</span>
            <h2>От&nbsp;идеи до&nbsp;пожертвования</h2>
          </div>
          <p>Цель, условия и&nbsp;документы согласуем при обсуждении участия</p>
        </div>
        <div className="support-methods">
          {supportMethods.map((method, index) => {
            const Icon = methodIcons[index] ?? Handshake;
            return (
              <article key={method.title}>
                <Icon size={30} aria-hidden="true" />
                <h3>{method.title}</h3>
                <p>{readableText(method.text)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <div className="practical-links">
        <SiteLink href="/about/constituent-the-documents/">
          Документы и&nbsp;реквизиты ↗
        </SiteLink>
        <SiteLink href="/answers-on-questions/">
          Ответы на&nbsp;вопросы ↗
        </SiteLink>
        <SiteLink href="/philanthropists/history/">
          Выпускникам и&nbsp;партнёрам ↗
        </SiteLink>
      </div>
      <ImpactCalculator />
    </div>
  );
}
