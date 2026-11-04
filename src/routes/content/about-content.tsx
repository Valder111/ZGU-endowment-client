import { Mechanism } from '@/components/elements/mechanism';
import { DonateButton } from '@/components/elements/donate-button';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
import { SiteLink } from '@/components/elements/site-link';
import { IncomeCycle } from '@/components/elements/income-cycle';
import { EndowmentFlow } from '@/components/elements/endowment-flow';
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
      <section className="endowment-difference editorial-section">
        <span className="eyebrow">БОЛЬШЕ, ЧЕМ РАЗОВАЯ ПОМОЩЬ</span>
        <h2>
          Пожертвование помогает сегодня.
          <br />
          <em>Эндаумент создаёт продолжение</em>
        </h2>
        <div className="difference-grid">
          <article>
            <span>01 / ПРЯМАЯ ПОМОЩЬ</span>
            <h3>Решить задачу сейчас</h3>
            <p>
              Разовое пожертвование можно направить непосредственно на
              согласованную нужду: событие, оборудование или помощь конкретной
              программе.
            </p>
          </article>
          <article>
            <span>02 / ЦЕЛЕВОЙ КАПИТАЛ</span>
            <h3>Создать источник поддержки</h3>
            <p>
              Вклад становится частью капитала. На развитие университета
              направляется доход от управления, а сам капитал служит основой
              долгосрочной поддержки.
            </p>
          </article>
        </div>
        <p className="difference-manifesto">
          Помочь однажды – важно.
          <br />
          <strong>Создать возможность помогать годами – бесценно.</strong>
        </p>
      </section>
      <EndowmentFlow />
      <Mechanism />
      <IncomeCycle />
    </div>
  );
}
