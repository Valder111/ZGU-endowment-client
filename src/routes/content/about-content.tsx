import { Mechanism } from '@/components/elements/mechanism';
import { DonateButton } from '@/components/elements/donate-button';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
export function AboutContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>
          Поддержка, которая
          <br />
          смотрит вперёд.
        </h2>
        <div>
          <p className="lead">
            Концепция эндаумент-фонда Заполярного государственного университета
            имени Н. М. Федоровского.
          </p>
          <p>
            Мы объединяем идеи поддержки образования, исследований и
            университетской среды. Выпускники и партнёры смогут участвовать в
            развитии университета и новых возможностей для его студентов.
          </p>
          <p>
            Финансовые показатели, программы и документы фонда будут
            опубликованы после подготовки и утверждения.
          </p>
          <DonateButton />
        </div>
      </div>
      <section className="foundation-principles" aria-label="Смысл эндаумента">
        <div className="foundation-illustration">
          <EditorialArtwork scene="endowment" />
          <span>УЧАСТИЕ, У КОТОРОГО ЕСТЬ ПРОДОЛЖЕНИЕ</span>
        </div>
        <div className="foundation-copy">
          <span className="eyebrow">БОЛЬШЕ, ЧЕМ ОДИН МОМЕНТ</span>
          <h2>
            У будущего есть
            <br />
            точка опоры.
          </h2>
          <p>
            Идея эндаумента связывает сегодняшний вклад с возможностями
            следующих поколений.
          </p>
          <div className="foundation-values">
            <span>Люди</span>
            <span>Знания</span>
            <span>Долгий горизонт</span>
          </div>
        </div>
      </section>
      <Mechanism />
    </div>
  );
}
