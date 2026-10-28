import { SiteLink } from '@/components/elements/site-link';
import { DonateButton } from '@/components/elements/donate-button';
import { assets } from '@/constants/assets';
import { NorthernContours } from '@/assets/svg/northern-contours';
export function Hero() {
  return (
    <section className="hero">
      <NorthernContours />
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <div className="eyebrow light hero-identity">
            <span>Эндаумент-фонд</span>
            <span>
              Заполярного государственного университета
              <br />
              имени Н. М. Федоровского
            </span>
          </div>
          <h1 aria-label="Будущее Арктики начинается с вашего вклада">
            <span className="headline-line">БУДУЩЕЕ АРКТИКИ</span>
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
