import { news } from '@/constants/news';
export function NewsGrid() {
  return (
    <div className="news-grid">
      {news.map((item) => (
        <article className="news-card" key={item.href}>
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            <img src={item.image} alt="" loading="lazy" />
            <span className="news-label">НОВОСТИ УНИВЕРСИТЕТА</span>
            <h3>{item.title}</h3>
          </a>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}
