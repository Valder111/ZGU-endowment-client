import {
  ArrowDown,
  ArrowRight,
  HeartHandshake,
  Landmark,
  TrendingUp,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import { SiteLink } from '@/components/elements/site-link';

const steps = [
  {
    icon: HeartHandshake,
    title: 'Ваш вклад',
    text: 'Пожертвования выпускников, друзей и партнёров объединяются вокруг будущего университета.',
  },
  {
    icon: Landmark,
    title: 'Целевой капитал',
    text: 'Средства формируют долгосрочную основу поддержки. Капитал передаётся в доверительное управление.',
  },
  {
    icon: TrendingUp,
    title: 'Управляющая компания',
    text: 'Профессиональная компания инвестирует капитал на условиях договора с фондом.',
  },
  {
    icon: RefreshCw,
    title: 'Доход капитала',
    text: 'Результат управления становится основой для реинвестирования и планирования поддержки.',
  },
  {
    icon: GraduationCap,
    title: 'Развитие университета',
    text: 'Доход помогает поддерживать таланты, исследования, инфраструктуру и связь поколений.',
  },
];

export function EndowmentFlow() {
  return (
    <section
      className="endowment-flow editorial-section"
      id="endowment-flow"
      aria-labelledby="endowment-flow-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">ПОНЯТНО О ГЛАВНОМ</span>
          <h2 id="endowment-flow-title">
            Ваш вклад.
            <br />
            <span className="muted">Его продолжение</span>
          </h2>
        </div>
        <p>
          Эндаумент превращает участие сегодня в&nbsp;источник поддержки
          на&nbsp;долгие годы.
        </p>
      </div>
      <ol className="flow-grid">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title}>
              <span className="flow-order">0{index + 1}</span>
              <Icon className="flow-icon" size={36} aria-hidden="true" />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {index < steps.length - 1 && (
                <span className="flow-arrow" aria-hidden="true">
                  <ArrowRight />
                  <ArrowDown />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flow-return">
        <RefreshCw aria-hidden="true" size={24} />
        <p>
          <strong>Доход может возвращаться в&nbsp;капитал.</strong>{' '}
          Реинвестирование помогает наращивать основу будущей поддержки.
        </p>
        <SiteLink className="text-link" href="/about/company-information/">
          Об управлении ↗
        </SiteLink>
      </div>
      <div className="capital-horizon">
        <span className="eyebrow">ГОРИЗОНТ РАЗВИТИЯ</span>
        <p>
          <strong>Сейчас – формирование капитала.</strong> До&nbsp;2029 года
          планируется реинвестирование дохода; затем – переход к&nbsp;поддержке
          программ по&nbsp;решениям фонда.
        </p>
      </div>
    </section>
  );
}
