import type { PageDefinition } from '@/types/content';
import { HomeContent } from '@/routes/content/home-content';
import { AboutContent } from '@/routes/content/about-content';
import { PartnersContent } from '@/routes/content/partners-content';
import { ContactsContent } from '@/routes/content/contacts-content';
import { EventsContent } from '@/routes/content/events-content';
import { PendingContent } from '@/routes/content/pending-content';
import { ProjectContent } from '@/routes/content/project-content';
import { FaqContent } from '@/routes/content/faq-content';
import { ProjectGrid } from '@/components/elements/project-grid';
import { NewsGrid } from '@/components/elements/news-grid';
import { PageTitle } from '@/components/elements/page-title';
import { SiteLink } from '@/components/elements/site-link';
import { artworkForPage } from '@/constants/visual-content';
import { DirectionExplorer } from '@/components/elements/direction-explorer';
import { SupportContent } from '@/routes/content/support-content';
import {
  DocumentsContent,
  GovernanceContent,
  ManagementContent,
  ReportingContent,
} from '@/routes/content/transparency-content';
import { ResultsContent } from '@/routes/content/results-content';
import { UniversityStories } from '@/components/elements/university-stories';
function InteriorContent({ page }: { page: PageDefinition }) {
  switch (page.kind) {
    case 'support':
      return <SupportContent />;
    case 'documents':
      return <DocumentsContent />;
    case 'governance':
      return <GovernanceContent />;
    case 'management':
      return <ManagementContent />;
    case 'reporting':
      return <ReportingContent />;
    case 'results':
      return <ResultsContent />;
    case 'about':
      return <AboutContent />;
    case 'partners':
      return <PartnersContent />;
    case 'contacts':
      return <ContactsContent />;
    case 'events':
      return <EventsContent />;
    case 'pending':
      return <PendingContent title={page.title} />;
    case 'project':
      return page.projectId ? <ProjectContent id={page.projectId} /> : null;
    case 'faq':
      return <FaqContent />;
    case 'projects':
      return (
        <div className="wrap article-content">
          <DirectionExplorer />
          <ProjectGrid />
          {page.showNote && (
            <p className="note">
              Предлагаемые направления поддержки. Программы, бюджеты и сроки
              будут уточнены.
            </p>
          )}
        </div>
      );
    case 'news':
      return (
        <div className="wrap article-content">
          <NewsGrid />
          <UniversityStories />
          <SiteLink className="text-link" href="/events/">
            События сообщества ↗
          </SiteLink>
          <p className="note">
            Материалы открываются на официальном сайте ЗГУ.
          </p>
        </div>
      );
    case 'home':
      return null;
  }
}
export function PageContent({ page }: { page?: PageDefinition }) {
  if (!page)
    return (
      <>
        <PageTitle title="Страница не найдена" eyebrow="404" />
        <section className="section">
          <div className="wrap">
            <div className="empty-state">
              <p>Возможно, адрес изменился или содержит ошибку.</p>
              <SiteLink href="/" className="button primary">
                На главную ↗
              </SiteLink>
            </div>
          </div>
        </section>
      </>
    );
  if (page.kind === 'home') return <HomeContent />;
  return (
    <>
      <PageTitle
        title={page.title}
        eyebrow={page.eyebrow}
        scene={artworkForPage(page)}
      />
      <section className="section">
        <InteriorContent page={page} />
      </section>
    </>
  );
}
