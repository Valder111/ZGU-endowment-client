import { fundNewsArticles } from '@/constants/news';
import { readableText } from '@/utils/typography';
import { DonateButton } from '@/components/elements/donate-button';
import { SiteLink } from '@/components/elements/site-link';

export function NewsArticleContent({
  id,
}: {
  id: 'council' | 'horizon' | 'scholarship';
}) {
  const article = fundNewsArticles[id];
  return (
    <article className="wrap article-content fund-news-article">
      <figure>
        <img
          src={article.image}
          alt={article.caption}
          width="1200"
          height="800"
        />
        <figcaption>{article.caption}</figcaption>
      </figure>
      <div className="fund-news-copy">
        <p className="lead">{readableText(article.lead)}</p>
        {article.paragraphs.map((text) => (
          <p key={text}>{readableText(text)}</p>
        ))}
        {'source' in article && (
          <a
            className="text-link"
            href={article.source}
            target="_blank"
            rel="noopener"
          >
            Материал первоисточника ↗
          </a>
        )}
        <div className="appeal-actions">
          <DonateButton label="Поддержать университет" />
          <SiteLink className="text-link" href="/news/">
            Все новости ↗
          </SiteLink>
        </div>
      </div>
    </article>
  );
}
