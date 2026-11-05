import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  FileText,
  Flag,
  Layers3,
  MapPin,
  Newspaper,
  Tag,
  Wallet,
} from 'lucide-react';
import {
  staffApi,
  staffBase,
  staffResult,
  type ContentRecord,
} from '@/api/staff';
import {
  collectionApi,
  isPublished,
  type Collection,
  type PhotoApi,
} from '@/api/staff-content';
import type { RequestParams } from '@/api/generated/http-client';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import { useStaffAction } from '@/hooks/requests/mutations/use-staff-action';
import { downloadBlob } from '@/utils/download-blob';
import { PageTitle } from './page-title';
import { SiteLink } from './site-link';

const anonymous: RequestParams = {
  adapter: 'fetch',
  withCredentials: false,
  fetchOptions: { cache: 'no-store' },
};

const publicationKinds = {
  news: {
    label: 'Новость',
    heading: 'Новости фонда',
    href: '/news/',
    icon: Newspaper,
    scene: 'news',
  },
  events: {
    label: 'Событие',
    heading: 'События фонда',
    href: '/events/',
    icon: CalendarDays,
    scene: 'events',
  },
  projects: {
    label: 'Проект',
    heading: 'Опубликованные проекты',
    href: '/projects/',
    icon: Layers3,
    scene: 'science',
  },
  documents: {
    label: 'Документ',
    heading: 'Опубликованные документы',
    href: '/about/constituent-the-documents/',
    icon: FileText,
    scene: 'documents',
  },
} as const;

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
  variant,
  alt = '',
}: {
  api: PhotoApi;
  id: string;
  photoId: string;
  variant: 'cover' | 'hero' | 'gallery';
  alt?: string;
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
    const element = image.current;
    const frame = element?.parentElement;
    if (!data || !element || !frame) return;
    const url = URL.createObjectURL(data);
    frame.hidden = false;
    frame.style.setProperty('--publication-photo', `url("${url}")`);
    element.src = url;
    return () => URL.revokeObjectURL(url);
  }, [data]);

  return (
    data && (
      <div className="publication-photo" data-variant={variant}>
        <img
          ref={image}
          alt={alt}
          decoding="async"
          onError={({ currentTarget }) => {
            if (currentTarget.parentElement)
              currentTarget.parentElement.hidden = true;
          }}
        />
      </div>
    )
  );
}

function usePublicationPhotos(
  api: PhotoApi | undefined,
  id: string,
  enabled: boolean,
) {
  const load = useCallback(
    (params: RequestParams) =>
      api
        ? api.mediaList(id, { ...anonymous, ...params })
        : Promise.reject(new Error('Photos unavailable')),
    [api, id],
  );
  const { data } = useStaffResource(staffResult, load, Boolean(api && enabled));
  return (Array.isArray(data) ? data : []).flatMap((photo) =>
    photo.id ? [encodeURIComponent(photo.id)] : [],
  );
}

function DocumentMetadata({ item }: { item: ContentRecord }) {
  const metadata = [item.category || 'Документ', item.reporting_year]
    .filter(Boolean)
    .join(' · ');
  return <p className="published-meta">{metadata}</p>;
}

const eventLabels: Record<string, string> = {
  scheduled: 'Запланировано',
  ongoing: 'Идёт',
  finished: 'Завершено',
  cancelled: 'Отменено',
};

function publicationStatus(collection: Collection, item: ContentRecord) {
  if (collection === 'events' && item.event_status)
    return eventLabels[item.event_status];
  if (collection === 'projects' && item.status === 'completed')
    return 'Завершён';
}

type Fact = { label: string; value: ReactNode; icon: typeof CalendarDays };

function publicationFacts(
  collection: Collection,
  item: ContentRecord,
  full = false,
) {
  const facts: Fact[] = [];
  const date = item.starts_at ?? item.published_at;
  const goal = goalLabel(item.target_amount, item.currency);
  const status = publicationStatus(collection, item);
  if (full && item.category)
    facts.push({ label: 'Категория', value: item.category, icon: Tag });
  if (date)
    facts.push({
      label: item.starts_at ? 'Начало' : 'Опубликовано',
      value: (
        <time dateTime={date}>{dateLabel(date, collection === 'events')}</time>
      ),
      icon: CalendarDays,
    });
  if (full && item.ends_at)
    facts.push({
      label: 'Окончание',
      value: (
        <time dateTime={item.ends_at}>
          {dateLabel(item.ends_at, collection === 'events')}
        </time>
      ),
      icon: CalendarDays,
    });
  if (item.location)
    facts.push({
      label: 'Место проведения',
      value: item.location,
      icon: MapPin,
    });
  if (goal) facts.push({ label: 'Целевая сумма', value: goal, icon: Wallet });
  if (full && collection === 'events' && item.type)
    facts.push({ label: 'Формат', value: item.type, icon: Layers3 });
  if (full && status)
    facts.push({ label: 'Статус', value: status, icon: Flag });
  return facts;
}

function PublicationFacts({ facts }: { facts: Fact[] }) {
  if (!facts.length) return null;
  return (
    <dl className="publication-facts">
      {facts.map(({ label, value, icon: Icon }) => (
        <div key={label}>
          <Icon size={17} aria-hidden="true" />
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PublicationCard({
  collection,
  id,
  title,
  item,
}: {
  collection: Exclude<Collection, 'documents'>;
  id: string;
  title: string;
  item: ContentRecord;
}) {
  const card = useRef<HTMLAnchorElement>(null);
  const titleId = useId();
  const [near, setNear] = useState(false);
  const api = collectionApi[collection].photos;
  useEffect(() => {
    if (!card.current || !api) return;
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
  }, [api]);

  const [cover] = usePublicationPhotos(api, encodeURIComponent(id), near);
  const { icon: Icon, label } = publicationKinds[collection];
  const preview =
    item.summary || item.short_description || item.description || item.body;
  const query = new URLSearchParams({ type: collection, id });
  const status = publicationStatus(collection, item);

  return (
    <article
      className="published-card publication-feature"
      data-kind={collection}
    >
      <SiteLink
        href={`/publications/?${query}`}
        className="published-card-link"
        ref={card}
        aria-labelledby={titleId}
      >
        <div className="published-cover">
          <Icon className="published-cover-mark" aria-hidden="true" />
          {api && cover && (
            <PublishedPhoto
              api={api}
              id={encodeURIComponent(id)}
              photoId={cover}
              variant="cover"
            />
          )}
          <span className="published-chip">{label}</span>
        </div>
        <div className="published-card-body">
          {(item.category || status) && (
            <div className="publication-tags">
              {item.category && <span>{item.category}</span>}
              {status && <span data-state={item.event_status}>{status}</span>}
            </div>
          )}
          <h3 id={titleId}>{title}</h3>
          {preview && <p className="published-preview">{preview}</p>}
          <PublicationFacts facts={publicationFacts(collection, item)} />
          <span className="published-more" aria-hidden="true">
            {collection === 'news'
              ? 'Читать новость'
              : collection === 'events'
                ? 'О событии'
                : 'О проекте'}{' '}
            <ArrowUpRight size={17} />
          </span>
        </div>
      </SiteLink>
    </article>
  );
}

function PublishedDownload({
  id,
  item,
  compact = false,
}: {
  id: string;
  item: ContentRecord;
  compact?: boolean;
}) {
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

  const controls = (
    <>
      <button
        type="button"
        className="published-download"
        disabled={action.pending}
        onClick={download}
      >
        <ArrowDownToLine size={17} aria-hidden="true" />
        {action.pending ? 'Загрузка…' : 'Скачать файл'}
      </button>
      {action.error && <p role="alert">{action.error}</p>}
    </>
  );
  if (compact) return controls;
  return (
    <div className="publication-file">
      <FileText size={25} aria-hidden="true" />
      <div>
        <strong>{item.original_filename ?? item.title}</strong>
        {Boolean(item.size_bytes) && (
          <p>
            {new Intl.NumberFormat('ru-RU', {
              maximumFractionDigits: 1,
            }).format((item.size_bytes ?? 0) / 1024)}{' '}
            КБ
          </p>
        )}
      </div>
      {controls}
    </div>
  );
}

function PublishedDocument({
  id,
  title,
  item,
}: {
  id: string;
  title: string;
  item: ContentRecord;
}) {
  const query = new URLSearchParams({ type: 'documents', id });
  return (
    <article
      className="published-card published-document"
      data-kind="documents"
    >
      <div className="published-document-mark">
        <FileText size={26} aria-hidden="true" />
      </div>
      <div className="published-card-body">
        <DocumentMetadata item={item} />
        <h3>{title}</h3>
        {item.description && (
          <p className="published-preview">{item.description}</p>
        )}
        <div className="published-document-actions">
          <PublishedDownload id={id} item={item} compact />
          <SiteLink
            href={`/publications/?${query}`}
            className="published-more"
            aria-label={`Подробнее — ${title}`}
          >
            Подробнее <ArrowUpRight size={15} aria-hidden="true" />
          </SiteLink>
        </div>
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
  const { data } = useStaffResource(staffResult, load, Boolean(staffBase));
  const records = (Array.isArray(data) ? data : [])
    .flatMap((item) => {
      const title = item.title || item.name;
      return item.id && title && isPublished(collection, item)
        ? [{ id: item.id, title, item }]
        : [];
    })
    .slice(0, limit);
  if (!records.length) return null;

  return (
    <section
      className="editorial-section published-section"
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>{publicationKinds[collection].heading}</h2>
      <div
        className="published-grid"
        data-layout={collection === 'documents' ? 'documents' : 'editorial'}
      >
        {records.map(({ id, title, item }) =>
          collection === 'documents' ? (
            <PublishedDocument key={id} id={id} title={title} item={item} />
          ) : (
            <PublicationCard
              key={id}
              collection={collection}
              id={id}
              title={title}
              item={item}
            />
          ),
        )}
      </div>
    </section>
  );
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

export function PublicationPage() {
  const search = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.search,
    () => undefined,
  );
  const query = new URLSearchParams(search);
  const kind = query.get('type');
  const id = query.get('id');
  const collection =
    kind && Object.hasOwn(publicationKinds, kind)
      ? (kind as Collection)
      : undefined;
  const load = useCallback(
    (params: RequestParams) =>
      collection && id
        ? collectionApi[collection].detail(encodeURIComponent(id), {
            ...anonymous,
            ...params,
          })
        : Promise.reject(new Error('Publication unavailable')),
    [collection, id],
  );
  const { data, loading } = useStaffResource(
    staffResult,
    load,
    Boolean(staffBase && collection && id),
  );
  const item =
    collection && data && isPublished(collection, data) ? data : undefined;
  const api = collection && collectionApi[collection].photos;
  const photos = usePublicationPhotos(
    api,
    encodeURIComponent(id ?? ''),
    Boolean(item),
  );
  const meta = collection ? publicationKinds[collection] : undefined;
  const title = item?.title || item?.name;
  const summary = item?.summary || item?.short_description;
  const body = item?.body || item?.description;
  const featured = Boolean(collection && collection !== 'documents');
  const facts =
    featured && item && collection
      ? publicationFacts(collection, item, true)
      : [];
  const contentId = useId();

  useEffect(() => {
    if (title) document.title = `${title} – Эндаумент-фонд ЗГУ`;
  }, [title]);

  return (
    <>
      <PageTitle
        title={title || 'Публикация фонда'}
        eyebrow={meta?.label ?? 'МАТЕРИАЛЫ ФОНДА'}
        scene={meta?.scene ?? 'news'}
        className={
          featured
            ? `page-title publication-title publication-title--${collection}`
            : undefined
        }
      />
      <section className={featured ? 'section publication-section' : 'section'}>
        <div
          className={
            featured
              ? 'wrap publication-detail publication-feature-detail'
              : 'wrap publication-detail'
          }
          data-kind={collection}
        >
          <SiteLink href={meta?.href ?? '/'} className="published-more">
            <ArrowLeft size={17} aria-hidden="true" />{' '}
            {meta?.heading ?? 'На главную'}
          </SiteLink>
          {search === undefined || loading ? (
            <p role="status">Загрузка публикации…</p>
          ) : item && id && collection === 'documents' ? (
            <article className="publication-body">
              <DocumentMetadata item={item} />
              {body && <p className="publication-text">{body}</p>}
              <PublishedDownload id={id} item={item} />
            </article>
          ) : item && id && collection ? (
            <>
              {api && photos[0] && (
                <PublishedPhoto
                  api={api}
                  id={encodeURIComponent(id)}
                  photoId={photos[0]}
                  variant="hero"
                  alt={`Фотография к публикации «${title}»`}
                />
              )}
              <div className="publication-reading">
                {(summary || body) && (
                  <article
                    className="publication-body publication-feature-body"
                    aria-labelledby={contentId}
                  >
                    <h2 id={contentId}>
                      {collection === 'news' ? 'Материал' : 'Описание'}
                    </h2>
                    {summary && summary !== body && (
                      <p className="publication-lead">{summary}</p>
                    )}
                    {body && <p className="publication-text">{body}</p>}
                  </article>
                )}
                {facts.length > 0 && (
                  <aside
                    className="publication-overview"
                    aria-label="Сведения о публикации"
                  >
                    <h2>Сведения</h2>
                    <PublicationFacts facts={facts} />
                  </aside>
                )}
              </div>
              {api && photos.length > 1 && (
                <section className="publication-gallery">
                  <h2>Фотографии</h2>
                  <div className="published-gallery">
                    {photos.slice(1).map((photoId, index) => (
                      <PublishedPhoto
                        key={photoId}
                        api={api}
                        id={encodeURIComponent(id)}
                        photoId={photoId}
                        variant="gallery"
                        alt={`Фотография ${index + 2} к публикации «${title}»`}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <p>Публикация недоступна. Вернитесь к списку материалов.</p>
          )}
        </div>
      </section>
    </>
  );
}
