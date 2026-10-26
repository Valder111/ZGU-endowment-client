import { Hero } from '@/components/elements/hero';
import { Mission } from '@/components/elements/mission';
import { Mechanism } from '@/components/elements/mechanism';
import { Community } from '@/components/elements/community';
import { CallToAction } from '@/components/elements/call-to-action';
import { ProjectGrid } from '@/components/elements/project-grid';
import { NewsGrid } from '@/components/elements/news-grid';
import { SiteLink } from '@/components/elements/site-link';
export function HomeContent() {
  return (
    <>
      <Hero />
      <Mission />
      <section className="section" id="directions">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="section-number">02 /</span> ТО, ЧТО ИМЕЕТ
                ЗНАЧЕНИЕ
              </span>
              <h2>
                У каждого вклада
                <br />
                <span className="muted">есть своё направление.</span>
              </h2>
            </div>
            <SiteLink className="text-link" href="/project/all-project/">
              Все направления ↗
            </SiteLink>
          </div>
          <ProjectGrid />
          <p className="note">
            Предлагаемые направления. Конкретные программы и условия поддержки
            будут опубликованы после утверждения.
          </p>
        </div>
      </section>
      <Mechanism />
      <Community />
      <section className="section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="section-number">05 /</span> ЖИЗНЬ УНИВЕРСИТЕТА
              </span>
              <h2>Новости ЗГУ</h2>
            </div>
            <SiteLink className="text-link" href="/news/">
              Все новости ↗
            </SiteLink>
          </div>
          <NewsGrid />
        </div>
      </section>
      <CallToAction />
    </>
  );
}
