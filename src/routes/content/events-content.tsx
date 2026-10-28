import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
import { SiteLink } from '@/components/elements/site-link';

export function EventsContent() {
  return (
    <div className="wrap article-content">
      <div className="empty-state illustrated-state">
        <div className="state-copy">
          <span className="eyebrow">ЛЮДИ. ИДЕИ. НОВЫЕ СВЯЗИ.</span>
          <h2>Новые встречи — впереди</h2>
          <p>Анонсы мероприятий фонда появятся в этом разделе.</p>
          <a href="https://polaruniversity.ru/" target="_blank" rel="noopener">
            Жизнь университета ↗
          </a>
          <div className="state-tags">
            <span>Встречи</span>
            <span>Обмен опытом</span>
            <span>Сообщество</span>
          </div>
          <SiteLink className="text-link" href="/philanthropists/history/">
            Познакомиться с сообществом ↗
          </SiteLink>
        </div>
        <EditorialArtwork scene="events" />
      </div>
    </div>
  );
}
