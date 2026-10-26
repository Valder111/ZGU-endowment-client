import { projects } from '@/constants/projects';
import { SiteLink } from '@/components/elements/site-link';
import { StudentsSymbol } from '@/assets/svg/students-symbol';
import { ScienceSymbol } from '@/assets/svg/science-symbol';
import { CampusSymbol } from '@/assets/svg/campus-symbol';
import { AlumniSymbol } from '@/assets/svg/alumni-symbol';
const symbols = {
  students: StudentsSymbol,
  science: ScienceSymbol,
  campus: CampusSymbol,
  alumni: AlumniSymbol,
};
export function ProjectGrid() {
  return (
    <div className="project-grid">
      {projects.map((project) => {
        const Symbol = symbols[project.id];
        return (
          <article key={project.id} className={`project-card ${project.color}`}>
            <div className="card-top">
              <span>{project.category}</span>
              <span className="card-number">{project.number}</span>
            </div>
            <div className="project-symbol" aria-hidden="true">
              <Symbol />
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
