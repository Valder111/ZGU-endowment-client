import { legalContent } from '@/constants/legal';

// Adapt the supplied paper form to an explicit checkbox without signature blanks.
export const personalDataConsentSections = legalContent.consent.map(
  (section) => ({
    ...section,
    paragraphs: section.paragraphs
      .filter(
        (text) => !text.startsWith('«___»') && !text.startsWith('(Подпись)'),
      )
      .map((text) =>
        text.replace(
          'нажимая кнопку «сделать взнос»',
          'проставляя отметку в поле «Даю согласие на обработку персональных данных»',
        ),
      ),
  }),
);
