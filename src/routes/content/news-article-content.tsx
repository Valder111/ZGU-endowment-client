import { fundNewsArticles } from '@/constants/news';
import { readableText } from '@/utils/typography';
import { DonateButton } from '@/components/elements/donate-button';
import { SiteLink } from '@/components/elements/site-link';
import type { EditorialBlock } from '@/constants/editorial-news';

function ArticleBlock({ block }: { block: EditorialBlock }) {
  switch (block.kind) {
    case 'heading':
      return <h2>{block.text}</h2>;
    case 'quote':
      return (
        <blockquote>
          <p>{readableText(block.text)}</p>
        </blockquote>
      );
    case 'action':
      return <DonateButton label={block.text} />;
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List>
          {block.items.map((item) => (
            <li key={item}>{readableText(item)}</li>
          ))}
        </List>
      );
    }
    case 'source':
      return (
        <p>
          {readableText(block.before)}
          <a href={block.href}>{block.label}</a>
          {readableText(block.after)}
        </p>
      );
    case 'paragraph':
      return <p>{readableText(block.text)}</p>;
  }
}

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
          width={'width' in article ? article.width : 1200}
          height={'height' in article ? article.height : 800}
        />
        <figcaption>{article.caption}</figcaption>
      </figure>
      <div className="fund-news-copy">
        {'blocks' in article ? (
          <>
            <p className="lead">{readableText(article.subtitle)}</p>
            {article.blocks.map((block, index) => (
              <ArticleBlock key={index} block={block} />
            ))}
          </>
        ) : (
          <>
            <p className="lead">{readableText(article.lead)}</p>
            {article.paragraphs.map((text) => (
              <p key={text}>{readableText(text)}</p>
            ))}
          </>
        )}
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
          {id !== 'council' && (
            <DonateButton
              label={
                id === 'horizon'
                  ? 'Укрепить связь с Заполярным университетом'
                  : 'Поддержать университет'
              }
            />
          )}
          <SiteLink className="text-link" href="/news/">
            Все новости ↗
          </SiteLink>
        </div>
      </div>
    </article>
  );
}
