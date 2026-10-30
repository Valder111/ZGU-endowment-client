import { SiteLink } from '@/components/elements/site-link';
import { communityStories } from '@/constants/community';
import { ProjectGlyph } from '@/components/elements/project-glyph';
import { readableText } from '@/utils/typography';
export function PartnersContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>
          Ваша связь с&nbsp;ЗГУ
          <br />
          продолжается
        </h2>
        <div>
          <p className="lead">
            Знания, опыт и&nbsp;участие выпускников помогают университетскому
            сообществу становиться сильнее.
          </p>
          <p>
            Выберите программу, обсудите поддержку вместе с&nbsp;однокурсниками,
            именной капитал или&nbsp;партнёрство компании.
          </p>
          <SiteLink className="button primary" href="/project/all-project/">
            Выбрать направление ↗
          </SiteLink>
        </div>
      </div>
      <section className="donor-recognition editorial-section">
        <span className="eyebrow">ПРИЗНАНИЕ УЧАСТИЯ</span>
        <h2>Быть частью сообщества</h2>
        <p>
          Благодарственное письмо, согласованное упоминание на&nbsp;сайте
          и&nbsp;участие в&nbsp;открытых событиях — форматы, которые можно
          обсудить с&nbsp;командой фонда. Выберите, как рассказать о&nbsp;вашем
          участии, и&nbsp;согласуйте публичное упоминание.
        </p>
        <SiteLink className="button primary" href="/how-to-support/">
          Выбрать формат участия ↗
        </SiteLink>
      </section>
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
            <h3>{readableText(story.title)}</h3>
            <p>{readableText(story.description)}</p>
            <span>
              {story.link} <span aria-hidden="true">↗</span>
            </span>
          </SiteLink>
        ))}
      </div>
    </div>
  );
}
