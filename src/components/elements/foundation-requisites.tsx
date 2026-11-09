import { DocumentDownloads } from '@/components/elements/document-downloads';
import { foundationDetails } from '@/constants/legal';

export function FoundationRequisites() {
  const rows = [
    ['Получатель', foundationDetails.fullName],
    ['ИНН', foundationDetails.inn],
    ['КПП', foundationDetails.kpp],
    ['ОГРН', foundationDetails.ogrn],
    ['Банк', foundationDetails.bank],
    ['Расчётный счёт', foundationDetails.account],
    ['Корреспондентский счёт', foundationDetails.correspondentAccount],
    ['БИК', foundationDetails.bik],
    ['Назначение платежа', foundationDetails.paymentPurpose],
  ];
  return (
    <section
      className="foundation-requisites editorial-section"
      id="requisites"
      aria-labelledby="foundation-requisites-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">ДАННЫЕ ПОЛУЧАТЕЛЯ</span>
          <h2 id="foundation-requisites-title">Реквизиты фонда</h2>
        </div>
        <DocumentDownloads stem="foundation-details" title="Карточка фонда" />
      </div>
      <dl className="foundation-requisites-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
