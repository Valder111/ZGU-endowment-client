import { faqItems } from '@/constants/faq';
import { useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { EditorialArtwork } from '@/assets/svg/editorial-artwork';
import { SiteLink } from '@/components/elements/site-link';
export function FaqContent() {
  const [query, setQuery] = useState('');
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const matches = faqItems.map((item) =>
    `${item.question} ${item.answer}`
      .toLocaleLowerCase('ru')
      .includes(normalizedQuery),
  );
  const count = matches.filter(Boolean).length;
  return (
    <div className="wrap article-content faq-layout">
      <aside className="faq-aside">
        <EditorialArtwork scene="questions" />
        <span className="eyebrow">ПОНЯТНО О ГЛАВНОМ</span>
        <h2>
          Хороший вклад
          <br />
          начинается с вопроса.
        </h2>
        <p>
          Как устроен эндаумент, что планируется поддерживать и где найти
          информацию.
        </p>
        <SiteLink className="text-link" href="/contacts-and-requisites/">
          Остались вопросы? Свяжитесь с ЗГУ ↗
        </SiteLink>
      </aside>
      <div className="faq-content">
        <div className="faq-tools">
          <label htmlFor={searchId}>Найти ответ</label>
          <div className="faq-search">
            <Search size={19} aria-hidden="true" />
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Например, направления или документы"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                aria-label="Очистить поиск"
                onClick={() => {
                  setQuery('');
                  searchRef.current?.focus();
                }}
              >
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="faq-search-status" role="status">
            Найдено: {count} из {faqItems.length}
          </p>
        </div>
        <div className="faq">
          {faqItems.map((item, index) => (
            <details
              key={item.question}
              className="faq-item"
              data-match={matches[index]}
            >
              <summary>
                <span className="faq-question">
                  <small aria-hidden="true">0{index + 1}</small>
                  {item.question}
                </span>
                <span aria-hidden="true">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
          {count === 0 && (
            <div className="faq-no-results">
              <h3>Пока нет такого ответа</h3>
              <p>Попробуйте другое слово или напишите университету.</p>
              <SiteLink href="/contacts-and-requisites/" className="text-link">
                Контакты ЗГУ ↗
              </SiteLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
