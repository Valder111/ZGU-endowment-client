import { SiteLink } from '@/components/elements/site-link';

export function TeapotContent() {
  return (
    <section className="teapot-page">
      <div className="wrap teapot-layout">
        <div className="teapot-copy">
          <span className="eyebrow">ЗАПОЛЯРНЫЙ УНИВЕРСИТЕТ / 69°20′ С. Ш.</span>
          <p className="teapot-code">418</p>
          <h1>I’m a teapot</h1>
          <p>За Полярным кругом самое время согреться. Чай уже заварен.</p>
          <SiteLink className="button primary" href="/">
            Вернуться на главную ↗
          </SiteLink>
        </div>
        <svg
          className="teapot-art"
          viewBox="0 0 440 350"
          fill="none"
          aria-hidden="true"
        >
          <ellipse
            cx="222"
            cy="181"
            rx="200"
            ry="112"
            transform="rotate(-20 222 181)"
            stroke="currentColor"
            opacity=".32"
          />
          <ellipse
            cx="222"
            cy="181"
            rx="188"
            ry="124"
            transform="rotate(22 222 181)"
            stroke="currentColor"
            strokeDasharray="2 8"
            opacity=".6"
          />
          <circle cx="385" cy="107" r="5" fill="currentColor" />
          <circle cx="74" cy="229" r="3" fill="currentColor" />
          <path
            d="M197 100c-23-15 17-22 3-38m30 32c-20-15 17-26 3-43m28 49c-18-13 15-19 6-33"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M156 157c-24-2-40-12-58-31l-20 10c16 14 29 39 41 54 7 9 13 15 25 18m161-53c53-32 75 19 47 51-10 12-26 18-44 18"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="M162 141h130c18 20 29 41 29 63 0 45-43 71-94 71s-94-26-94-71c0-22 11-43 29-63Z"
            fill="#153e55"
            stroke="currentColor"
            strokeWidth="6"
          />
          <path
            d="M154 140h145m-110-2c4-13 17-24 38-24 21 0 34 11 38 24m-38-26v-11m-32 177h64"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M163 225c37-18 82-29 139-25M181 247c29-11 62-18 97-20"
            stroke="currentColor"
            opacity=".5"
            strokeWidth="2"
          />
          <path
            d="M382 251h19m-9-9v18M43 107h15m-8-8v16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
}
