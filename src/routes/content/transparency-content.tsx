import { useId, useState } from 'react';
import { FileText, ArrowUpRight, ShieldCheck } from 'lucide-react';
import {
  foundationCouncil,
  foundationDocuments,
} from '@/constants/transparency';
import { SiteLink } from '@/components/elements/site-link';
import { IncomeCycle } from '@/components/elements/income-cycle';
import { readableText } from '@/utils/typography';
import { siteConfig } from '@/configs/site';

const documentRequestHref = (topic: string) =>
  `mailto:${siteConfig.email}?subject=${encodeURIComponent(`Эндаумент-фонд ЗГУ: ${topic}`)}&body=${encodeURIComponent(`Здравствуйте!\n\nПрошу уточнить порядок получения сведений по теме «${topic}».\n\nМой вопрос: `)}`;

export function DocumentsContent() {
  const [filter, setFilter] = useState('Все материалы');
  const id = useId();
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>Доверие начинается с&nbsp;открытости</h2>
        <div>
          <p className="lead">
            Условия участия, сведения о&nbsp;фонде и&nbsp;использовании дохода —
            основа осознанного решения о&nbsp;поддержке.
          </p>
          <p>
            Выберите тему и&nbsp;направьте запрос через ЗГУ. В&nbsp;письме можно
            уточнить нужные документы, период и&nbsp;вопросы к&nbsp;команде
            фонда.
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
            <span className="eyebrow">ИНФОРМАЦИЯ ПО&nbsp;ЗАПРОСУ</span>
            <h2 id={`${id}-library`}>Документы и&nbsp;отчёты</h2>
          </div>
          <p>Устав, условия пожертвования и&nbsp;финансовая информация</p>
        </div>
        <div
          className="document-filters"
          role="group"
          aria-label="Категория документов"
        >
          {[
            'Все материалы',
            'Учредительные',
            'Пожертвования',
            'Отчётность',
            'Управление',
          ].map((category) => (
            <button
              type="button"
              key={category}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="section-note" role="status">
          Тем запроса:{' '}
          {
            foundationDocuments.filter(
              (doc) => filter === 'Все материалы' || doc.category === filter,
            ).length
          }
        </p>
        <div className="document-list">
          {foundationDocuments.map((doc) => (
            <article
              id={doc.id}
              className="document-item"
              key={doc.id}
              data-match={filter === 'Все материалы' || doc.category === filter}
            >
              <FileText aria-hidden="true" size={26} />
              <div>
                <span className="eyebrow">{doc.category}</span>
                <h3>{doc.title}</h3>
                <p>{readableText(doc.description)}</p>
              </div>
              <a className="text-link" href={documentRequestHref(doc.title)}>
                Запросить <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
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

export function GovernanceContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>Люди, которые задают направление</h2>
        <div>
          <p className="lead">
            Фонд объединяет университет и&nbsp;партнёров Норильска
          </p>
          <p>
            Образование, исследования и&nbsp;университетская среда требуют
            общего взгляда в&nbsp;будущее. Команда связывает эти задачи
            с&nbsp;участием выпускников, друзей и&nbsp;партнёров ЗГУ.
          </p>
        </div>
      </div>
      <section className="director-profile">
        <span className="person-monogram" aria-hidden="true">
          ЕК
        </span>
        <div>
          <span className="eyebrow">ДИРЕКТОР ФОНДА</span>
          <h2>Елена Кистнер</h2>
          <p>
            По&nbsp;вопросам деятельности фонда и&nbsp;партнёрства можно
            направить обращение через общие контакты университета.
          </p>
        </div>
        <a
          className="text-link"
          href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Обращение директору эндаумент-фонда ЗГУ')}`}
        >
          Написать обращение ↗
        </a>
      </section>
      <section className="editorial-section" aria-label="Совет фонда">
        <span className="eyebrow">СОВЕТ ФОНДА</span>
        <h2>Университет и&nbsp;город в&nbsp;диалоге</h2>
        <div className="council-grid">
          {foundationCouncil.map((person) => (
            <article key={person.name}>
              <span className="person-monogram" aria-hidden="true">
                {person.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')}
              </span>
              <h3>{person.name}</h3>
              <p>{readableText(person.role)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="editorial-section" aria-label="Разделение функций">
        <span className="eyebrow">РАЗДЕЛЕНИЕ ФУНКЦИЙ</span>
        <h2>Каждому участнику — своя роль</h2>
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
            Размер капитала, результат управления, расходы и&nbsp;программы —
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
