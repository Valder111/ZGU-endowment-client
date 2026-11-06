/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApiDocumentUpdateRequest {
  category?: string;
  description?: string;
  reporting_year?: number;
  title?: string;
}

export interface ApiEventCreateRequest {
  category: string;
  description: string;
  ends_at: string;
  event_status: string;
  name: string;
  publication_status: string;
  starts_at: string;
  type: string;
}

export interface ApiEventUpdateRequest {
  category?: string;
  description?: string;
  location?: string;
  name?: string;
  type?: string;
}

export interface ApiNewsCreateRequest {
  body: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  summary?: string;
  title: string;
}

export interface ApiNewsUpdateRequest {
  body?: string;
  category?: string;
  summary?: string;
  title?: string;
}

export interface ApiProjectCreateRequest {
  category: string;
  /** @example "RUB" */
  currency: string;
  description: string;
  ends_at?: string;
  name: string;
  short_description?: string;
  starts_at?: string;
  status: 'draft' | 'published' | 'completed' | 'archived';
  /** @example "150000.00" */
  target_amount?: string;
}

export interface ApiProjectUpdateRequest {
  category?: string;
  description?: string;
  name?: string;
  short_description?: string;
  /** @example "150000.00" */
  target_amount?: string;
}

export interface ApiUserAdminUpdateRequest {
  email?: string;
  first_name?: string;
  is_active?: boolean;
  last_name?: string;
  /**
   * @minLength 8
   * @maxLength 72
   */
  password?: string;
  role?: 'admin' | 'moderator';
}

export interface ApiUserCreateRequest {
  email: string;
  first_name: string;
  last_name: string;
  /**
   * @minLength 8
   * @maxLength 72
   */
  password: string;
  role: 'admin' | 'moderator';
}

export interface ApiUserLoginRequest {
  email: string;
  /** @minLength 8 */
  password: string;
}

export interface ApiUserUpdateRequest {
  current_password: string;
  /**
   * @minLength 8
   * @maxLength 72
   */
  password: string;
}

export interface HandlerDocumentResponse {
  category?: string;
  created_at?: string;
  created_by?: string;
  description?: string;
  id?: string;
  mime_type?: string;
  original_filename?: string;
  published_at?: string;
  reporting_year?: number;
  size_bytes?: number;
  status?: string;
  title?: string;
}

export interface HandlerErrorResponse {
  error?: string;
}

export interface HandlerEventMediaResponse {
  event_id?: string;
  id?: string;
  mime_type?: string;
  original_filename?: string;
  size_bytes?: number;
}

export interface HandlerEventResponse {
  category?: string;
  created_by?: string;
  description?: string;
  ends_at?: string;
  event_status?: string;
  id?: string;
  location?: string;
  name?: string;
  publication_status?: string;
  published_at?: string;
  starts_at?: string;
  type?: string;
}

export interface HandlerLoginResponse {
  email?: string;
  role?: string;
  user_id?: string;
}

export interface HandlerNewsMediaResponse {
  id?: string;
  mime_type?: string;
  news_id?: string;
  original_filename?: string;
  size_bytes?: number;
}

export interface HandlerNewsResponse {
  author_id?: string;
  body?: string;
  category?: string;
  created_at?: string;
  id?: string;
  published_at?: string;
  status?: string;
  summary?: string;
  title?: string;
}

export interface HandlerProjectMediaResponse {
  id?: string;
  mime_type?: string;
  original_filename?: string;
  project_id?: string;
  size_bytes?: number;
}

export interface HandlerProjectResponse {
  category?: string;
  created_by?: string;
  currency?: string;
  description?: string;
  ends_at?: string;
  id?: string;
  name?: string;
  published_at?: string;
  short_description?: string;
  starts_at?: string;
  status?: string;
  /** @example "150000.00" */
  target_amount?: string;
}

export interface HandlerUserResponse {
  email?: string;
  first_name?: string;
  id?: string;
  is_active?: boolean;
  last_name?: string;
  role?: string;
}

export type DocumentsListData = HandlerDocumentResponse[];

export type DocumentsListError = HandlerErrorResponse;

export interface DocumentsCreatePayload {
  /**
   * PDF, DOC или DOCX
   * @format binary
   */
  file: File;
  /** Заголовок */
  title: string;
  /** Описание */
  description?: string;
  /** draft, published или archived */
  status: string;
  /** Категория */
  category: string;
  /** Год отчётности */
  reporting_year?: number;
}

export type DocumentsCreateData = HandlerDocumentResponse;

export type DocumentsCreateError = HandlerErrorResponse;

export type DocumentsDetailData = HandlerDocumentResponse;

export type DocumentsDetailError = HandlerErrorResponse;

export type DocumentsDeleteData = any;

export type DocumentsDeleteError = HandlerErrorResponse;

export type DocumentsPartialUpdateData = any;

export type DocumentsPartialUpdateError = HandlerErrorResponse;

/** @format binary */
export type ContentListData = File;

export type ContentListError = HandlerErrorResponse;

export interface FileUpdatePayload {
  /** PDF, DOC или DOCX */
  file: File;
}

export type FileUpdateData = HandlerDocumentResponse;

export type FileUpdateError = HandlerErrorResponse;

export type PublishCreateData = any;

export type PublishCreateError = HandlerErrorResponse;

export type EventsListData = HandlerEventResponse[];

export type EventsListError = HandlerErrorResponse;

export type EventsCreateData = HandlerEventResponse;

export type EventsCreateError = HandlerErrorResponse;

export type EventsDetailData = HandlerEventResponse;

export type EventsDetailError = HandlerErrorResponse;

export type EventsDeleteData = any;

export type EventsDeleteError = HandlerErrorResponse;

export type EventsPartialUpdateData = any;

export type EventsPartialUpdateError = HandlerErrorResponse;

export type FinishCreateData = any;

export type FinishCreateError = HandlerErrorResponse;

export type MediaListData = HandlerEventMediaResponse[];

export type MediaListError = HandlerErrorResponse;

export interface MediaCreatePayload {
  /** Изображение */
  file: File;
}

export type MediaCreateData = HandlerEventMediaResponse;

export type MediaCreateError = HandlerErrorResponse;

export interface MediaUpdatePayload {
  /** Изображение */
  file: File;
}

export type MediaUpdateData = HandlerEventMediaResponse;

export type MediaUpdateError = HandlerErrorResponse;

export type MediaDeleteData = any;

export type MediaDeleteError = HandlerErrorResponse;

/** @format binary */
export type MediaContentListData = File;

export type MediaContentListError = HandlerErrorResponse;

export type LoginCreateData = HandlerLoginResponse;

export type LoginCreateError = HandlerErrorResponse;

export type GetAuthData = HandlerUserResponse;

export type GetAuthError = HandlerErrorResponse;

export type PatchAuthData = any;

export type PatchAuthError = HandlerErrorResponse;

export type NewsListData = HandlerNewsResponse[];

export type NewsListError = HandlerErrorResponse;

export type NewsCreateData = HandlerNewsResponse;

export type NewsCreateError = HandlerErrorResponse;

export type NewsDetailData = HandlerNewsResponse;

export type NewsDetailError = HandlerErrorResponse;

export type NewsDeleteData = any;

export type NewsDeleteError = HandlerErrorResponse;

export type NewsPartialUpdateData = any;

export type NewsPartialUpdateError = HandlerErrorResponse;

export type MediaListResult = HandlerNewsMediaResponse[];

export type MediaListFail = HandlerErrorResponse;

export interface MediaCreateBody {
  /** Изображение */
  file: File;
}

export type MediaCreateResult = HandlerNewsMediaResponse;

export type MediaCreateFail = HandlerErrorResponse;

export interface MediaUpdateBody {
  /** Изображение */
  file: File;
}

export type MediaUpdateResult = HandlerNewsMediaResponse;

export type MediaUpdateFail = HandlerErrorResponse;

export type MediaDeleteResult = any;

export type MediaDeleteFail = HandlerErrorResponse;

/** @format binary */
export type MediaContentListResult = File;

export type MediaContentListFail = HandlerErrorResponse;

export type PublishCreateResult = any;

export type PublishCreateFail = HandlerErrorResponse;

export type ProjectsListData = HandlerProjectResponse[];

export type ProjectsListError = HandlerErrorResponse;

export type ProjectsCreateData = HandlerProjectResponse;

export type ProjectsCreateError = HandlerErrorResponse;

export type ProjectsDetailData = HandlerProjectResponse;

export type ProjectsDetailError = HandlerErrorResponse;

export type ProjectsDeleteData = any;

export type ProjectsDeleteError = HandlerErrorResponse;

export type ProjectsPartialUpdateData = any;

export type ProjectsPartialUpdateError = HandlerErrorResponse;

export type CompleteCreateData = any;

export type CompleteCreateError = HandlerErrorResponse;

export type MediaListOutput = HandlerProjectMediaResponse[];

export type MediaListFails = HandlerErrorResponse;

export interface MediaCreateInput {
  /** Изображение */
  file: File;
}

export type MediaCreateOutput = HandlerProjectMediaResponse;

export type MediaCreateFails = HandlerErrorResponse;

export interface MediaUpdateInput {
  /** Изображение */
  file: File;
}

export type MediaUpdateOutput = HandlerProjectMediaResponse;

export type MediaUpdateFails = HandlerErrorResponse;

export type MediaDeleteOutput = any;

export type MediaDeleteFails = HandlerErrorResponse;

/** @format binary */
export type MediaContentListOutput = File;

export type MediaContentListFails = HandlerErrorResponse;

export type UsersListData = HandlerUserResponse[];

export type UsersListError = HandlerErrorResponse;

export type UsersCreateData = HandlerUserResponse;

export type UsersCreateError = HandlerErrorResponse;

export type UsersDetailData = HandlerUserResponse;

export type UsersDetailError = HandlerErrorResponse;

export type UsersDeleteData = any;

export type UsersDeleteError = HandlerErrorResponse;

export type UsersPartialUpdateData = any;

export type UsersPartialUpdateError = HandlerErrorResponse;
