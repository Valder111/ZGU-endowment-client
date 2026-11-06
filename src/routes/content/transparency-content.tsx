import { useId, useState } from 'react';
import { FileText, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { staffBase, staffResult } from '@/api/staff';
import {
  collectionApi,
  isPublished,
  publicContentParams,
} from '@/api/staff-content';
import type { RequestParams } from '@/api/generated/http-client';
import {
  foundationTeam,
  foundationCouncil,
  foundationDevelopers,
  foundationDocuments,
  type FoundationPerson,
} from '@/constants/transparency';
import { SiteLink } from '@/components/elements/site-link';
import { IncomeCycle } from '@/components/elements/income-cycle';
import { readableText } from '@/utils/typography';
import { siteConfig } from '@/configs/site';
import { assets } from '@/constants/assets';
import { PublishedDocument } from '@/components/elements/published-content';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';

const documentRequestHref = (topic: string) =>
  `mailto:${siteConfig.email}?subject=${encodeURIComponent(`Эндаумент-фонд ЗГУ: ${topic}`)}&body=${encodeURIComponent(`Здравствуйте!\n\nПрошу уточнить порядок получения сведений по теме «${topic}».\n\nМой вопрос: `)}`;

const loadPublicDocuments = (params: RequestParams) =>
  collectionApi.documents.list({ ...publicContentParams, ...params });

export function DocumentsContent() {
  const [filter, setFilter] = useState<string | null>(null);
  const id = useId();
  const { data } = useStaffResource(
    staffResult,
    loadPublicDocuments,
    Boolean(staffBase),
  );
  const documents = [
    ...foundationDocuments.map((item) => ({
      kind: 'request' as const,
      ...item,
    })),
    ...(Array.isArray(data) ? data : []).flatMap((item) =>
      item.id && item.title && isPublished('documents', item)
        ? [
            {
              kind: 'published' as const,
              id: item.id,
              title: item.title,
              category: item.category?.trim() || 'Без категории',
              item,
            },
          ]
        : [],
    ),
  ];
  const groups = new Map<
    string,
    { label: string; documents: typeof documents }
  >();
  for (const document of documents) {
    const key = document.category.toLocaleLowerCase('ru');
    const group = groups.get(key);
    if (group) group.documents.push(document);
    else groups.set(key, { label: document.category, documents: [document] });
  }
  const activeFilter = filter && groups.has(filter) ? filter : null;
  const visibleGroups = [...groups].filter(
    ([key]) => activeFilter === null || activeFilter === key,
  );

  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>Доверие начинается с&nbsp;открытости</h2>
        <div>
          <p className="lead">
            Условия участия, сведения о&nbsp;фонде и&nbsp;использовании дохода –
            основа осознанного решения о&nbsp;поддержке.
          </p>
          <p>
            Скачайте опубликованный файл или запросите материалы через ЗГУ.
            В&nbsp;письме можно уточнить нужные документы, период и&nbsp;вопросы
            к&nbsp;команде фонда.
          </p>
        </div>
      </div>
      <nav className="practical-links" aria-label="Разделы прозрачности">
        <SiteLink href="/about/reporting/">Отчётность ↗</SiteLink>
        <SiteLink href="/about/governing-bodies/">Команда фонда ↗</SiteLink>
        <SiteLink href="/about/company-information/">
          Управляющая компания ↗
        </SiteLink>
      </nav>
      <section
        className="requisites-section editorial-section"
        aria-labelledby={`${id}-requisites`}
      >
        <span className="eyebrow">ПРОВЕРКА ПОЛУЧАТЕЛЯ</span>
        <h2 id={`${id}-requisites`}>Реквизиты фонда</h2>
        <p>
          Запросите полное наименование получателя, ИНН, ОГРН и&nbsp;банковские
          данные. Перед переводом сверьте их&nbsp;с&nbsp;договором
          пожертвования. Общие реквизиты ЗГУ не&nbsp;заменяют реквизиты фонда.
        </p>
        <a className="text-link" href={documentRequestHref('Реквизиты фонда')}>
          Запросить реквизиты <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </section>
      <section className="editorial-section" aria-labelledby={`${id}-library`}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">БИБЛИОТЕКА ФОНДА</span>
            <h2 id={`${id}-library`}>Документы и&nbsp;отчёты</h2>
          </div>
          <p>Устав, условия пожертвования и&nbsp;финансовая информация</p>
        </div>
        <div
          className="document-filters"
          role="group"
          aria-label="Категория документов"
        >
          <button
            type="button"
            aria-pressed={activeFilter === null}
            onClick={() => setFilter(null)}
          >
            Все материалы
          </button>
          {[...groups].map(([key, { label }]) => (
            <button
              type="button"
              key={key}
              aria-pressed={activeFilter === key}
              aria-label={
                key === 'все материалы' ? `Категория «${label}»` : undefined
              }
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="section-note" role="status">
          Материалов:{' '}
          {visibleGroups.reduce(
            (total, [, group]) => total + group.documents.length,
            0,
          )}
        </p>
        <div className="document-list">
          {visibleGroups.map(([key, { label, documents: items }]) => (
            <section className="document-group" aria-label={label} key={key}>
              <h3>{label}</h3>
              {items.map((doc) =>
                doc.kind === 'published' ? (
                  <PublishedDocument
                    key={`published-${doc.id}`}
                    id={doc.id}
                    title={doc.title}
                    item={doc.item}
                  />
                ) : (
                  <article
                    id={doc.id}
                    className="document-item"
                    key={`request-${doc.id}`}
                  >
                    <FileText aria-hidden="true" size={26} />
                    <div>
                      <h4>{doc.title}</h4>
                      <p>{readableText(doc.description)}</p>
                    </div>
                    <a
                      className="text-link"
                      href={documentRequestHref(doc.title)}
                    >
                      Запросить <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
                  </article>
                ),
              )}
            </section>
          ))}
        </div>
      </section>
      <div className="transparency-contact">
        <ShieldCheck size={34} aria-hidden="true" />
        <div>
          <h3>Поможем разобраться</h3>
          <p>
            Уточните условия участия и&nbsp;порядок получения документов через
            общие контакты университета.
          </p>
        </div>
        <SiteLink className="text-link" href="/contacts-and-requisites/">
          Задать вопрос <ArrowUpRight size={18} aria-hidden="true" />
        </SiteLink>
      </div>
    </div>
  );
}

function FoundationPeople({ people }: { people: readonly FoundationPerson[] }) {
  return (
    <div className="council-grid team-grid">
      {people.map((person) => (
        <article key={person.name}>
          {person.image ? (
            <img
              className={
                person.mirrored
                  ? 'team-portrait team-portrait--mirrored'
                  : 'team-portrait'
              }
              src={person.image}
              alt=""
              loading="lazy"
              style={
                person.position
                  ? { objectPosition: person.position }
                  : undefined
              }
            />
          ) : (
            <div className="team-portrait team-group-mark" aria-hidden="true">
              <span>{person.monogram}</span>
            </div>
          )}
          <h3>{person.name}</h3>
          {person.role && <p>{readableText(person.role)}</p>}
        </article>
      ))}
    </div>
  );
}

export function GovernanceContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>Люди, которые задают направление</h2>
        <div>
          <p className="lead">
            Фонд объединяет выпускников, друзей и&nbsp;партнёров университета
          </p>
          <p>
            Образование, исследования и&nbsp;университетская среда требуют
            общего взгляда в&nbsp;будущее. Команда связывает эти задачи
            с&nbsp;участием университетского сообщества.
          </p>
        </div>
      </div>
      <section className="editorial-section" aria-labelledby="foundation-team">
        <h2 id="foundation-team">Команда фонда</h2>
        <article className="director-profile">
          <img
            className="director-photo"
            src={assets.directorPortrait}
            alt=""
            width="800"
            height="1200"
            loading="lazy"
          />
          <div>
            <span className="eyebrow">ДИРЕКТОР ФОНДА</span>
            <h3>Елена Кистнер</h3>
            <p>
              Важно не&nbsp;только сохранить связь с&nbsp;университетом,
              но&nbsp;и&nbsp;дать этой связи продолжение – в&nbsp;возможностях
              для новых поколений.
            </p>
            <SiteLink
              className="text-link"
              href="/philanthropists/history/#alumni-appeal"
            >
              Обращение к&nbsp;выпускникам ↗
            </SiteLink>
          </div>
        </article>
        <FoundationPeople people={foundationTeam} />
      </section>
      <section
        className="editorial-section"
        aria-labelledby="foundation-members"
      >
        <h2 id="foundation-members">Совет фонда</h2>
        <FoundationPeople people={foundationCouncil} />
      </section>
      <section
        className="team-developers"
        aria-labelledby="foundation-developers"
      >
        <div className="team-developers-heading">
          <h2 id="foundation-developers">Студенты-разработчики</h2>
          <p>Студенты ЗГУ разрабатывают и&nbsp;поддерживают сайт фонда.</p>
        </div>
        <FoundationPeople people={foundationDevelopers} />
      </section>
      <section className="editorial-section" aria-label="Разделение функций">
        <span className="eyebrow">РАЗДЕЛЕНИЕ ФУНКЦИЙ</span>
        <h2>Каждому участнику – своя роль</h2>
        <div className="role-grid">
          <article>
            <span>01 / ФОНД</span>
            <h3>Цели и&nbsp;решения</h3>
            <p>
              Организует формирование капитала и&nbsp;использование дохода
              в&nbsp;соответствии с&nbsp;документами фонда.
            </p>
          </article>
          <article>
            <span>02 / УПРАВЛЯЮЩАЯ КОМПАНИЯ</span>
            <h3>Доверительное управление</h3>
            <p>
              Управляет переданным капиталом на&nbsp;условиях договора
              и&nbsp;предоставляет отчёты.
            </p>
            <SiteLink className="text-link" href="/about/company-information/">
              Об&nbsp;управлении капиталом ↗
            </SiteLink>
          </article>
          <article>
            <span>03 / УНИВЕРСИТЕТ</span>
            <h3>Реализация программ</h3>
            <p>
              Использует полученную поддержку по&nbsp;согласованным целям
              и&nbsp;отчитывается о&nbsp;результатах.
            </p>
          </article>
        </div>
      </section>
      <SiteLink
        className="button primary"
        href="/about/constituent-the-documents/"
      >
        Документы фонда ↗
      </SiteLink>
    </div>
  );
}

export function ManagementContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>Понятные условия</h2>
        <div>
          <p className="lead">
            Сформированный целевой капитал передаётся профессиональной компании.
            Она инвестирует средства на&nbsp;условиях договора с&nbsp;фондом.
          </p>
          <p className="risk-note">
            Доходность не&nbsp;гарантирована. Инвестиционные риски сохраняются,
            стоимость капитала может снижаться. Результат управления
            не&nbsp;является обещанием выплат благотворителю.
          </p>
        </div>
      </div>
      <section className="management-status">
        <span className="eyebrow">СВЕДЕНИЯ И УСЛОВИЯ РАБОТЫ</span>
        <h2>На&nbsp;что обратить внимание</h2>
        <p>
          При знакомстве с&nbsp;условиями управления важны сведения
          о&nbsp;компании, её&nbsp;лицензии, инвестиционном подходе
          и&nbsp;расходах.
        </p>
        <ul>
          <li>Порядок выбора и&nbsp;полномочия управляющей компании</li>
          <li>
            Условия договора, инвестиционная декларация и&nbsp;ограничения
          </li>
          <li>Вознаграждение, расходы и&nbsp;порядок предоставления отчётов</li>
          <li>Результаты управления за&nbsp;отчётные периоды</li>
        </ul>
        <a
          className="text-link"
          href={documentRequestHref(
            'Управляющая компания и условия управления',
          )}
        >
          Запросить сведения ↗
        </a>
      </section>
      <IncomeCycle />
    </div>
  );
}

export function ReportingContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>Результаты, которые можно проверить</h2>
        <div>
          <p className="lead">
            Размер капитала, результат управления, расходы и&nbsp;программы –
            ключевые темы финансовой отчётности.
          </p>
          <p>
            Для запроса сведений укажите интересующий период и&nbsp;тему.
            Обращение через ЗГУ поможет уточнить порядок получения документов
            фонда.
          </p>
        </div>
      </div>
      <div className="reporting-grid">
        {foundationDocuments
          .filter((doc) => doc.category === 'Отчётность')
          .map((doc) => (
            <article key={doc.id}>
              <FileText size={32} aria-hidden="true" />
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
              <a className="text-link" href={documentRequestHref(doc.title)}>
                Запросить сведения ↗
              </a>
            </article>
          ))}
      </div>
      <div className="practical-links">
        <SiteLink href="/about/constituent-the-documents/">
          Все документы ↗
        </SiteLink>
        <SiteLink href="/results/">Проекты и&nbsp;результаты ↗</SiteLink>
        <SiteLink href="/how-to-support/">Как поддержать ↗</SiteLink>
      </div>
      <IncomeCycle />
    </div>
  );
}
