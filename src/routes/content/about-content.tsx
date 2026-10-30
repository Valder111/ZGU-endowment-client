import { Mechanism } from '@/components/elements/mechanism';
import { DonateButton } from '@/components/elements/donate-button';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
import { SiteLink } from '@/components/elements/site-link';
import { IncomeCycle } from '@/components/elements/income-cycle';
export function AboutContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>
          Поддержка, которая
          <br />
          смотрит вперёд
        </h2>
        <div>
          <p className="lead">
            Эндаумент-фонд Заполярного государственного университета
            имени&nbsp;Н.&nbsp;М.&nbsp;Федоровского объединяет поддержку
            образования, науки и&nbsp;университетского сообщества
          </p>
          <p>
            Выпускники и&nbsp;партнёры смогут участвовать в&nbsp;развитии вуза,
            создавать новые возможности для его студентов.
          </p>
          <DonateButton />
        </div>
      </div>
      <section className="foundation-principles" aria-label="Смысл эндаумента">
        <div className="foundation-illustration">
          <EditorialArtwork scene="endowment" />
          <span>УЧАСТИЕ, У&nbsp;КОТОРОГО ЕСТЬ ПРОДОЛЖЕНИЕ</span>
        </div>
        <div className="foundation-copy">
          <span className="eyebrow">ДОЛГОСРОЧНАЯ ПОДДЕРЖКА</span>
          <h2>
            У&nbsp;будущего есть
            <br />
            точка опоры
          </h2>
          <p>
            Идея эндаумента связывает сегодняшний вклад с&nbsp;возможностями
            следующих поколений.
          </p>
          <div className="foundation-values">
            <span>Люди</span>
            <span>Знания</span>
            <span>Долгий горизонт</span>
          </div>
        </div>
      </section>
      <nav className="practical-links" aria-label="Информация о фонде">
        <SiteLink href="/about/governing-bodies/">Команда фонда ↗</SiteLink>
        <SiteLink href="/about/constituent-the-documents/">
          Документы и&nbsp;реквизиты ↗
        </SiteLink>
        <SiteLink href="/about/reporting/">Отчётность ↗</SiteLink>
        <SiteLink href="/about/company-information/">
          Управляющая компания ↗
        </SiteLink>
      </nav>
      <Mechanism />
      <IncomeCycle />
    </div>
  );
}
