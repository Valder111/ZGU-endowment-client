import { useRef, useState, type KeyboardEvent } from 'react';
import { FundBrand } from '@/components/elements/fund-brand';
import { navigation } from '@/constants/navigation';
import { useSite } from '@/hooks/use-site';
import { SiteLink } from '@/components/elements/site-link';
import { DonateButton } from '@/components/elements/donate-button';
import { cn } from '@/lib/utils';
import type { PageDefinition } from '@/types/content';
import { assets } from '@/constants/assets';
export function SiteHeader({ page }: { page?: PageDefinition }) {
  const { accessible, toggleAccessible } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
      menuRef.current?.focus();
    }
  }
  const group =
    page?.kind === 'news-article'
      ? 'news'
      : page?.kind === 'pending' || page?.kind === 'management'
        ? 'about'
        : page?.kind === 'reporting'
          ? 'documents'
          : page?.kind === 'project'
            ? 'projects'
            : page?.kind;
  return (
    <header onKeyDown={handleKeyDown}>
      <div className="anniversary-topline">
        <div className="wrap">
          <span>1961 — 2026</span>
          <SiteLink href="/anniversary/">
            Университету 65 лет. Продолжим историю вместе{' '}
            <span aria-hidden="true">↗</span>
          </SiteLink>
        </div>
      </div>
      <div className="wrap header-inner">
        <SiteLink className="brand" href="/" aria-label="Главная">
          <img
            className="university-brand-logo"
            src={assets.universityLogo}
            alt="Заполярный государственный университет"
            width="171"
            height="36"
          />
          <FundBrand />
        </SiteLink>
        <div className="header-actions">
          <button
            className="access"
            type="button"
            onClick={toggleAccessible}
            aria-label="Увеличить текст"
            aria-pressed={accessible}
          >
            Аа
          </button>
          <DonateButton />
          <button
            ref={menuRef}
            className="menu-toggle"
            type="button"
            aria-label="Меню"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
      <nav
        id="main-nav"
        className={cn('wrap navigation', menuOpen && 'open')}
        aria-label="Основная навигация"
      >
        {navigation.map((item) => (
          <SiteLink
            key={item.href}
            href={item.href}
            aria-current={group === item.group ? 'page' : undefined}
          >
            {item.label}
          </SiteLink>
        ))}
      </nav>
    </header>
  );
}
