import { Download } from 'lucide-react';
import { SiteLink } from '@/components/elements/site-link';
import { documentFile } from '@/constants/legal';

export function DocumentDownloads({
  stem,
  title,
}: {
  stem: string;
  title: string;
}) {
  return (
    <div className="document-downloads">
      {(['pdf', 'docx'] as const).map((format) => (
        <SiteLink
          key={format}
          href={documentFile(stem, format)}
          download
          aria-label={`Скачать ${title}: ${format.toUpperCase()}`}
        >
          <Download size={16} aria-hidden="true" />
          {format.toUpperCase()}
        </SiteLink>
      ))}
    </div>
  );
}
