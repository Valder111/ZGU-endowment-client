import type { ChangeEvent } from 'react';

export function groupAmountDigits(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatGroupedAmountChange(
  event: ChangeEvent<HTMLInputElement>,
  format: (value: string, pasted: boolean) => string,
) {
  const input = event.currentTarget;
  const raw = input.value;
  const inputType =
    event.nativeEvent instanceof InputEvent ? event.nativeEvent.inputType : '';
  const formatted = format(raw, inputType === 'insertFromPaste');
  if (formatted === raw) return formatted;

  const countBeforeCaret = raw
    .slice(0, input.selectionStart ?? raw.length)
    .replace(/[. \u00a0\u202f]/g, '').length;
  let offset = 0;
  let count = 0;
  while (offset < formatted.length && count < countBeforeCaret) {
    if (formatted[offset] !== '.') count += 1;
    offset += 1;
  }
  if (inputType === 'deleteContentForward' && formatted[offset] === '.')
    offset += 1;
  input.value = formatted;
  input.setSelectionRange(offset, offset);
  return formatted;
}
