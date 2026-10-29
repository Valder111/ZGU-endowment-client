import { SiteLink } from '@/components/elements/site-link';
export function Mission() {
  return (
    <section className="mission">
      <div className="wrap mission-grid">
        <span className="eyebrow">
          <span className="section-number">01 /</span> СИЛА ПРИТЯЖЕНИЯ СЕВЕРА
        </span>
        <h2>
          Университет даёт старт
          <br />
          <span>
            Вы&nbsp;помогаете
            <br />
            двигаться дальше
          </span>
        </h2>
        <p>
          Новые возможности для студентов, смелые исследования и&nbsp;сильное
          сообщество — направления, ради которых создаётся фонд.
          <SiteLink href="/how-to-support/" className="text-link">
            Найти свой формат участия ↗
          </SiteLink>
        </p>
      </div>
    </section>
  );
}
