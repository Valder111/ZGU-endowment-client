import { useRef } from 'react';
import { SiteProvider } from '@/context/site-provider';
import { useSite } from '@/hooks/use-site';
import { useMotion } from '@/hooks/use-motion';
import { useTeapotShortcut } from '@/hooks/use-teapot-shortcut';
import { SiteHeader } from '@/components/elements/site-header';
import { SiteFooter } from '@/components/elements/site-footer';
import { CookieNotice } from '@/components/elements/cookie-notice';
import { DonationDialog } from '@/components/dialogs/donation-dialog';
import { PageContent } from '@/routes/page-content';
import { resolvePage } from '@/routes/resolve-page';
import { projects } from '@/constants/projects';
import { AdminContent } from '@/routes/content/admin-content';
import type { PageDefinition } from '@/types/content';

function Site({ page }: { page?: PageDefinition }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { accessible } = useSite();
  useMotion(rootRef, accessible);
  return (
    <div ref={rootRef}>
      <a href="#main-content" className="skip-link">
        Перейти к содержимому
      </a>
      <div className="reading-progress" aria-hidden="true" />
      <SiteHeader page={page} />
      <main id="main-content" tabIndex={-1}>
        <PageContent page={page} />
      </main>
      <SiteFooter />
      <CookieNotice />
      <DonationDialog />
    </div>
  );
}
export function App({ pathname }: { pathname: string }) {
  const page = resolvePage(pathname);
  useTeapotShortcut(page?.kind !== 'teapot');
  if (page?.kind === 'admin') {
    return (
      <AdminContent
        initialPanel={page.path === '/moderator/' ? 'moderator' : 'admin'}
      />
    );
  }
  const initialProject =
    page?.kind === 'projects' ? projects[0].id : page?.projectId;
  return (
    <SiteProvider initialProject={initialProject}>
      <Site page={page} />
    </SiteProvider>
  );
}
