import { useRef } from 'react';
import { SiteProvider } from '@/context/site-provider';
import { useSite } from '@/hooks/use-site';
import { useMotion } from '@/hooks/use-motion';
import { SiteHeader } from '@/components/elements/site-header';
import { SiteFooter } from '@/components/elements/site-footer';
import { DonationDialog } from '@/components/dialogs/donation-dialog';
import { PageContent } from '@/routes/page-content';
import { resolvePage } from '@/routes/resolve-page';
function Site({ pathname }: { pathname: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { accessible } = useSite();
  const page = resolvePage(pathname);
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
      <DonationDialog />
    </div>
  );
}
export function App({ pathname }: { pathname: string }) {
  return (
    <SiteProvider>
      <Site pathname={pathname} />
    </SiteProvider>
  );
}
