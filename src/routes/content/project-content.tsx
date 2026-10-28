import { projects } from '@/constants/projects';
import { DonateButton } from '@/components/elements/donate-button';
import type { ProjectId } from '@/types/content';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
import { projectFocus } from '@/constants/visual-content';
export function ProjectContent({ id }: { id: ProjectId }) {
  const project = projects.find((project) => project.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
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
            ВОЗМОЖНОСТИ НАЧИНАЮТСЯ С ЛЮДЕЙ
          </span>
        </div>
        <div>
          <p className="lead">{project.description}</p>
          <h2>От идеи к возможностям</h2>
          <p>
            Направление объединит инициативы университетского сообщества.
            Описание программ, порядок отбора и условия участия появятся после
            утверждения.
          </p>
          <span className="eyebrow">НАПРАВЛЕНИЕ ФОРМИРУЕТСЯ</span>
          <DonateButton />
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
            Возможные ориентиры направления — от идеи до новых возможностей.
          </p>
        </div>
        <div className="perspectives-grid">
          {projectFocus[id].map((item, index) => (
            <article className="perspective-card" key={item.title}>
              <span className="perspective-index" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
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
