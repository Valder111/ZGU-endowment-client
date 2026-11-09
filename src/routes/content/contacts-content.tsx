import { siteConfig } from '@/configs/site';
import { PolarPostcard } from '@/components/elements/polar-postcard';
import { SiteLink } from '@/components/elements/site-link';
import { foundationDetails } from '@/constants/legal';
import { FoundationRequisites } from '@/components/elements/foundation-requisites';
import { LegalLinks } from '@/components/elements/legal-links';
export function ContactsContent() {
  return (
    <div className="wrap article-content">
      <div className="contact-grid">
        <article className="info-panel">
          <span className="eyebrow light">ЭНДАУМЕНТ-ФОНД ЗГУ</span>
          <h2>Будем на&nbsp;связи</h2>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email} ↗</a>
          <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
          <p>
            По вопросам фонда, поддержки и&nbsp;партнёрства пишите Елене
            Кистнер, директору фонда.
          </p>
        </article>
        <article className="info-panel pale">
          <h3>Юридический и фактический адрес фонда</h3>
          <p>{foundationDetails.address}</p>
          <h3>Директор фонда</h3>
          <p>{foundationDetails.director}</p>
          <SiteLink href="#requisites">Банковские реквизиты ↓</SiteLink>
        </article>
      </div>
      <section
        className="foundation-registration editorial-section"
        id="registration"
        aria-labelledby="registration-title"
      >
        <span className="eyebrow">СВЕДЕНИЯ ОБ ОРГАНИЗАЦИИ</span>
        <h2 id="registration-title">Получатель пожертвования</h2>
        <p className="lead">{foundationDetails.fullName}</p>
        <p>Сокращённое наименование: {foundationDetails.shortName}.</p>
      </section>
      <FoundationRequisites />
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
          <SiteLink href="#requisites">Реквизиты фонда ↗</SiteLink>
        </div>
      </div>
      <section
        className="contacts-documents editorial-section"
        aria-label="Документы для жертвователя"
      >
        <h2>Документы для жертвователя</h2>
        <p>
          Ознакомьтесь с условиями пожертвования и порядком защиты ваших данных.
        </p>
        <LegalLinks />
      </section>
      <div className="north-postcard" id="north-postcard">
        <div>
          <span className="eyebrow">НА&nbsp;СВЯЗИ С&nbsp;СЕВЕРОМ</span>
          <h2>
            Расстояния не&nbsp;мешают
            <br />
            быть рядом
          </h2>
          <p>
            Университет в&nbsp;Норильске. Идеи и&nbsp;связи – далеко за&nbsp;его
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
