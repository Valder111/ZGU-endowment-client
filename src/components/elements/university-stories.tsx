import { SiteLink } from '@/components/elements/site-link';
import { readableText } from '@/utils/typography';

const stories = [
  {
    label: 'СТУДЕНТЫ',
    title: 'Талантам нужна точка опоры',
    text: 'На официальном сайте ЗГУ опубликована история семи стипендиатов Президента и Правительства России. Она показывает, какую роль поддержка играет в жизни студентов.',
    href: 'https://polaruniversity.ru/news/studenty-zgu-stipendiaty-rossii/',
    link: 'История студентов на сайте ЗГУ',
    direction: '/projects/students/',
  },
  {
    label: 'ИНЖЕНЕРИЯ',
    title: 'Задачи Севера становятся практикой',
    text: '«Лига арктических инженеров» — проект практического обучения ЗГУ и «Норникеля». Узнайте, с какими задачами работают будущие инженеры.',
    href: 'https://polaruniversity.ru/news/liga-arkticheskikh-inzhenerov/',
    link: 'Инженерный проект на сайте ЗГУ',
    direction: '/projects/science/',
  },
  {
    label: 'НАУКА И СРЕДА',
    title: 'Исследования выходят за границы аудитории',
    text: 'Сайенс-арт-лаборатория объединяет ЗГУ, Музей Норильска и ArtTECH. Студенты вместе с медиахудожниками визуализируют научные исследования.',
    href: 'https://polaruniversity.ru/news/zgu-muzey-norilska-i-arttech-razvernuli-sayens-art-laboratoriyu/',
    link: 'История лаборатории на сайте ЗГУ',
    direction: '/projects/campus/',
  },
] as const;

export function UniversityStories() {
  return (
    <section
      className="university-stories editorial-section"
      aria-label="Истории университета"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">ЗА&nbsp;КАЖДОЙ ИДЕЕЙ — ЛЮДИ</span>
          <h2>Истории, с&nbsp;которых всё начинается</h2>
        </div>
        <SiteLink className="text-link" href="/news/">
          Новости и&nbsp;истории ↗
        </SiteLink>
      </div>
      <p className="section-note">
        Примеры из&nbsp;жизни университета. Эти проекты не&nbsp;представлены как
        результаты финансирования эндаумент-фондом.
      </p>
      <div className="story-grid">
        {stories.map((story, index) => (
          <article key={story.label}>
            <span className="story-index" aria-hidden="true">
              0{index + 1}
            </span>
            <span className="eyebrow">{story.label}</span>
            <h3>{readableText(story.title)}</h3>
            <p>{readableText(story.text)}</p>
            <a
              className="text-link"
              href={story.href}
              target="_blank"
              rel="noopener"
            >
              {story.link} ↗
            </a>
            <SiteLink className="story-direction" href={story.direction}>
              К&nbsp;направлению поддержки ↗
            </SiteLink>
          </article>
        ))}
      </div>
    </section>
  );
}
