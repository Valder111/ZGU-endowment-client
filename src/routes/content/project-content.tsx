import { projects } from '@/constants/projects';
import { DonateButton } from '@/components/elements/donate-button';
import type { ProjectId } from '@/types/content';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
import { projectFocus } from '@/constants/visual-content';
import { SiteLink } from '@/components/elements/site-link';
import { formatRubles, readableText } from '@/utils/typography';
const programExamples = {
  students: {
    title: 'Стипендиальная программа',
    budget: 600_000,
    calculation: '10 студентов × 5 000 рублей × 12 месяцев',
    result:
      'Годовая поддержка десяти студентов для учёбы и профессионального развития',
  },
  science: {
    title: 'Молодые исследователи Арктики',
    budget: 300_000,
    calculation: '3 исследовательские команды × 100 000 рублей',
    result:
      'Материалы, полевые работы и проверка гипотез по задачам северных территорий',
  },
  campus: {
    title: 'Пространство совместной работы',
    budget: 150_000,
    calculation: '10 мастерских и встреч × 15 000 рублей',
    result:
      'Практические занятия, студенческие встречи и совместная работа над идеями',
  },
  alumni: {
    title: 'Выпускники делятся опытом',
    budget: 200_000,
    calculation: '4 образовательные встречи × 50 000 рублей',
    result:
      'Встречи с выпускниками, обмен опытом и профессиональная навигация студентов',
  },
} as const;
export function ProjectContent({ id }: { id: ProjectId }) {
  const project = projects.find((project) => project.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  const example = programExamples[id];
  return (
    <div className="wrap article-content">
      <div className="project-detail">
        <div className={`project-visual ${project.color}`}>
          <div className="project-visual-label">
            <span>{project.category}</span>
            <span>{project.number} /</span>
          </div>
          <EditorialArtwork scene={id} />
          <span className="project-visual-caption">
            ВОЗМОЖНОСТИ НАЧИНАЮТСЯ С&nbsp;ЛЮДЕЙ
          </span>
        </div>
        <div>
          <p className="lead">{readableText(project.description)}</p>
          <h2>От&nbsp;идеи к&nbsp;возможностям</h2>
          <p>
            Направление объединит инициативы университетского сообщества.
            Описание программ, порядок отбора и&nbsp;условия участия появятся
            после утверждения.
          </p>
          <span className="eyebrow">НАПРАВЛЕНИЕ ФОРМИРУЕТСЯ</span>
          <DonateButton />
          <div className="program-example">
            <span className="eyebrow">МОДЕЛЬ ПРОГРАММЫ · УСЛОВНЫЙ ПРИМЕР</span>
            <h3>{example.title}</h3>
            <p>{readableText(example.result)}</p>
            <strong className="program-budget">
              {formatRubles(example.budget)}
            </strong>
            <p>{example.calculation}</p>
            <p className="section-note">
              Иллюстрация бюджета, не&nbsp;открытый сбор
              и&nbsp;не&nbsp;утверждённое обязательство фонда.
            </p>
            <SiteLink className="text-link" href="/how-to-support/">
              Обсудить это направление ↗
            </SiteLink>
          </div>
        </div>
      </div>
      <section
        className="project-perspectives"
        aria-label="Ориентиры направления"
      >
        <div className="perspectives-heading">
          <span className="eyebrow">СМЫСЛ УЧАСТИЯ</span>
          <h2>Что может изменить поддержка</h2>
          <p>
            Возможные ориентиры направления — от&nbsp;идеи до&nbsp;новых
            возможностей.
          </p>
        </div>
        <div className="perspectives-grid">
          {projectFocus[id].map((item, index) => (
            <article className="perspective-card" key={item.title}>
              <span className="perspective-index" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{item.title}</h3>
              <p>{readableText(item.text)}</p>
              <svg viewBox="0 0 100 30" fill="none" aria-hidden="true">
                <path d="M0 15h85m-12-12 12 12-12 12" />
                <circle cx="25" cy="15" r="4" />
              </svg>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
