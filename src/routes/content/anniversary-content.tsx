import { DonateButton } from '@/components/elements/donate-button';
import { FundraisingCard } from '@/components/elements/fundraising-card';
import { ProjectGrid } from '@/components/elements/project-grid';
import { SiteLink } from '@/components/elements/site-link';
import { assets } from '@/constants/assets';
import { AnniversaryOrbits } from '@/components/elements/anniversary-orbits';

export function AnniversaryContent() {
  return (
    <div className="wrap article-content anniversary-page">
      <section className="anniversary-intro">
        <div>
          <span className="eyebrow">1961 – 2026 / НАША АЛЬМА-МАТЕР</span>
          <h2>
            История <em>продолжается</em>
          </h2>
          <p>
            В 2026 году ЗГУ имени Н.&nbsp;М.&nbsp;Федоровского празднует юбилей.
          </p>
          <DonateButton label="Сделать подарок университету" />
        </div>
        <AnniversaryOrbits />
      </section>
      <div className="anniversary-photo">
        <img
          className="anniversary-photo-main"
          src={assets.universityCommunity}
          alt="Студенты университетского сообщества с флагом Политехнического колледжа"
          width="1200"
          height="800"
        />
        <img
          className="anniversary-photo-logo"
          src={assets.anniversaryLogoWhite}
          alt=""
          width="160"
          height="98"
        />
        <p>
          Следующие открытия
          <br />
          <em>начинаются с вашего участия.</em>
        </p>
      </div>
      <section
        className="anniversary-story editorial-section"
        aria-labelledby="anniversary-story-title"
      >
        <div>
          <span className="eyebrow">1961 – 2026 / НАШ ПУТЬ</span>
          <h2 id="anniversary-story-title">Люди, которые меняют Север</h2>
          <img
            className="anniversary-story-logo"
            src={assets.anniversaryLogo}
            alt="Юбилейный логотип ЗГУ"
            width="160"
            height="98"
            loading="lazy"
          />
        </div>
        <div className="anniversary-story-copy">
          <p>
            За 6,5 десятилетий самый северный университет России прошёл большой
            и яркий путь. Норильский индустриальный институт преобразился в
            ключевой вуз по подготовке кадров для промышленных предприятий.
            Современный Заполярный государственный университет уверенно входит в
            число ведущих инженерных вузов Арктики и претендует на статус
            арктического научно-образовательного кластера.
          </p>
          <p>
            На Севере мы дорожим каждым и способны разглядеть таланты. Именно
            поэтому мы создали фонд целевого капитала – чтобы вовремя создать
            благоприятные условия для тех, кто в чём-то по-настоящему хорош. Это
            возможность заложить основу для развития талантов.
          </p>
          <blockquote>
            Занимаясь благотворительностью, чувствуешь себя хорошим человеком.
            Вложив средства в эндаумент, становишься хорошим человеком навсегда.
          </blockquote>
          <p>
            Каждый из нас прямо сейчас может вписать своё имя в историю развития
            Заполярного государственного университета. Человеческое тепло и
            невероятная сила духа творят чудеса, помогая воспитывать целое
            созвездие талантливых учёных и лидеров отрасли.
          </p>
        </div>
      </section>
      <FundraisingCard />
      <section className="anniversary-gift editorial-section">
        <span className="eyebrow">ПОДАРОК С ПРОДОЛЖЕНИЕМ</span>
        <h2>
          Пусть ваш подарок
          <br />
          станет чьим-то началом
        </h2>
        <p className="lead">
          К юбилею можно подарить больше, чем поздравление: возможность учиться,
          исследовать и создавать новое в Арктике.
        </p>
        <p>
          Выберите близкое направление. Личный вклад, подарок от выпуска или
          участие компании складываются в общее будущее университета.
        </p>
        <div
          className="anniversary-amounts"
          aria-label="Идеи для юбилейного участия"
        >
          <span>Лично</span>
          <span>Вместе с однокурсниками</span>
          <span>От команды или компании</span>
        </div>
      </section>
      <ProjectGrid />
      <section className="anniversary-closing editorial-section">
        <span className="eyebrow">СЕВЕР ПОМНИТ СВОИХ</span>
        <h2>
          Вы уже часть истории.
          <br />
          <span>Станьте частью продолжения</span>
        </h2>
        <DonateButton label="Поздравить университет" />
        <SiteLink className="text-link" href="/philanthropists/history/">
          Выпускникам и друзьям ↗
        </SiteLink>
      </section>
      <a
        className="text-link anniversary-source"
        href="https://polaruniversity.ru/news/studentam/den_znaniy_v_zgu/"
        target="_blank"
        rel="noopener"
      >
        Юбилейный год на сайте университета ↗
      </a>
    </div>
  );
}
