import type { ContentRecord } from '@/api/staff';
import { invalidStaffForm } from '@/hooks/requests/mutations/use-staff-action';

export type Collection = 'news' | 'events' | 'projects';

export const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  published: 'Опубликовано',
  archived: 'В архиве',
  completed: 'Завершён',
  scheduled: 'Запланировано',
  ongoing: 'Идёт',
  finished: 'Завершено',
  cancelled: 'Отменено',
};

type Field = {
  key: string;
  label: string;
  kind?: 'textarea' | 'datetime-local' | 'amount' | 'currency';
  options?: string[];
  defaultValue?: string;
  required?: boolean;
  mode?: 'create' | 'edit';
  maxLength?: number;
};

const publicationOptions = ['draft', 'published', 'archived'];
const eventStatuses = ['scheduled', 'ongoing', 'finished', 'cancelled'];
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
    transition: { path: string; label: string; completed: string };
  }
> = {
  news: {
    label: 'Новости',
    create: 'Новая новость',
    titleKey: 'title',
    statusKey: 'status',
    fields: [
      { key: 'title', label: 'Заголовок', required: true, maxLength: 255 },
      { key: 'summary', label: 'Краткое описание', kind: 'textarea' },
      { key: 'body', label: 'Текст новости', kind: 'textarea', required: true },
      {
        key: 'status',
        label: 'Статус публикации',
        options: publicationOptions,
        mode: 'create',
      },
    ],
    transition: {
      path: 'publish',
      label: 'Опубликовать',
      completed: 'published',
    },
  },
  events: {
    label: 'События',
    create: 'Новое событие',
    titleKey: 'name',
    statusKey: 'publication_status',
    fields: [
      { key: 'name', label: 'Название', required: true, maxLength: 255 },
      { key: 'type', label: 'Тип события', required: true, maxLength: 80 },
      {
        key: 'description',
        label: 'Описание',
        kind: 'textarea',
        required: true,
      },
      { key: 'location', label: 'Место проведения', mode: 'edit' },
      ...dates.map((field) => ({ ...field, required: true })),
      {
        key: 'publication_status',
        label: 'Статус публикации',
        options: publicationOptions,
        defaultValue: 'published',
        mode: 'create',
      },
      {
        key: 'event_status',
        label: 'Статус события',
        options: eventStatuses,
        mode: 'create',
      },
    ],
    transition: {
      path: 'finish',
      label: 'Завершить событие',
      completed: 'finished',
    },
  },
  projects: {
    label: 'Проекты',
    create: 'Новый проект',
    titleKey: 'name',
    statusKey: 'status',
    fields: [
      { key: 'name', label: 'Название', required: true, maxLength: 255 },
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
        label: 'Код валюты',
        kind: 'currency',
        required: true,
        defaultValue: 'RUB',
        mode: 'create',
      },
      ...dates,
      {
        key: 'status',
        label: 'Статус проекта',
        options: ['draft', 'published', 'completed', 'archived'],
        defaultValue: 'published',
        mode: 'create',
      },
    ],
    transition: {
      path: 'complete',
      label: 'Завершить проект',
      completed: 'completed',
    },
  },
};

export function contentPayload(
  fields: Field[],
  data: FormData,
  current?: ContentRecord,
) {
  const payload: Record<string, string> = {};
  for (const field of fields) {
    const raw = String(data.get(field.key) ?? '').trim();
    const previous = current?.[field.key] ?? '';
    if (!raw) {
      if (field.required && (!current || field.key !== 'type'))
        invalidStaffForm(`Заполните поле «${field.label}».`);
      if (previous)
        invalidStaffForm(
          `Поле «${field.label}» можно заменить новым значением.`,
        );
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
    if (field.kind === 'amount') {
      value = raw.replace(',', '.');
      if (!/^\d+(\.\d+)?$/.test(value) || !/[1-9]/.test(value)) {
        invalidStaffForm('Укажите положительную целевую сумму.');
      }
    }
    payload[field.key] = value;
  }
  if (
    payload.starts_at &&
    payload.ends_at &&
    payload.starts_at >= payload.ends_at
  ) {
    invalidStaffForm('Окончание должно быть позже начала.');
  }
  if (!Object.keys(payload).length)
    invalidStaffForm('Внесите изменения перед сохранением.');
  return payload;
}
