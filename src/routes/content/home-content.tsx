import { Hero } from '@/components/elements/hero';
import { Mission } from '@/components/elements/mission';
import { FundActivity } from '@/components/elements/fund-activity';
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
      <FundActivity />
      <section className="section" id="directions">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="section-number">02 /</span> ТО, ЧТО ИМЕЕТ
                ЗНАЧЕНИЕ
              </span>
              <h2>
                У&nbsp;поддержки
                <br />
                <span className="muted">есть своё направление</span>
              </h2>
            </div>
            <SiteLink className="text-link" href="/project/all-project/">
              Все направления ↗
            </SiteLink>
          </div>
          <ProjectGrid />
          <p className="note">
            Предлагаемые направления. Конкретные программы и&nbsp;условия
            поддержки будут опубликованы после утверждения.
          </p>
        </div>
      </section>
      <Mechanism />
      <Community />
      <section className="section home-transparency">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ОТКРЫТОСТЬ И&nbsp;ОТВЕТСТВЕННОСТЬ</span>
              <h2>Понятно, кто принимает решения</h2>
            </div>
            <SiteLink
              className="text-link"
              href="/about/constituent-the-documents/"
            >
              Документы фонда ↗
            </SiteLink>
          </div>
          <div className="trust-grid">
            <SiteLink href="/about/governing-bodies/">
              <span>01 / ЛЮДИ</span>
              <h3>Команда и&nbsp;управление</h3>
              <p>Совет фонда, директор и&nbsp;разделение функций</p>
              <span aria-hidden="true">↗</span>
            </SiteLink>
            <SiteLink href="/about/reporting/">
              <span>02 / ПОДОТЧЁТНОСТЬ</span>
              <h3>Доход и&nbsp;результаты</h3>
              <p>Путь от&nbsp;отчёта управляющей компании до&nbsp;программ</p>
              <span aria-hidden="true">↗</span>
            </SiteLink>
            <SiteLink href="/answers-on-questions/">
              <span>03 / ОТВЕТЫ</span>
              <h3>Вопросы о&nbsp;главном</h3>
              <p>Участие, управление, прозрачность и&nbsp;поддержка проектов</p>
              <span aria-hidden="true">↗</span>
            </SiteLink>
          </div>
        </div>
      </section>
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
