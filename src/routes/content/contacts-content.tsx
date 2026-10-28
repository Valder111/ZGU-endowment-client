import { siteConfig } from '@/configs/site';
import { PolarPostcard } from '@/components/elements/polar-postcard';
export function ContactsContent() {
  return (
    <div className="wrap article-content">
      <div className="contact-grid">
        <article className="info-panel">
          <span className="eyebrow light">
            ЗАПОЛЯРНЫЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ
          </span>
          <h2>Будем на связи</h2>
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
      <div className="north-postcard" id="north-postcard">
        <div>
          <span className="eyebrow">НА СВЯЗИ С СЕВЕРОМ</span>
          <h2>
            Расстояния не мешают
            <br />
            быть рядом.
          </h2>
          <p>
            Университет в Норильске. Идеи и связи — далеко за его пределами.
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
