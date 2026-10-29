import { siteConfig } from '@/configs/site';
import { PolarPostcard } from '@/components/elements/polar-postcard';
import { SiteLink } from '@/components/elements/site-link';
export function ContactsContent() {
  return (
    <div className="wrap article-content">
      <div className="contact-grid">
        <article className="info-panel">
          <span className="eyebrow light">
            ЗАПОЛЯРНЫЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ
          </span>
          <h2>Будем на&nbsp;связи</h2>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email} ↗</a>
          <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
          <p>
            Общие контакты университета. Контакты фонда будут добавлены
            отдельно.
          </p>
        </article>
        <article className="info-panel pale">
          <h3>Юридический адрес ЗГУ</h3>
          <p>
            Россия, 663310, Красноярский край,
            <br />
            Норильск, ул. 50 лет Октября, д. 7
          </p>
          <h3>Фактический адрес</h3>
          <p>Норильск, ул. Пушкина, д. 6А</p>
          <a href={siteConfig.universityUrl} target="_blank" rel="noopener">
            Официальный сайт ЗГУ ↗
          </a>
        </article>
      </div>
      <div className="contact-purposes">
        <h2>С&nbsp;чего начать разговор</h2>
        <div className="practical-links">
          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Пожертвование в эндаумент-фонд ЗГУ')}`}
          >
            Пожертвования ↗
          </a>
          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Партнёрство с эндаумент-фондом ЗГУ')}`}
          >
            Партнёрство ↗
          </a>
          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Инициатива для поддержки эндаумент-фондом ЗГУ')}`}
          >
            Предложить проект ↗
          </a>
          <SiteLink href="/about/constituent-the-documents/">
            Реквизиты фонда ↗
          </SiteLink>
        </div>
      </div>
      <div className="north-postcard" id="north-postcard">
        <div>
          <span className="eyebrow">НА&nbsp;СВЯЗИ С&nbsp;СЕВЕРОМ</span>
          <h2>
            Расстояния не&nbsp;мешают
            <br />
            быть рядом
          </h2>
          <p>
            Университет в&nbsp;Норильске. Идеи и&nbsp;связи — далеко за&nbsp;его
            пределами.
          </p>
          <span className="postcard-coordinate">
            69°20′ N · 88°13′ E / НОРИЛЬСК
          </span>
        </div>
        <PolarPostcard />
      </div>
    </div>
  );
}
