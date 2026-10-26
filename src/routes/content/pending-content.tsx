import { SiteLink } from '@/components/elements/site-link';
export function PendingContent() {
  return (
    <div className="wrap article-content">
      <div className="empty-state">
        <span className="eyebrow">РАЗДЕЛ ГОТОВИТСЯ</span>
        <h2>Здесь будет вся важная информация</h2>
        <p>Утверждённые материалы ЗГУ будут добавлены после подготовки.</p>
        <SiteLink className="button primary" href="/about/general-information/">
          О проекте ↗
        </SiteLink>
      </div>
    </div>
  );
}
