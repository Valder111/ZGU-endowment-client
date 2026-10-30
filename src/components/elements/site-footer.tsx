import { siteConfig } from '@/configs/site';
import { SiteLink } from '@/components/elements/site-link';
import { FundBrand } from '@/components/elements/fund-brand';
export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          <div>
            <SiteLink
              className="brand footer-brand"
              href="/"
              aria-label="Эндаумент-фонд Заполярного университета — главная"
            >
              <FundBrand />
            </SiteLink>
            <p>
              Вместе создаём
              <br />
              будущее Севера
            </p>
          </div>
          <div>
            <h3>Фонд</h3>
            <SiteLink href="/about/general-information/">О&nbsp;фонде</SiteLink>
            <SiteLink href="/project/all-project/">Целевые капиталы</SiteLink>
            <SiteLink href="/how-to-support/">Как поддержать</SiteLink>
            <SiteLink href="/results/">Проекты и&nbsp;результаты</SiteLink>
            <SiteLink href="/about/constituent-the-documents/">
              Документы и&nbsp;отчётность
            </SiteLink>
            <SiteLink href="/about/governing-bodies/">Команда фонда</SiteLink>
            <SiteLink href="/answers-on-questions/">
              Вопросы и&nbsp;ответы
            </SiteLink>
          </div>
          <div>
            <h3>Университет</h3>
            <a href={siteConfig.universityUrl} target="_blank" rel="noopener">
              Официальный сайт ↗
            </a>
            <a
              href="https://vk.ru/zgu_university"
              target="_blank"
              rel="noopener"
            >
              ВКонтакте ↗
            </a>
            <a
              href="https://t.me/zgu_university"
              target="_blank"
              rel="noopener"
            >
              Telegram ↗
            </a>
          </div>
          <div>
            <h3>Контакты ЗГУ</h3>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
            <p>
              Норильск,
              <br />
              ул. 50 лет Октября, 7
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 · ЗГУ имени Н. М. Федоровского</span>
          <SiteLink href="/about/constituent-the-documents/#privacy">
            Персональные данные
          </SiteLink>
        </div>
      </div>
    </footer>
  );
}
