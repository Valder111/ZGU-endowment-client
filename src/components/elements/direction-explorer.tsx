import { useId, useState } from 'react';
import { projects } from '@/constants/projects';
import { SiteLink } from '@/components/elements/site-link';
import { ProjectGlyph } from '@/components/elements/project-glyph';
import { readableText } from '@/utils/typography';

export function DirectionExplorer() {
  const [selected, setSelected] = useState(0);
  const instanceId = useId();
  return (
    <section
      className="direction-explorer"
      aria-label="Выбор направления поддержки"
    >
      <div className="direction-map">
        <svg
          className="direction-routes"
          viewBox="0 0 460 390"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="230" cy="195" r="143" />
          <circle cx="230" cy="195" r="120" strokeDasharray="1 8" />
          <path d="M230 12v30m0 306v30M40 195h30m320 0h30" />
          <path
            className={selected === 0 ? 'is-active' : ''}
            d="M115 85Q170 80 230 195"
          />
          <path
            className={selected === 1 ? 'is-active' : ''}
            d="M345 85Q290 80 230 195"
          />
          <path
            className={selected === 2 ? 'is-active' : ''}
            d="M115 305Q170 310 230 195"
          />
          <path
            className={selected === 3 ? 'is-active' : ''}
            d="M345 305Q290 310 230 195"
          />
        </svg>
        <div className="direction-center" aria-hidden="true">
          <span>ЗГУ</span>
        </div>
        <div
          className="direction-controls"
          role="group"
          aria-label="Направления поддержки"
        >
          {projects.map((project, index) => (
            <button
              className={`direction-node direction-node-${project.id}`}
              key={project.id}
              type="button"
              aria-pressed={selected === index}
              aria-controls={`${instanceId}-${project.id}`}
              onClick={() => setSelected(index)}
            >
              <span className="direction-node-icon" aria-hidden="true">
                <ProjectGlyph id={project.id} />
              </span>
              <span>
                {['Образование', 'Наука', 'Кампус', 'Сообщество'][index]}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="direction-copy">
        <span className="eyebrow light">СОЗВЕЗДИЕ ВОЗМОЖНОСТЕЙ</span>
        <h2>Найдите свой вектор</h2>
        <p className="direction-hint">
          Четыре направления. Одна общая цель — будущее Севера.
        </p>
        <div
          className="direction-stories"
          aria-live="polite"
          aria-atomic="true"
        >
          {projects.map((project, index) => (
            <div
              className="direction-story"
              key={project.id}
              id={`${instanceId}-${project.id}`}
              data-active={selected === index}
              role="region"
              aria-label={project.category}
            >
              <span className="direction-story-number">
                {project.number} / {project.category}
              </span>
              <h3>{readableText(project.title)}</h3>
              <p>{readableText(project.description)}</p>
              <SiteLink
                href={`/projects/${project.id}/`}
                className="direction-story-link"
              >
                Познакомиться с&nbsp;направлением{' '}
                <span aria-hidden="true">↗</span>
              </SiteLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
