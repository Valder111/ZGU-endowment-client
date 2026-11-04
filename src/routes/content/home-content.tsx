import { Hero } from '@/components/elements/hero';
import { FundActivity } from '@/components/elements/fund-activity';
import { Mechanism } from '@/components/elements/mechanism';
import { Community } from '@/components/elements/community';
import { CallToAction } from '@/components/elements/call-to-action';
import { ProjectGrid } from '@/components/elements/project-grid';
import { NewsGrid } from '@/components/elements/news-grid';
import { PublishedContent } from '@/components/elements/published-content';
import { SiteLink } from '@/components/elements/site-link';
import {
  UniversityLife,
  AnniversaryTeaser,
} from '@/components/elements/university-life';
import { AlumniAppeal } from '@/components/elements/alumni-appeal';
import { RectorAppeal } from '@/components/elements/rector-appeal';
import { EndowmentFlow } from '@/components/elements/endowment-flow';
export function HomeContent() {
  return (
    <>
      <Hero />
      <AnniversaryTeaser />
      <div className="wrap">
        <AlumniAppeal full />
      </div>
      <FundActivity />
      <UniversityLife />
      <section className="endowment-manifesto">
        <div className="wrap">
          <span className="eyebrow">ЭНДАУМЕНТ-ФОНД ЗГУ / СВЯЗЬ НАДОЛГО</span>
          <h2>
            Мерзлота уже не та.
            <br />
            <em>А эндаумент – навечно!</em>
          </h2>
          <p>
            Север меняется. Университет развивается. Ваше участие становится
            частью того, что продолжается.
          </p>
          <SiteLink
            className="text-link"
            href="/about/general-information/#endowment-flow"
          >
            Узнать, как устроен вечный вклад ↗
          </SiteLink>
        </div>
      </section>
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
        </div>
      </section>
      <Mechanism />
      <div className="wrap">
        <EndowmentFlow />
        <RectorAppeal />
      </div>
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
              <h3>Команда фонда</h3>
              <p>Люди, которые связывают идеи и&nbsp;участие</p>
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
          <PublishedContent collection="news" limit={3} />
        </div>
      </section>
      <CallToAction />
    </>
  );
}
