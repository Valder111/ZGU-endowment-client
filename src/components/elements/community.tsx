import { useId, useState } from 'react';
import { SiteLink } from '@/components/elements/site-link';
import { CommunityGlobe } from '@/assets/svg/community-globe';
import { communityStories } from '@/constants/community';
import { readableText } from '@/utils/typography';
export function Community() {
  const [selected, setSelected] = useState(0);
  const instanceId = useId();
  return (
    <section
      className="section community"
      aria-labelledby={`${instanceId}-title`}
    >
      <div className="community-aurora" aria-hidden="true" />
      <div className="wrap community-inner">
        <div className="community-copy">
          <span className="eyebrow light">
            <span className="section-number">04 /</span> ВЫПУСКНИКАМ
            И&nbsp;ПАРТНЁРАМ
          </span>
          <h2 id={`${instanceId}-title`}>
            Север объединяет
            <br />
            <span>Участие меняет</span>
          </h2>
          <p className="community-intro">
            Сохраните связь с&nbsp;университетом.
            <br />
            Помогите следующему поколению найти свой путь.
          </p>
          <div
            className="community-choices"
            role="group"
            aria-label="Ваша связь с университетом"
          >
            {communityStories.map((story, index) => (
              <button
                type="button"
                key={story.id}
                aria-pressed={selected === index}
                aria-controls={`${instanceId}-${story.id}`}
                onClick={() => setSelected(index)}
              >
                {story.label}
              </button>
            ))}
          </div>
          <div
            className="community-stories"
            aria-live="polite"
            aria-atomic="true"
          >
            {communityStories.map((story, index) => (
              <div
                className="community-story"
                id={`${instanceId}-${story.id}`}
                key={story.id}
                data-active={selected === index}
                role="region"
                aria-label={story.label}
              >
                <span className="eyebrow light">{story.eyebrow}</span>
                <h3>{readableText(story.title)}</h3>
                <p>{readableText(story.description)}</p>
                <SiteLink className="community-story-link" href={story.href}>
                  {story.link} <span aria-hidden="true">↗</span>
                </SiteLink>
              </div>
            ))}
          </div>
          <SiteLink className="button white" href="/philanthropists/history/">
            Стать частью сообщества <span aria-hidden="true">↗</span>
          </SiteLink>
        </div>
        <div className="community-visual">
          <CommunityGlobe active={selected} />
          <p className="community-visual-caption">
            Разные истории
            <br />
            <span>Одна точка притяжения</span>
          </p>
        </div>
      </div>
      <div className="wrap community-bottom" aria-hidden="true">
        <span>СВЯЗЬ, КОТОРАЯ ОСТАЁТСЯ</span>
        <span className="community-bottom-line" />
        <span>ЗГУ · БУДУЩЕЕ СОЗДАЁТСЯ ВМЕСТЕ</span>
      </div>
    </section>
  );
}
