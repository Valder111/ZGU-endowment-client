import { SiteLink } from '@/components/elements/site-link';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';

export function PendingContent({ title }: { title: string }) {
  return (
    <div className="wrap article-content">
      <div className="empty-state illustrated-state">
        <div className="state-copy">
          <span className="eyebrow">НА&nbsp;СВЯЗИ С&nbsp;УНИВЕРСИТЕТОМ</span>
          <h2>Обсудим то, что важно для вас</h2>
          <p>
            Направьте вопрос по&nbsp;теме «{title}» через общие контакты ЗГУ.
            Укажите, какие сведения помогут вам принять решение об&nbsp;участии.
          </p>
          <SiteLink className="button primary" href="/contacts-and-requisites/">
            Связаться с&nbsp;университетом ↗
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
