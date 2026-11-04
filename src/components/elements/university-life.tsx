import { assets } from '@/constants/assets';
import { SiteLink } from '@/components/elements/site-link';
import { DonateButton } from '@/components/elements/donate-button';
import { AnniversaryOrbits } from '@/components/elements/anniversary-orbits';

export function UniversityLife() {
  return (
    <section
      className="university-life section"
      aria-labelledby="university-life-title"
    >
      <div className="wrap life-layout">
        <div className="life-main">
          <img
            src={assets.researcher}
            alt="Студентка университета работает над исследовательской задачей за ноутбуком"
            loading="lazy"
            width="1200"
            height="799"
          />
          <div className="life-photo-caption">
            <span>69°20′ N</span>
            <span>ИССЛЕДУЕМ. СОЗДАЁМ. ОСТАЁМСЯ НА СЕВЕРЕ.</span>
          </div>
        </div>
        <div className="life-copy">
          <span className="eyebrow">ВОТ РАДИ КОГО ВСЁ НАЧИНАЕТСЯ</span>
          <h2 id="university-life-title">
            Север – это люди.
            <br />
            <em>Будущее – тоже</em>
          </h2>
          <p>
            Те, кто сегодня учится и пробует, завтра будут находить решения для
            Арктики. Дайте им больше пространства для открытий.
          </p>
          <div className="life-small-photos">
            <figure>
              <img
                src={assets.engineering}
                alt="Молодой исследователь работает с 3D-принтером в университетской лаборатории"
                loading="lazy"
                width="1200"
                height="800"
              />
              <figcaption>От идеи – к прототипу</figcaption>
            </figure>
            <figure>
              <img
                src={assets.laboratory}
                alt="Исследовательница проводит лабораторную работу"
                loading="lazy"
                width="1200"
                height="800"
              />
              <figcaption>От вопроса – к открытию</figcaption>
            </figure>
          </div>
          <DonateButton label="Помочь новым открытиям" />
        </div>
      </div>
    </section>
  );
}

export function AnniversaryTeaser() {
  return (
    <section
      className="anniversary-teaser"
      id="university-anniversary"
      aria-labelledby="anniversary-teaser-title"
    >
      <div className="wrap anniversary-teaser-inner">
        <AnniversaryOrbits />
        <div className="anniversary-teaser-copy">
          <span className="eyebrow">
            1961 – 2026 / УНИВЕРСИТЕТ, КОТОРЫЙ НАС ОБЪЕДИНЯЕТ
          </span>
          <h2 id="anniversary-teaser-title">
            Лучший подарок –<br />
            <em>будущее с продолжением</em>
          </h2>
          <p>
            Заполярному государственному – 65! Поздравьте университет
            и&nbsp;поддержите тех, чья история здесь только начинается.
          </p>
          <SiteLink className="button primary" href="/anniversary/">
            Поздравить университет <span aria-hidden="true">↗</span>
          </SiteLink>
        </div>
      </div>
    </section>
  );
}
