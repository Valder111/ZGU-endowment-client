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

import type {
  ApiNewsCreateRequest,
  ApiNewsUpdateRequest,
  MediaContentListFail,
  MediaContentListResult,
  MediaCreateBody,
  MediaCreateFail,
  MediaCreateResult,
  MediaDeleteFail,
  MediaDeleteResult,
  MediaListFail,
  MediaListResult,
  MediaUpdateBody,
  MediaUpdateFail,
  MediaUpdateResult,
  NewsCreateData,
  NewsCreateError,
  NewsDeleteData,
  NewsDeleteError,
  NewsDetailData,
  NewsDetailError,
  NewsListData,
  NewsListError,
  NewsPartialUpdateData,
  NewsPartialUpdateError,
  PublishCreateFail,
  PublishCreateResult,
} from "./data-contracts";
import { HttpClient, type RequestParams } from "./http-client";

export class News<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Без сессии черновики не отдаются. С сессией сотрудника видны его черновики. Черновик по id без сессии отвечает 401, чужому сотруднику - 403.
   *
   * @tags news
   * @name NewsList
   * @summary Список новостей
   * @request GET:/news
   * @response `200` `NewsListData` OK
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  newsList = (params: RequestParams = {}) =>
    this.request<NewsListData, NewsListError>({
      path: `/news`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Автор - текущий пользователь.
   *
   * @tags news
   * @name NewsCreate
   * @summary Создание новости
   * @request POST:/news
   * @secure
   * @response `201` `NewsCreateData` Created
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  newsCreate = (body: ApiNewsCreateRequest, params: RequestParams = {}) =>
    this.request<NewsCreateData, NewsCreateError>({
      path: `/news`,
      method: "POST",
      body: body,
      secure: true,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Без сессии черновики не отдаются. С сессией сотрудника видны его черновики. Черновик по id без сессии отвечает 401, чужому сотруднику - 403.
   *
   * @tags news
   * @name NewsDetail
   * @summary Новость по id
   * @request GET:/news/{id}
   * @response `200` `NewsDetailData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  newsDetail = (id: string, params: RequestParams = {}) =>
    this.request<NewsDetailData, NewsDetailError>({
      path: `/news/${id}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Запись остаётся в базе, из списков и чтения пропадает.
   *
   * @tags news
   * @name NewsDelete
   * @summary Удаление новости
   * @request DELETE:/news/{id}
   * @secure
   * @response `204` `NewsDeleteData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  newsDelete = (id: string, params: RequestParams = {}) =>
    this.request<NewsDeleteData, NewsDeleteError>({
      path: `/news/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags news
   * @name NewsPartialUpdate
   * @summary Обновление новости
   * @request PATCH:/news/{id}
   * @secure
   * @response `204` `NewsPartialUpdateData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  newsPartialUpdate = (
    id: string,
    body: ApiNewsUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<NewsPartialUpdateData, NewsPartialUpdateError>({
      path: `/news/${id}`,
      method: "PATCH",
      body: body,
      secure: true,
      type: "application/json",
      ...params,
    });
  /**
   * @description Черновик новости без сессии отвечает 401, чужому сотруднику - 403. id в ответе - id связи, его же принимают изменение, удаление и файл
   *
   * @tags news
   * @name MediaList
   * @summary Фотографии новости
   * @request GET:/news/{id}/media
   * @response `200` `MediaListResult` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaList = (id: string, params: RequestParams = {}) =>
    this.request<MediaListResult, MediaListFail>({
      path: `/news/${id}/media`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Поле file: JPEG, PNG, GIF или WebP, до 10 МБ. К новости можно прикрепить несколько файлов
   *
   * @tags news
   * @name MediaCreate
   * @summary Добавление фотографии новости
   * @request POST:/news/{id}/media
   * @secure
   * @response `201` `MediaCreateResult` Created
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaCreate = (
    id: string,
    data: MediaCreateBody,
    params: RequestParams = {},
  ) =>
    this.request<MediaCreateResult, MediaCreateFail>({
      path: `/news/${id}/media`,
      method: "POST",
      body: data,
      secure: true,
      type: "multipart/form-data",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Связь сохраняется, объект в MinIO заменяется
   *
   * @tags news
   * @name MediaUpdate
   * @summary Замена фотографии новости
   * @request PUT:/news/{id}/media/{mediaId}
   * @secure
   * @response `200` `MediaUpdateResult` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaUpdate = (
    id: string,
    mediaId: string,
    data: MediaUpdateBody,
    params: RequestParams = {},
  ) =>
    this.request<MediaUpdateResult, MediaUpdateFail>({
      path: `/news/${id}/media/${mediaId}`,
      method: "PUT",
      body: data,
      secure: true,
      type: "multipart/form-data",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags news
   * @name MediaDelete
   * @summary Удаление фотографии новости
   * @request DELETE:/news/{id}/media/{mediaId}
   * @secure
   * @response `204` `MediaDeleteResult` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaDelete = (id: string, mediaId: string, params: RequestParams = {}) =>
    this.request<MediaDeleteResult, MediaDeleteFail>({
      path: `/news/${id}/media/${mediaId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Черновик новости без сессии отвечает 401, чужому сотруднику - 403. mediaId - id связи из списка фотографий
   *
   * @tags news
   * @name MediaContentList
   * @summary Файл фотографии новости
   * @request GET:/news/{id}/media/{mediaId}/content
   * @response `200` `MediaContentListResult` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaContentList = (
    id: string,
    mediaId: string,
    params: RequestParams = {},
  ) =>
    this.request<MediaContentListResult, MediaContentListFail>({
      path: `/news/${id}/media/${mediaId}/content`,
      method: "GET",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags news
   * @name PublishCreate
   * @summary Публикация новости
   * @request POST:/news/{id}/publish
   * @secure
   * @response `204` `PublishCreateResult` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  publishCreate = (id: string, params: RequestParams = {}) =>
    this.request<PublishCreateResult, PublishCreateFail>({
      path: `/news/${id}/publish`,
      method: "POST",
      secure: true,
      ...params,
    });
}
