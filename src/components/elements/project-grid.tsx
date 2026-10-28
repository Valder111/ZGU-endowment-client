import { projects } from '@/constants/projects';
import { SiteLink } from '@/components/elements/site-link';
import { ProjectGlyph } from '@/components/elements/project-glyph';
export function ProjectGrid() {
  return (
    <div className="project-grid">
      {projects.map((project) => {
        return (
          <article key={project.id} className={`project-card ${project.color}`}>
            <div className="card-top">
              <span>{project.category}</span>
              <span className="card-number">{project.number}</span>
            </div>
            <div className="project-symbol" aria-hidden="true">
              <ProjectGlyph id={project.id} />
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
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
