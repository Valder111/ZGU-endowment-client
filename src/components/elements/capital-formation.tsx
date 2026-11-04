import illustration from '@/assets/images/editorial/capital-illustration.webp';

export function CapitalFormation() {
  return (
    <section
      className="capital-formation editorial-section"
      id="capital-formation"
      aria-labelledby="capital-formation-title"
    >
      <h2 className="sr-only" id="capital-formation-title">
        Схема формирования целевого капитала
      </h2>
      <figure>
        <img
          src={illustration}
          width="1672"
          height="941"
          alt="Жертвователи вносят средства в целевой капитал «НАУКА» по договору пожертвования или оферте. Для капитала предусмотрены отдельный банковский счёт и совет. На схеме указаны 3 млн рублей, 1 год (1,5 млн рублей) и продление до 1 года. По договору доверительного управления имущество передают управляющей компании в течение двух месяцев. Доход направляется в целевой капитал."
        />
        <figcaption>
          <a
            className="text-link"
            href={illustration}
            target="_blank"
            rel="noopener"
          >
            Открыть схему в полном размере ↗
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
