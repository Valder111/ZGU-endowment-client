import { SiteLink } from '@/components/elements/site-link';
import { communityStories } from '@/constants/community';
import { ProjectGlyph } from '@/components/elements/project-glyph';
export function PartnersContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>
          Ваша история с ЗГУ
          <br />
          продолжается.
        </h2>
        <div>
          <p className="lead">
            Знания, опыт и участие выпускников помогают университетскому
            сообществу становиться сильнее.
          </p>
          <p>
            Здесь появятся истории благотворителей, форматы партнёрства и
            условия участия. Сейчас можно познакомиться с предлагаемыми
            направлениями поддержки.
          </p>
          <SiteLink className="button primary" href="/project/all-project/">
            Выбрать направление ↗
          </SiteLink>
        </div>
      </div>
      <div className="involvement-grid">
        {communityStories.map((story, index) => (
          <SiteLink
            className="involvement-card"
            href={story.href}
            key={story.id}
          >
            <span className="eyebrow">{story.eyebrow}</span>
            <span className="involvement-art" aria-hidden="true">
              <ProjectGlyph
                id={
                  index === 0 ? 'students' : index === 1 ? 'science' : 'alumni'
                }
              />
            </span>
            <h3>{story.title}</h3>
            <p>{story.description}</p>
            <span>
              {story.link} <span aria-hidden="true">↗</span>
            </span>
          </SiteLink>
        ))}
      </div>
    </div>
  );
}
