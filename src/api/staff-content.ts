import type { AxiosResponse } from 'axios';
import type { RequestParams } from './generated/http-client';
import type { HandlerNewsMediaResponse } from './generated/data-contracts';
import { staffApi, type ContentRecord } from './staff';

export type Collection = 'news' | 'events' | 'projects' | 'documents';

export const publicContentParams: RequestParams = {
  adapter: 'fetch',
  withCredentials: false,
  fetchOptions: { cache: 'no-store' },
};

export type PhotoApi = {
  mediaList: (
    id: string,
    params?: RequestParams,
  ) => Promise<AxiosResponse<HandlerNewsMediaResponse[]>>;
  mediaContentList: (
    id: string,
    mediaId: string,
    params?: RequestParams,
  ) => Promise<AxiosResponse<Blob>>;
  mediaCreate: (
    id: string,
    body: { file: File },
  ) => Promise<AxiosResponse<unknown>>;
  mediaUpdate: (
    id: string,
    mediaId: string,
    body: { file: File },
  ) => Promise<AxiosResponse<unknown>>;
  mediaDelete: (id: string, mediaId: string) => Promise<AxiosResponse<unknown>>;
};

type CollectionApi = {
  list: (params?: RequestParams) => Promise<AxiosResponse<ContentRecord[]>>;
  detail: (
    id: string,
    params?: RequestParams,
  ) => Promise<AxiosResponse<ContentRecord>>;
  create: (
    fields: Record<string, string>,
    file?: File,
  ) => Promise<AxiosResponse<ContentRecord>>;
  update: (
    id: string,
    fields: Record<string, string>,
  ) => Promise<AxiosResponse<unknown>>;
  remove: (id: string) => Promise<AxiosResponse<unknown>>;
  publish?: (id: string) => Promise<AxiosResponse<unknown>>;
  complete?: (id: string) => Promise<AxiosResponse<unknown>>;
  photos?: PhotoApi;
};

export function isPublished(collection: Collection, item: ContentRecord) {
  return (
    (item.publication_status ?? item.status) === 'published' ||
    (collection === 'projects' &&
      item.status === 'completed' &&
      Boolean(item.published_at))
  );
}

const { news, events, projects, documents } = staffApi;

function required(value?: string) {
  if (value === undefined) throw new Error('Required content field is missing');
  return value;
}

function publicationStatus(status?: string) {
  if (status === 'draft' || status === 'published' || status === 'archived')
    return status;
  throw new Error('Unexpected publication status');
}

export const collectionApi: Record<Collection, CollectionApi> = {
  news: {
    list: news.newsList,
    detail: news.newsDetail,
    create: ({ title, body, summary, status, category }) =>
      news.newsCreate({
        title: required(title),
        body: required(body),
        category: required(category),
        summary: required(summary),
        status: publicationStatus(status),
      }),
    update: news.newsPartialUpdate,
    remove: news.newsDelete,
    publish: news.publishCreate,
    photos: news,
  },
  events: {
    list: events.eventsList,
    detail: events.eventsDetail,
    create: ({
      name,
      type,
      description,
      category,
      starts_at,
      ends_at,
      event_status,
      publication_status,
    }) =>
      events.eventsCreate({
        name: required(name),
        type: required(type),
        description: required(description),
        category: required(category),
        starts_at: required(starts_at),
        ends_at: required(ends_at),
        event_status: required(event_status),
        publication_status: required(publication_status),
      }),
    update: events.eventsPartialUpdate,
    remove: events.eventsDelete,
    complete: events.finishCreate,
    photos: events,
  },
  projects: {
    list: projects.projectsList,
    detail: projects.projectsDetail,
    create: ({
      name,
      description,
      short_description,
      category,
      starts_at,
      ends_at,
      target_amount,
      currency,
      status,
    }) =>
      projects.projectsCreate({
        name: required(name),
        description: required(description),
        category: required(category),
        short_description,
        starts_at,
        ends_at,
        target_amount,
        currency: required(currency),
        status: status === 'completed' ? status : publicationStatus(status),
      }),
    update: projects.projectsPartialUpdate,
    remove: projects.projectsDelete,
    complete: projects.completeCreate,
    photos: projects,
  },
  documents: {
    list: (params) => documents.documentsList(undefined, params),
    detail: documents.documentsDetail,
    create: (
      { title, description, status, category, reporting_year },
      file,
    ) => {
      if (!file) throw new Error('Document file is required');
      return documents.documentsCreate({
        title: required(title),
        status: required(status),
        category: required(category),
        file,
        ...(description ? { description } : {}),
        ...(reporting_year ? { reporting_year: Number(reporting_year) } : {}),
      });
    },
    update: (id, { title, description, category, reporting_year }) =>
      documents.documentsPartialUpdate(id, {
        title,
        description,
        category,
        reporting_year: reporting_year ? Number(reporting_year) : undefined,
      }),
    remove: documents.documentsDelete,
    publish: documents.publishCreate,
  },
};
