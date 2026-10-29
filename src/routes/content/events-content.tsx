import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
import { SiteLink } from '@/components/elements/site-link';

export function EventsContent() {
  return (
    <div className="wrap article-content">
      <div className="empty-state illustrated-state">
        <div className="state-copy">
          <span className="eyebrow">ЛЮДИ, ИДЕИ И&nbsp;НОВЫЕ СВЯЗИ</span>
          <h2>Новые встречи — впереди</h2>
          <p>Анонсы мероприятий фонда появятся в&nbsp;этом разделе.</p>
          <a href="https://polaruniversity.ru/" target="_blank" rel="noopener">
            Жизнь университета ↗
          </a>
          <div className="state-tags">
            <span>Встречи</span>
            <span>Обмен опытом</span>
            <span>Сообщество</span>
          </div>
          <SiteLink className="text-link" href="/philanthropists/history/">
            Познакомиться с&nbsp;сообществом ↗
          </SiteLink>
        </div>
        <EditorialArtwork scene="events" />
      </div>
      <section className="editorial-section event-topics">
        <span className="eyebrow">ТЕМЫ ДЛЯ ВСТРЕЧ</span>
        <h2>Разговор о&nbsp;долгой поддержке</h2>
        <p>
          Предлагаемые форматы сообщества. Даты, программа и&nbsp;регистрация
          пока не&nbsp;объявлены.
        </p>
        <div className="role-grid">
          <article>
            <span>ВЫПУСКНИКИ И&nbsp;ДРУЗЬЯ</span>
            <h3>Как работает эндаумент</h3>
            <p>
              Открытая встреча о&nbsp;целевом капитале, участии
              и&nbsp;прозрачности
            </p>
          </article>
          <article>
            <span>БИЗНЕС И&nbsp;УНИВЕРСИТЕТ</span>
            <h3>Партнёрство для Арктики</h3>
            <p>
              Обсуждение инженерных задач, исследований и&nbsp;корпоративной
              поддержки
            </p>
          </article>
          <article>
            <span>КОМАНДЫ ПРОЕКТОВ</span>
            <h3>От&nbsp;идеи до&nbsp;программы</h3>
            <p>
              Практический разговор о&nbsp;целях, бюджете и&nbsp;измеримом
              результате
            </p>
          </article>
        </div>
        <SiteLink className="text-link" href="/contacts-and-requisites/">
          Предложить тему встречи ↗
        </SiteLink>
      </section>
    </div>
  );
}
