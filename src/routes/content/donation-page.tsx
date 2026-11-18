import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { FundMark } from '@/assets/svg/fund-mark';
import { CookieNotice } from '@/components/elements/cookie-notice';
import { SiteLink } from '@/components/elements/site-link';
import { siteConfig } from '@/configs/site';
import { useSite } from '@/hooks/use-site';
import { DonationContent, DonationResultContent } from './donation-content';

export function DonationPage({ result = false }: { result?: boolean }) {
  const { accessible, toggleAccessible } = useSite();
  return (
    <div className="checkout-page">
      <a href="#main-content" className="skip-link">
        Перейти к содержимому
      </a>
      <header className="checkout-header">
        <div className="checkout-header-inner">
          <SiteLink href="/" className="checkout-brand">
            <span className="checkout-brand-symbol">
              <FundMark />
            </span>
            <span>
              <strong>Эндаумент-фонд ЗГУ</strong>
              <small>Создаём будущее вместе</small>
            </span>
          </SiteLink>
          <div className="checkout-header-actions">
            <button
              className="checkout-access"
              type="button"
              aria-label="Аа — Увеличить текст"
              aria-pressed={accessible}
              onClick={toggleAccessible}
            >
              Аа
            </button>
            <SiteLink
              href="/"
              className="checkout-back"
              aria-label="На сайт фонда"
            >
              <ArrowLeft aria-hidden="true" />
              <span>На сайт фонда</span>
            </SiteLink>
          </div>
        </div>
      </header>
      <main id="main-content" className="checkout-main" tabIndex={-1}>
        {result ? (
          <>
            <div className="checkout-result-heading">
              <span className="eyebrow">ВАШ ВКЛАД В БУДУЩЕЕ</span>
              <h1>Статус пожертвования</h1>
            </div>
            <DonationResultContent />
          </>
        ) : (
          <DonationContent />
        )}
      </main>
      <footer className="checkout-footer">
        <div className="checkout-footer-inner">
          <span>© 2026 · Эндаумент-фонд ЗГУ</span>
          <nav aria-label="Помощь жертвователю">
            <SiteLink href="/contacts-and-requisites/">
              Реквизиты фонда <ArrowUpRight aria-hidden="true" />
            </SiteLink>
            <a href={`mailto:${siteConfig.email}`}>
              Нужна помощь? <ArrowUpRight aria-hidden="true" />
            </a>
          </nav>
        </div>
      </footer>
      <CookieNotice />
    </div>
  );
}
