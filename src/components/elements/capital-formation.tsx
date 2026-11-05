import {
  ArrowDown,
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  Landmark,
  RefreshCw,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import illustration from '@/assets/images/editorial/capital-illustration.webp';

const steps = [
  {
    title: 'Жертвователи',
    description:
      'Выпускники, друзья и партнёры вносят средства по договору пожертвования или оферте.',
    icon: HeartHandshake,
  },
  {
    title: 'Целевой капитал',
    description:
      'Фонд собирает взносы на отдельном банковском счёте. Совет определяет направления использования дохода.',
    icon: Landmark,
  },
  {
    title: 'Управляющая компания',
    description:
      'Фонд передаёт сформированный капитал в доверительное управление по договору.',
    icon: Wallet,
  },
  {
    title: 'Доход от управления',
    description:
      'Компания инвестирует капитал. Полученный доход может пополнить капитал или пойти на программы ЗГУ.',
    icon: TrendingUp,
  },
];

export function CapitalHorizon() {
  return (
    <div className="capital-horizon">
      <span className="eyebrow">ГОРИЗОНТ РАЗВИТИЯ</span>
      <p>
        <strong>Сейчас – формирование капитала.</strong> До&nbsp;2029 года
        планируется реинвестирование дохода, затем – переход к&nbsp;поддержке
        приоритетных программ университета.
      </p>
    </div>
  );
}

export function CapitalFormation() {
  return (
    <section
      className="capital-formation editorial-section"
      id="capital-formation"
      aria-labelledby="capital-formation-title"
    >
      <span className="eyebrow">ОТ ПОЖЕРТВОВАНИЯ К ПОДДЕРЖКЕ</span>
      <h2 id="capital-formation-title">Схема формирования целевого капитала</h2>
      <ol className="flow-grid">
        {steps.map(({ title, description, icon: Icon }, index) => (
          <li key={title}>
            <div className="flow-step-mark" aria-hidden="true">
              <Icon size={28} />
              <span>0{index + 1}</span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            {index < steps.length - 1 && (
              <span className="flow-arrow" aria-hidden="true">
                <ArrowRight />
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="flow-outcomes">
        <p>
          <ArrowDown size={18} aria-hidden="true" /> Куда направляется доход
        </p>
        <div className="flow-outcome-grid">
          <div>
            <RefreshCw size={23} aria-hidden="true" />
            <h3>Возвращается в капитал</h3>
            <p>Реинвестирование увеличивает основу будущей поддержки.</p>
          </div>
          <div>
            <GraduationCap size={23} aria-hidden="true" />
            <h3>Поддерживает программы ЗГУ</h3>
            <p>
              Доход помогает финансировать приоритетные программы университета.
            </p>
          </div>
        </div>
      </div>
      <CapitalHorizon />
      <a
        className="text-link capital-formation-original"
        href={illustration}
        target="_blank"
        rel="noopener"
      >
        Иллюстрированный пример для капитала «Наука» ↗
      </a>
    </section>
  );
}
