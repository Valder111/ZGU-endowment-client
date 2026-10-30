import { projects } from '@/constants/projects';
import { SiteLink } from '@/components/elements/site-link';
import { ProjectGlyph } from '@/components/elements/project-glyph';
import { readableText } from '@/utils/typography';
import type { ProjectId } from '@/types/content';
export function ProjectGrid({
  activeId,
  idPrefix,
}: {
  activeId?: ProjectId;
  idPrefix?: string;
}) {
  return (
    <div className="project-grid">
      {projects.map((project) => {
        return (
          <article
            key={project.id}
            id={idPrefix ? `${idPrefix}-${project.id}` : undefined}
            tabIndex={idPrefix ? -1 : undefined}
            data-project-id={project.id}
            data-selected={activeId ? activeId === project.id : undefined}
            className={`project-card ${project.color}`}
            aria-labelledby={
              idPrefix ? `${idPrefix}-${project.id}-title` : undefined
            }
          >
            <div className="card-top">
              <span>{project.category}</span>
              <span className="card-number">{project.number}</span>
            </div>
            <div className="project-symbol" aria-hidden="true">
              <ProjectGlyph id={project.id} />
            </div>
            <h3 id={idPrefix ? `${idPrefix}-${project.id}-title` : undefined}>
              {readableText(project.title)}
            </h3>
            <p>{readableText(project.description)}</p>
            <SiteLink
              className="card-link"
              href={`/projects/${project.id}/`}
              aria-label={`Подробнее: ${project.title}`}
            >
              Подробнее <span aria-hidden="true">↗</span>
            </SiteLink>
          </article>
        );
      })}
    </div>
  );
}
