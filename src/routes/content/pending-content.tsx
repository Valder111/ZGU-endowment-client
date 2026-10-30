import { SiteLink } from '@/components/elements/site-link';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';

export function PendingContent({ title }: { title: string }) {
  return (
    <div className="wrap article-content">
      <div className="empty-state illustrated-state">
        <div className="state-copy">
          <span className="eyebrow">РАЗДЕЛ ГОТОВИТСЯ</span>
          <h2>Здесь будет вся важная информация</h2>
          <p>Утверждённые материалы ЗГУ будут добавлены после подготовки.</p>
          <SiteLink
            className="button primary"
            href="/about/general-information/"
          >
            О&nbsp;проекте ↗
          </SiteLink>
        </div>
        <EditorialArtwork
          scene={
            title === 'Управляющая компания'
              ? 'endowment'
              : title === 'Управление фондом'
                ? 'alumni'
                : 'documents'
          }
        />
      </div>
    </div>
  );
}
