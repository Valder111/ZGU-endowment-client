import { DonateButton } from '@/components/elements/donate-button';
import portrait from '@/assets/images/editorial/rector-golubev.webp';

export function RectorAppeal() {
  return (
    <section
      className="alumni-appeal rector-appeal editorial-section"
      aria-labelledby="rector-appeal-title"
    >
      <div className="appeal-visual">
        <img
          src={portrait}
          alt="Евгений Голубев"
          width="1100"
          height="733"
          loading="lazy"
        />
      </div>
      <div className="appeal-copy">
        <span className="eyebrow">ОБРАЩЕНИЕ РЕКТОРА</span>
        <h2 id="rector-appeal-title">Евгений Голубев</h2>
        <p className="rector-role">
          Ректор ЗГУ имени Н. М. Федоровского с 2022 по 2026 годы
        </p>
        <blockquote>
          <p>
            «Всегда отрадно слышать, что выпускники университета связывают свой
            успех с&nbsp;Альма-матер. Эндаумент-фонд позволяет выразить эту
            благодарность, материализовать её в&nbsp;виде вклада, который будет
            вечно работать – давать возможность студентам и&nbsp;молодым
            аспирантам проявить себя, получить новые меры поддержки».
          </p>
        </blockquote>
        <div className="appeal-actions">
          <DonateButton label="Поддержать университет" />
        </div>
      </div>
    </section>
  );
}
