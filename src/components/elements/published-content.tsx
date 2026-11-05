import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  CalendarDays,
  Download,
  FileText,
  Layers3,
  MapPin,
  Newspaper,
} from 'lucide-react';
import {
  staffApi,
  staffBase,
  staffResult,
  type ContentRecord,
} from '@/api/staff';
import {
  collectionApi,
  type Collection,
  type PhotoApi,
} from '@/api/staff-content';
import type { RequestParams } from '@/api/generated/http-client';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import { useStaffAction } from '@/hooks/requests/mutations/use-staff-action';
import { downloadBlob } from '@/utils/download-blob';

const anonymous: RequestParams = {
  adapter: 'fetch',
  withCredentials: false,
  fetchOptions: { cache: 'no-store' },
};
const headings = {
  news: 'Новости фонда',
  events: 'События фонда',
  projects: 'Опубликованные проекты',
  documents: 'Опубликованные документы',
};
const articleKinds = {
  news: { label: 'Новости', icon: Newspaper },
  events: { label: 'События', icon: CalendarDays },
  projects: { label: 'Проекты', icon: Layers3 },
};

function dateLabel(value: string, withTime: boolean) {
  return new Date(value).toLocaleString('ru-RU', {
    dateStyle: 'long',
    timeStyle: withTime ? 'short' : undefined,
  });
}

function goalLabel(amount?: string, currency?: string) {
  if (
    !amount ||
    !currency ||
    !/^[A-Z]{3}$/.test(currency) ||
    !Number.isFinite(Number(amount))
  )
    return;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function PublishedPhoto({
  api,
  id,
  photoId,
  cover = false,
}: {
  api: PhotoApi;
  id: string;
  photoId: string;
  cover?: boolean;
}) {
  const image = useRef<HTMLImageElement>(null);
  const load = useCallback(
    (params: RequestParams) =>
      api.mediaContentList(id, photoId, {
        ...anonymous,
        ...params,
        format: 'blob',
      }),
    [api, id, photoId],
  );
  const { data } = useStaffResource(staffResult, load);

  useEffect(() => {
    if (!data || !image.current) return;
    const url = URL.createObjectURL(data);
    image.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [data]);

  return (
    data && (
      <img
        ref={image}
        className={cover ? 'published-cover-image' : 'published-gallery-image'}
        alt=""
      />
    )
  );
}

function PublishedArticle({
  id,
  title,
  item,
  api,
  collection,
}: {
  id: string;
  title: string;
  item: ContentRecord;
  api: PhotoApi;
  collection: keyof typeof articleKinds;
}) {
  const card = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!card.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: '300px' },
    );
    observer.observe(card.current);
    return () => observer.disconnect();
  }, []);

  const load = useCallback(
    (params: RequestParams) => api.mediaList(id, { ...anonymous, ...params }),
    [api, id],
  );
  const { data: photos } = useStaffResource(staffResult, load, near);
  const [cover, ...gallery] = (Array.isArray(photos) ? photos : []).flatMap(
    (photo) => (photo.id ? [encodeURIComponent(photo.id)] : []),
  );
  const { icon: Icon, label } = articleKinds[collection];
  const date = item.starts_at ?? item.published_at;
  const summary = item.summary || item.short_description;
  const body = item.body ?? item.description;
  const goal = goalLabel(item.target_amount, item.currency);
  return (
    <article ref={card} className="published-card" data-kind={collection}>
      <div className="published-cover">
        <Icon className="published-cover-mark" aria-hidden="true" />
        {cover && <PublishedPhoto api={api} id={id} photoId={cover} cover />}
        <span className="published-chip">{label}</span>
      </div>
      <div className="published-card-body">
        {date && (
          <time className="published-meta" dateTime={date}>
            {dateLabel(date, collection === 'events')}
          </time>
        )}
        <h3>{title}</h3>
        {item.location && (
          <p className="published-meta">
            <MapPin size={16} aria-hidden="true" />
            {item.location}
          </p>
        )}
        {goal && (
          <p className="published-meta">
            Целевая сумма <strong>{goal}</strong>
          </p>
        )}
        {summary && <p>{summary}</p>}
        {((body && body !== summary) || gallery.length > 0) && (
          <details
            className="published-details"
            onToggle={(event) => setExpanded(event.currentTarget.open)}
          >
            <summary>Подробнее</summary>
            {body && body !== summary && (
              <p className="whitespace-pre-line">{body}</p>
            )}
            {expanded && gallery.length > 0 && (
              <div className="published-gallery">
                {gallery.map((photoId) => (
                  <PublishedPhoto
                    key={photoId}
                    api={api}
                    id={id}
                    photoId={photoId}
                  />
                ))}
              </div>
            )}
          </details>
        )}
      </div>
    </article>
  );
}

function PublishedDocument({ id, item }: { id: string; item: ContentRecord }) {
  const action = useStaffAction();

  function download() {
    void action.run(async () => {
      const file = await staffResult(
        staffApi.documents.contentList(encodeURIComponent(id), {
          ...anonymous,
          format: 'blob',
        }),
      );
      downloadBlob(file, item.original_filename ?? item.title ?? 'document');
    }, '');
  }

  return (
    <article className="published-card published-document">
      <div className="published-document-mark">
        <FileText aria-hidden="true" size={26} />
      </div>
      <div className="published-card-body">
        <p className="published-meta">
          {[item.category || 'Документ', item.reporting_year]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
        {action.error && <p role="alert">{action.error}</p>}
        <button
          type="button"
          className="published-download"
          disabled={action.pending}
          onClick={download}
        >
          <Download size={17} aria-hidden="true" />
          {action.pending ? 'Загрузка…' : 'Скачать файл'}
        </button>
      </div>
    </article>
  );
}

export function PublishedContent({
  collection,
  limit,
}: {
  collection: Collection;
  limit?: number;
}) {
  const titleId = useId();
  const load = useCallback(
    (params: RequestParams) =>
      collectionApi[collection].list({ ...anonymous, ...params }),
    [collection],
  );
  const resource = useStaffResource(staffResult, load, Boolean(staffBase));
  const records = (Array.isArray(resource.data) ? resource.data : [])
    .filter(
      (item) =>
        item.id &&
        (item.title || item.name) &&
        ((item.publication_status ?? item.status) === 'published' ||
          (collection === 'projects' &&
            item.status === 'completed' &&
            Boolean(item.published_at))),
    )
    .slice(0, limit);
  if (!records.length) return null;
  const photos = collectionApi[collection].photos;

  return (
    <section
      className="editorial-section published-section"
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>{headings[collection]}</h2>
      <div className="published-grid">
        {records.map((item) => {
          const title = item.title || item.name;
          if (!item.id || !title) return null;
          if (collection === 'documents')
            return <PublishedDocument key={item.id} id={item.id} item={item} />;
          return (
            photos && (
              <PublishedArticle
                key={item.id}
                id={encodeURIComponent(item.id)}
                title={title}
                item={item}
                api={photos}
                collection={collection}
              />
            )
          );
        })}
      </div>
    </section>
  );
}
