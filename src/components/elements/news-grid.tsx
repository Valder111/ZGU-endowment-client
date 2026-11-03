import { news } from '@/constants/news';
import { SiteLink } from '@/components/elements/site-link';
export function NewsGrid() {
  return (
    <div className="news-grid">
      {news.map((item) => (
        <article className="news-card" key={item.href}>
          <SiteLink href={item.href}>
            <img src={item.image} alt="" loading="lazy" />
            <span className="news-label">
              {item.href.includes('presidential-scholarship')
                ? 'ЛЮДИ УНИВЕРСИТЕТА'
                : 'ЖИЗНЬ ФОНДА'}
            </span>
            <h3>{item.title}</h3>
          </SiteLink>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}
