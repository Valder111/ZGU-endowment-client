import { SiteLink } from '@/components/elements/site-link';
import { DonateButton } from '@/components/elements/donate-button';
import { assets } from '@/constants/assets';
export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <span className="eyebrow light">
            ● &nbsp; ЗГУ ИМЕНИ Н. М. ФЕДОРОВСКОГО
          </span>
          <h1 aria-label="Будущее Севера начинается с вашего вклада">
            <span className="headline-line">БУДУЩЕЕ СЕВЕРА</span>
            <span className="headline-line">НАЧИНАЕТСЯ</span>
            <span className="headline-line">
              <em>С ВАШЕГО ВКЛАДА</em>
            </span>
          </h1>
          <p>
            Ваш вклад становится частью перемен.
            <br />В образовании, науке и жизни за Полярным кругом.
          </p>
          <div className="hero-actions">
            <DonateButton />
            <SiteLink className="text-link" href="/about/general-information/">
              Как работает фонд ↗
            </SiteLink>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="polar-compass">
            <span className="compass-n">N</span>
            <span className="compass-w">W</span>
            <span className="compass-e">E</span>
            <span className="compass-s">S</span>
            <div className="orbit orbit-outer"></div>
            <div className="orbit orbit-inner"></div>
            <div className="compass-cross"></div>
            <div className="polar-emblem">
              <img src={assets.bear} alt="" />
            </div>
            <span className="coordinate">69°20′ N &nbsp; 88°13′ E</span>
          </div>
          <div className="hero-caption">
            <span className="caption-dot"></span>
            <span>
              В центре — люди.
              <br />
              <b>Впереди — возможности.</b>
            </span>
            <span className="caption-arrow">↗</span>
          </div>
        </div>
        <div className="hero-bottom">
          <span>ЗАПОЛЯРНЫЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ</span>
          <span>НОРИЛЬСК · 69° С. Ш.</span>
          <a href="#directions" aria-label="Далее">
            ↓
          </a>
        </div>
      </div>
    </section>
  );
}
