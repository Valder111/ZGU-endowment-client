import { Mechanism } from '@/components/elements/mechanism';
import { DonateButton } from '@/components/elements/donate-button';
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
      <Mechanism />
    </div>
  );
}
