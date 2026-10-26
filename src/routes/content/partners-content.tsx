import { SiteLink } from '@/components/elements/site-link';
export function PartnersContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>
          Ваша история с ЗГУ
          <br />
          продолжается.
        </h2>
        <div>
          <p className="lead">
            Знания, опыт и участие выпускников помогают университетскому
            сообществу становиться сильнее.
          </p>
          <p>
            Здесь появятся истории благотворителей, форматы партнёрства и
            условия участия. Сейчас можно познакомиться с предлагаемыми
            направлениями поддержки.
          </p>
          <SiteLink className="button primary" href="/project/all-project/">
            Выбрать направление ↗
          </SiteLink>
        </div>
      </div>
    </div>
  );
}
