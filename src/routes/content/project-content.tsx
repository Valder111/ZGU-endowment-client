import { projects } from '@/constants/projects';
import { DonateButton } from '@/components/elements/donate-button';
import type { ProjectId } from '@/types/content';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
import { projectFocus } from '@/constants/visual-content';
import { SiteLink } from '@/components/elements/site-link';
import { readableText } from '@/utils/typography';
const programFormats = {
  students: {
    title: 'Стипендиальная программа',
    result:
      'Обсудите поддержку студентов для учёбы и профессионального развития: цель стипендии, критерии отбора и продолжительность участия.',
  },
  science: {
    title: 'Молодые исследователи Арктики',
    result:
      'Предложите исследовательскую задачу: материалы, полевые работы и проверку гипотез по вопросам развития северных территорий.',
  },
  campus: {
    title: 'Пространство совместной работы',
    result:
      'Обсудите практические занятия, студенческие мастерские и пространства для совместной работы над идеями.',
  },
  alumni: {
    title: 'Выпускники делятся опытом',
    result:
      'Предложите встречу с выпускниками, наставничество или обмен опытом, который поможет студентам выбрать профессиональный путь.',
  },
} as const;
export function ProjectContent({ id }: { id: ProjectId }) {
  const project = projects.find((project) => project.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  const program = programFormats[id];
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
            Выберите задачу, которая вам близка. Вместе с&nbsp;командой фонда
            можно обсудить цель поддержки, формат участия и&nbsp;ожидаемый
            результат.
          </p>
          <DonateButton />
          <div className="program-example">
            <span className="eyebrow">ФОРМАТ УЧАСТИЯ</span>
            <h3>{program.title}</h3>
            <p>{readableText(program.result)}</p>
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
            От&nbsp;личной инициативы до&nbsp;возможностей для всего
            университетского сообщества.
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
