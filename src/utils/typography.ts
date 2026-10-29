/** Keep short Russian prepositions and initials with the following word. */
export function readableText(text: string) {
  return text
    .replace(
      /(^|[\s(«—])([А-ЯЁа-яё]{1,2})[ \t]+(?=[А-ЯЁа-яё0-9«])/g,
      '$1$2\u00a0',
    )
    .replace(/([А-ЯЁ]\.)[ \t]+(?=[А-ЯЁ])/g, '$1\u00a0');
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value);

export const formatRubles = (value: number) => `${formatNumber(value)} рублей`;

export function formatYears(value: number) {
  const ending = new Intl.PluralRules('ru-RU').select(value);
  return `${formatNumber(value)} ${ending === 'one' ? 'год' : ending === 'few' ? 'года' : 'лет'}`;
}
