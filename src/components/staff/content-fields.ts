import type { ContentRecord } from '@/api/staff';
import type { Collection } from '@/api/staff-content';
import { invalidStaffForm } from '@/hooks/requests/mutations/use-staff-action';
import { groupAmountDigits } from '@/utils/grouped-amount';

export type { Collection } from '@/api/staff-content';

export const statusLabels: Record<string, string> = {
  draft: 'Не опубликовано',
  published: 'Опубликовано',
  archived: 'В архиве',
  completed: 'Завершён',
  scheduled: 'Запланировано',
  ongoing: 'Идёт',
  finished: 'Завершено',
  cancelled: 'Отменено',
};

export type Field = {
  key: keyof ContentRecord;
  label: string;
  kind?:
    'textarea' | 'datetime-local' | 'amount' | 'currency' | 'year' | 'category';
  options?: string[];
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
  mode?: 'create' | 'edit';
};

export const currencies = {
  RUB: 'Российский рубль',
  CNY: 'Китайский юань',
  KZT: 'Казахстанский тенге',
  BYN: 'Белорусский рубль',
  USD: 'Доллар США',
  EUR: 'Евро',
};

export function normalizeTargetAmount(value: string) {
  const raw = value.trim();
  const match =
    /^(\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/.exec(raw) ??
    /^(\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[.,](\d{1,2}))?$/.exec(raw);
  if (!match) invalidStaffForm('Введите сумму. Копейки отделите запятой.');
  const [, grouped = '', fraction = ''] = match;
  const whole = grouped.replace(/[. \u00a0\u202f]/g, '');
  const integer = whole.replace(/^0+(?=\d)/, '');
  if (integer.length > 12 || !/[1-9]/.test(integer + fraction))
    invalidStaffForm('Укажите сумму от 0,01 до 999.999.999.999,99.');
  return `${integer}.${fraction.padEnd(2, '0')}`;
}

export function formatTargetAmountInput(value: string) {
  const plain = value.replace(/[. \u00a0\u202f]/g, '');
  if (!/^\d*(?:,\d*)?$/.test(plain)) return value;
  const [whole = '', fraction] = plain.split(',');
  return (
    groupAmountDigits(whole) + (fraction === undefined ? '' : `,${fraction}`)
  );
}

export function formatTargetAmount(value: string) {
  try {
    const [whole = '', fraction = '00'] =
      normalizeTargetAmount(value).split('.');
    return groupAmountDigits(whole) + (fraction === '00' ? '' : `,${fraction}`);
  } catch {
    return value;
  }
}

export function fieldValue(field: Field, item?: ContentRecord) {
  return String(
    item?.[field.key] ?? field.defaultValue ?? field.options?.[0] ?? '',
  );
}

export function fieldRequired(field: Field, item?: ContentRecord) {
  return field.required && (!item || field.key !== 'type');
}

export function dateLabel(value?: string) {
  return value
    ? new Date(value).toLocaleString('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';
}

const eventStatuses = ['scheduled', 'ongoing', 'finished', 'cancelled'];
const requiredCategory: Field = {
  key: 'category',
  label: 'Категория',
  kind: 'category',
  required: true,
  maxLength: 100,
};
const dates: Field[] = [
  { key: 'starts_at', label: 'Начало', kind: 'datetime-local', mode: 'create' },
  {
    key: 'ends_at',
    label: 'Окончание',
    kind: 'datetime-local',
    mode: 'create',
  },
];

export const collections: Record<
  Collection,
  {
    label: string;
    create: string;
    titleKey: 'title' | 'name';
    statusKey: 'status' | 'publication_status';
    fields: Field[];
  }
> = {
  news: {
    label: 'Новости',
    create: 'Новая новость',
    titleKey: 'title',
    statusKey: 'status',
    fields: [
      { key: 'title', label: 'Заголовок', required: true, maxLength: 255 },
      requiredCategory,
      {
        key: 'summary',
        label: 'Краткое описание',
        kind: 'textarea',
        required: true,
      },
      { key: 'body', label: 'Текст новости', kind: 'textarea', required: true },
    ],
  },
  events: {
    label: 'События',
    create: 'Новое событие',
    titleKey: 'name',
    statusKey: 'publication_status',
    fields: [
      { key: 'name', label: 'Название', required: true, maxLength: 255 },
      { key: 'type', label: 'Тип события', required: true, maxLength: 80 },
      requiredCategory,
      {
        key: 'description',
        label: 'Описание',
        kind: 'textarea',
        required: true,
      },
      {
        key: 'location',
        label: 'Место проведения',
        maxLength: 255,
        mode: 'edit',
      },
      ...dates.map((field) => ({ ...field, required: true })),
      {
        key: 'event_status',
        label: 'Статус события',
        options: eventStatuses,
        mode: 'create',
      },
    ],
  },
  projects: {
    label: 'Проекты',
    create: 'Новый проект',
    titleKey: 'name',
    statusKey: 'status',
    fields: [
      { key: 'name', label: 'Название', required: true, maxLength: 255 },
      requiredCategory,
      { key: 'short_description', label: 'Краткое описание', kind: 'textarea' },
      {
        key: 'description',
        label: 'Описание',
        kind: 'textarea',
        required: true,
      },
      { key: 'target_amount', label: 'Целевая сумма', kind: 'amount' },
      {
        key: 'currency',
        label: 'Валюта',
        kind: 'currency',
        required: true,
        defaultValue: 'RUB',
        mode: 'create',
      },
      ...dates,
    ],
  },
  documents: {
    label: 'Документы',
    create: 'Новый документ',
    titleKey: 'title',
    statusKey: 'status',
    fields: [
      { key: 'title', label: 'Заголовок', required: true, maxLength: 255 },
      { key: 'description', label: 'Описание', kind: 'textarea' },
      requiredCategory,
      { key: 'reporting_year', label: 'Год отчётности', kind: 'year' },
    ],
  },
};

export function documentFile(data: FormData) {
  return validateDocumentFile(data.get('file'));
}

export function validateDocumentFile(file: unknown) {
  if (
    !(file instanceof File) ||
    !file.size ||
    file.size > 20 * 1024 * 1024 ||
    !/\.(pdf|docx?)$/i.test(file.name)
  )
    invalidStaffForm('Выберите файл PDF, DOC или DOCX размером до 20 МиБ.');
  return file;
}

export function contentPayload(
  fields: Field[],
  data: Record<string, string>,
  current?: ContentRecord,
  categories: string[] = [],
) {
  const payload: Record<string, string> = {};
  for (const field of fields) {
    if (current && !(field.key in data)) continue;
    const raw = (data[field.key] ?? fieldValue(field)).trim();
    const previous = String(current?.[field.key] ?? '');
    if (!raw) {
      if (fieldRequired(field, current))
        invalidStaffForm(`Заполните поле «${field.label}».`);
      if (previous)
        invalidStaffForm(`Введите новое значение для поля «${field.label}».`);
      continue;
    }
    if (raw === previous) continue;
    let value = raw;
    if (field.kind === 'datetime-local') {
      const date = new Date(raw);
      if (Number.isNaN(date.getTime()))
        invalidStaffForm(`Проверьте дату в поле «${field.label}».`);
      value = date.toISOString();
    }
    if (field.kind === 'currency') value = raw.toUpperCase();
    if (
      field.kind === 'year' &&
      (!/^\d{4}$/.test(raw) || Number(raw) < 1900 || Number(raw) > 2100)
    )
      invalidStaffForm('Укажите год отчётности от 1900 до 2100.');
    if (field.kind === 'amount') {
      value = normalizeTargetAmount(raw);
      if (previous && value === normalizeTargetAmount(previous)) continue;
    }
    if (field.kind === 'category') {
      if ([...raw].length > 100)
        invalidStaffForm('Категория длиннее 100 символов.');
      value =
        categories.find(
          (category) =>
            category.toLocaleLowerCase('ru') === raw.toLocaleLowerCase('ru'),
        ) ?? raw;
    }
    if (value !== previous) payload[field.key] = value;
  }
  if (
    payload.starts_at &&
    payload.ends_at &&
    payload.starts_at >= payload.ends_at
  ) {
    invalidStaffForm('Окончание должно быть позже начала.');
  }
  return payload;
}
