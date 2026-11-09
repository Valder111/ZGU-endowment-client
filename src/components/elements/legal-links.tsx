import { SiteLink } from '@/components/elements/site-link';
import { legalDocuments } from '@/constants/legal';

export function LegalLinks({ newTab = false }: { newTab?: boolean }) {
  return (
    <nav
      className="legal-links"
      aria-label="Условия пожертвования и защита данных"
    >
      {legalDocuments.map((document) => (
        <SiteLink
          key={document.id}
          href={document.path}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener' : undefined}
        >
          {document.shortTitle}
          {newTab && <span className="sr-only"> (в новой вкладке)</span>}
        </SiteLink>
      ))}
    </nav>
  );
}
