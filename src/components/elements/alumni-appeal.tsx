import { DonateButton } from '@/components/elements/donate-button';
import { SiteLink } from '@/components/elements/site-link';
import { assets } from '@/constants/assets';

export function AlumniAppeal({ full = false }: { full?: boolean }) {
  return (
    <section
      className="alumni-appeal editorial-section"
      id="alumni-appeal"
      aria-labelledby="alumni-appeal-title"
    >
      <div className="appeal-visual">
        <img
          src={assets.directorPortrait}
          alt="Елена Кистнер, директор Эндаумент-фонда ЗГУ"
          loading="lazy"
          width="800"
          height="1200"
        />
        <p>
          Елена Кистнер
          <br />
          Директор Эндаумент-фонда ЗГУ
        </p>
      </div>
      <div className="appeal-copy">
        <span className="eyebrow">ОБРАЩЕНИЕ ДИРЕКТОРА ФОНДА</span>
        <h2 id="alumni-appeal-title">
          Сопричастность
          <br />
          <em>большому делу</em>
        </h2>
        <p className="appeal-salutation">
          Уважаемые выпускники, преподаватели, партнёры и&nbsp;студенты
          Заполярного государственного университета!
        </p>
        <p>
          Вы когда-нибудь задумывались, что вызывает в&nbsp;человеке
          неподдельное чувство гордости? Сопричастность большому делу!
        </p>
        {full && (
          <>
            <p>
              Оказавшись на&nbsp;Севере, начинаешь дорожить каждым. Именно
              поэтому мы создали фонд целевого капитала — чтобы вовремя
              разглядеть таланты и&nbsp;создать для них благоприятные условия.
            </p>
            <p className="appeal-invitation">
              Занимаясь благотворительностью, чувствуешь себя хорошим человеком.
              Вложив средства в&nbsp;эндаумент, становишься хорошим человеком
              навсегда!
            </p>
          </>
        )}
        <div className="appeal-signature">
          <span className="person-monogram" aria-hidden="true">
            ЕК
          </span>
          <div>
            <strong>Елена Кистнер</strong>
            <span>Директор Эндаумент-фонда ЗГУ</span>
          </div>
        </div>
        <div className="appeal-actions">
          <DonateButton label="Поддержать университет" />
          {!full && (
            <SiteLink
              href="/philanthropists/history/#alumni-appeal"
              className="text-link"
            >
              Прочитать обращение ↗
            </SiteLink>
          )}
        </div>
      </div>
    </section>
  );
}
