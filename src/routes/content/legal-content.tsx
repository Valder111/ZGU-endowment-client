import { ArrowLeft, Mail } from 'lucide-react';
import { Fragment } from 'react';
import { siteConfig } from '@/configs/site';
import {
  legalContent,
  legalDocument,
  type LegalDocumentId,
} from '@/constants/legal';
import { DocumentDownloads } from '@/components/elements/document-downloads';
import { LegalLinks } from '@/components/elements/legal-links';
import { SiteLink } from '@/components/elements/site-link';
import { sitePath } from '@/utils/paths';

// Source text stays plain text. Only verified links are rendered as anchors.
function DocumentText({ text }: { text: string }) {
  const parts = text.split(/(https:\/\/[^\s,;()]+|KistnerEV@norvuz\.ru)/gi);
  return parts.map((part, index) => {
    if (/^https:\/\//i.test(part)) {
      const url = part.replace(/[.]+$/, '');
      return (
        <Fragment key={index}>
          <a href={url} target="_blank" rel="noopener">
            {url}
          </a>
          {part.slice(url.length)}
        </Fragment>
      );
    }
    if (/^kistnerev@norvuz\.ru$/i.test(part)) {
      return (
        <a key={index} href={`mailto:${siteConfig.email}`}>
          {siteConfig.email}
        </a>
      );
    }
    if (part.includes('Best2Pay')) {
      return (
        <Fragment key={index}>
          {part.split('Best2Pay').map((piece, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <a href="https://best2pay.net/" target="_blank" rel="noopener">
                  Best2Pay
                </a>
              )}
              {piece}
            </Fragment>
          ))}
        </Fragment>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function PaymentSystems() {
  return (
    <div
      className="payment-systems"
      role="group"
      aria-label="Платёжные системы и процессинговый центр"
    >
      {[
        ['visa.png', 'Visa'],
        ['mastercard.png', 'MasterCard'],
        ['mir.jpg', 'МИР'],
        ['best2pay.png', 'Best2Pay'],
      ].map(([file, label]) =>
        label === 'Best2Pay' ? (
          <a
            key={label}
            href="https://best2pay.net/"
            aria-label="Процессинговый центр Best2Pay"
            target="_blank"
            rel="noopener"
          >
            <img src={sitePath(`/images/payments/${file}`)} alt={label} />
          </a>
        ) : (
          <img
            key={label}
            src={sitePath(`/images/payments/${file}`)}
            alt={label}
          />
        ),
      )}
    </div>
  );
}

export function LegalContent({ id }: { id: LegalDocumentId }) {
  const document = legalDocument(id);
  const sections = legalContent[id];
  return (
    <div className="wrap article-content legal-page">
      <SiteLink className="legal-back" href="/about/constituent-the-documents/">
        <ArrowLeft size={17} aria-hidden="true" /> Все документы фонда
      </SiteLink>
      <div className="legal-layout">
        <aside className="legal-sidebar">
          <div className="legal-sidebar-card">
            <h2>В этом документе</h2>
            <nav aria-label="Содержание документа">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="legal-file-label">Скачать полный документ</div>
            <DocumentDownloads
              stem={document.fileStem}
              title={document.title}
            />
          </div>
          <p className="legal-contact">
            Вопросы по документам
            <br />
            <a href={`mailto:${siteConfig.email}`}>
              <Mail size={16} aria-hidden="true" />
              {siteConfig.email}
            </a>
          </p>
        </aside>
        <article className="legal-paper" aria-label={document.title}>
          <p className="legal-intro">{document.description}</p>
          {document.approvalPending && (
            <p className="legal-document-note">
              В предоставленной редакции не указаны номер и дата протокола
              Совета фонда об утверждении документа.
            </p>
          )}
          {id === 'payment-security' && (
            <>
              <PaymentSystems />
              <p className="legal-document-note">
                Политика описывает платежи через Best2Pay. Сейчас обращение о
                пожертвовании на сайте отправляется по почте и не списывает
                средства.
              </p>
            </>
          )}
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="legal-section"
              aria-labelledby={`legal-${section.id}`}
            >
              <h2 id={`legal-${section.id}`}>{section.title}</h2>
              {section.paragraphs.map((text, index) => (
                <p key={index}>
                  <DocumentText text={text} />
                </p>
              ))}
            </section>
          ))}
          <div className="legal-document-end">
            <h2>Связанные документы</h2>
            <LegalLinks />
            <SiteLink
              className="text-link"
              href="/contacts-and-requisites/#requisites"
            >
              Контакты и реквизиты фонда ↗
            </SiteLink>
          </div>
        </article>
      </div>
    </div>
  );
}
