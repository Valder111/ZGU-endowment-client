import { projects } from '@/constants/projects';
import { DonateButton } from '@/components/elements/donate-button';
import type { ProjectId } from '@/types/content';
export function ProjectContent({ id }: { id: ProjectId }) {
  const project = projects.find((project) => project.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  return (
    <div className="wrap article-content">
      <div className="project-detail">
        <div className={`project-symbol ${project.color}`} aria-hidden="true">
          {project.symbol}
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
    </div>
  );
}
