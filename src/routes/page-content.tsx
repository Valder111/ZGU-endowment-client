import type { PageDefinition } from '@/types/content';
import { HomeContent } from '@/routes/content/home-content';
import { AboutContent } from '@/routes/content/about-content';
import { PartnersContent } from '@/routes/content/partners-content';
import { ContactsContent } from '@/routes/content/contacts-content';
import { EventsContent } from '@/routes/content/events-content';
import { PendingContent } from '@/routes/content/pending-content';
import { ProjectContent } from '@/routes/content/project-content';
import { FaqContent } from '@/routes/content/faq-content';
import { NewsGrid } from '@/components/elements/news-grid';
import {
  PublicationPage,
  PublishedContent,
} from '@/components/elements/published-content';
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
import { AnniversaryContent } from '@/routes/content/anniversary-content';
import { NewsArticleContent } from '@/routes/content/news-article-content';
import { TeapotContent } from '@/routes/content/teapot-content';
import { LegalContent } from '@/routes/content/legal-content';
import { FundraisingCard } from '@/components/elements/fundraising-card';
import { useDonationProgress } from '@/hooks/requests/queries/use-donation-progress';

function ProjectsContent({
  showCapitalFormationLink,
}: {
  showCapitalFormationLink?: boolean;
}) {
  const { data, error } = useDonationProgress();
  return (
    <div className="wrap article-content">
      <section
        className="project-funding"
        aria-labelledby="project-funding-title"
      >
        <span className="eyebrow">ЦЕЛЕВОЙ КАПИТАЛ ФОНДА</span>
        <h2 id="project-funding-title">Вместе к общей цели</h2>
        <FundraisingCard totals={data?.fund} />
        {Boolean(error) && (
          <p className="payment-hint">
            Не удалось обновить данные. Показана последняя доступная сумма.
          </p>
        )}
      </section>
      <DirectionExplorer funding={data?.targets} />
      {showCapitalFormationLink && (
        <p id="capital-formation" className="capital-formation-jump">
          <SiteLink
            className="text-link"
            href="/about/general-information/#capital-formation"
          >
            Схема формирования целевого капитала ↗
          </SiteLink>
        </p>
      )}
      <PublishedContent collection="projects" funding={data?.targets} />
    </div>
  );
}

function InteriorContent({ page }: { page: PageDefinition }) {
  switch (page.kind) {
    case 'anniversary':
      return <AnniversaryContent />;
    case 'news-article':
      return page.newsId ? <NewsArticleContent id={page.newsId} /> : null;
    case 'support':
      return <SupportContent />;
    case 'documents':
      return <DocumentsContent />;
    case 'legal':
      return page.legalDocumentId ? (
        <LegalContent id={page.legalDocumentId} />
      ) : null;
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
        <ProjectsContent
          showCapitalFormationLink={page.showCapitalFormationLink}
        />
      );
    case 'news':
      return (
        <div className="wrap article-content">
          <PublishedContent collection="news" />
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
    case 'admin':
    case 'donation':
    case 'donation-result':
    case 'publication':
    case 'teapot':
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
  if (page.kind === 'teapot') return <TeapotContent />;
  if (page.kind === 'publication') return <PublicationPage />;
  return (
    <>
      <PageTitle
        title={page.title}
        eyebrow={page.eyebrow}
        scene={artworkForPage(page)}
        className={
          page.kind === 'anniversary' ? 'page-title-anniversary' : undefined
        }
      />
      <section className="section">
        <InteriorContent page={page} />
      </section>
    </>
  );
}
