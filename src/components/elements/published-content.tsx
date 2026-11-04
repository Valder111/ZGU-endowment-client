import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
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

function PublishedPhoto({
  api,
  id,
  photoId,
}: {
  api: PhotoApi;
  id: string;
  photoId: string;
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
        className="mt-4 max-h-80 max-w-full rounded-lg object-contain"
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
}: {
  id: string;
  title: string;
  item: ContentRecord;
  api: PhotoApi;
}) {
  const [expanded, setExpanded] = useState(false);
  const load = useCallback(
    (params: RequestParams) => api.mediaList(id, { ...anonymous, ...params }),
    [api, id],
  );
  const { data: photos } = useStaffResource(staffResult, load, expanded);
  const date = item.starts_at ?? item.published_at;
  const summary = item.summary ?? item.short_description;
  const body = item.body ?? item.description;
  return (
    <article className="document-item">
      <FileText aria-hidden="true" size={26} />
      <div>
        {date && (
          <time className="eyebrow" dateTime={date}>
            {new Date(date).toLocaleDateString('ru-RU')}
          </time>
        )}
        <h3>{title}</h3>
        {item.location && <p>{item.location}</p>}
        {summary && <p>{summary}</p>}
        <details onToggle={(event) => setExpanded(event.currentTarget.open)}>
          <summary>Подробнее</summary>
          {body && <p className="whitespace-pre-line">{body}</p>}
          {photos?.map(
            (photo) =>
              photo.id && (
                <PublishedPhoto
                  key={photo.id}
                  api={api}
                  id={id}
                  photoId={encodeURIComponent(photo.id)}
                />
              ),
          )}
        </details>
      </div>
    </article>
  );
}

function PublishedDocument({ id, item }: { id: string; item: ContentRecord }) {
  const action = useStaffAction();

  return (
    <article className="document-item">
      <FileText aria-hidden="true" size={26} />
      <div>
        <span className="eyebrow">
          {[item.category, item.reporting_year].filter(Boolean).join(' · ')}
        </span>
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
        {action.error && <p role="alert">{action.error}</p>}
      </div>
      <button
        type="button"
        className="text-link"
        disabled={action.pending}
        onClick={() => {
          void action.run(async () => {
            const file = await staffResult(
              staffApi.documents.contentList(encodeURIComponent(id), {
                ...anonymous,
                format: 'blob',
              }),
            );
            downloadBlob(
              file,
              item.original_filename ?? item.title ?? 'document',
            );
          }, '');
        }}
      >
        {action.pending ? 'Загрузка…' : 'Скачать'}
      </button>
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
  const records = resource.data
    ?.filter(
      (item) =>
        item.id &&
        (item.title || item.name) &&
        ((item.publication_status ?? item.status) === 'published' ||
          (collection === 'projects' &&
            item.status === 'completed' &&
            Boolean(item.published_at))),
    )
    .slice(0, limit);
  if (!records?.length) return null;
  const photos = collectionApi[collection].photos;

  return (
    <section className="editorial-section" aria-labelledby={titleId}>
      <h2 id={titleId}>{headings[collection]}</h2>
      <div className="document-list">
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
              />
            )
          );
        })}
      </div>
    </section>
  );
}
