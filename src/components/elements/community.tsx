import { SiteLink } from '@/components/elements/site-link';
export function Community() {
  return (
    <section className="section community">
      <div className="wrap community-inner">
        <div>
          <span className="eyebrow light">
            <span className="section-number">04 /</span> ВЫПУСКНИКАМ И ПАРТНЁРАМ
          </span>
          <h2>
            Север объединяет.
            <br />
            Участие меняет.
          </h2>
          <p>
            Продолжите свою историю с университетом.
            <br />
            Помогите следующему поколению найти свой путь.
          </p>
          <SiteLink className="button white" href="/philanthropists/history/">
            Стать частью сообщества ↗
          </SiteLink>
        </div>
        <div className="community-mark" aria-hidden="true">
          69<sup>°</sup>
          <small>СЕВЕРНОЙ ШИРОТЫ</small>
        </div>
      </div>
    </section>
  );
}
