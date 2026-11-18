import { useId } from 'react';
import { legalDocument } from '@/constants/legal';
import { personalDataConsentSections } from '@/constants/personal-data-consent';
import { SiteLink } from '@/components/elements/site-link';

const privacy = legalDocument('privacy');
const consent = legalDocument('consent');

export function PersonalDataConsent({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="payment-consent">
      <details className="payment-consent-text" id={`${id}-text`}>
        <summary>Текст согласия на обработку персональных данных</summary>
        {personalDataConsentSections.map((section) => (
          <div key={section.id}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        ))}
      </details>
      <label className="payment-check">
        <input
          type="checkbox"
          required
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={`${id}-text`}
        />
        <span>
          Даю{' '}
          <SiteLink href={consent.path} target="_blank" rel="noopener">
            согласие на обработку персональных данных
          </SiteLink>{' '}
          и подтверждаю ознакомление с{' '}
          <SiteLink href={privacy.path} target="_blank" rel="noopener">
            Политикой обработки персональных данных
          </SiteLink>
          .
        </span>
      </label>
    </div>
  );
}
