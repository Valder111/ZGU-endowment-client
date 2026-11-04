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
  ApiEventCreateRequest,
  ApiEventUpdateRequest,
  EventsCreateData,
  EventsCreateError,
  EventsDeleteData,
  EventsDeleteError,
  EventsDetailData,
  EventsDetailError,
  EventsListData,
  EventsListError,
  EventsPartialUpdateData,
  EventsPartialUpdateError,
  FinishCreateData,
  FinishCreateError,
  MediaContentListData,
  MediaContentListError,
  MediaCreateData,
  MediaCreateError,
  MediaCreatePayload,
  MediaDeleteData,
  MediaDeleteError,
  MediaListData,
  MediaListError,
  MediaUpdateData,
  MediaUpdateError,
  MediaUpdatePayload,
} from "./data-contracts";
import { HttpClient, type RequestParams } from "./http-client";

export class Events<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Без сессии черновики не отдаются. С сессией сотрудника видны его черновики. Черновик по id без сессии отвечает 401, чужому сотруднику - 403.
   *
   * @tags events
   * @name EventsList
   * @summary Список событий
   * @request GET:/events
   * @response `200` `EventsListData` OK
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  eventsList = (params: RequestParams = {}) =>
    this.request<EventsListData, EventsListError>({
      path: `/events`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags events
   * @name EventsCreate
   * @summary Создание события
   * @request POST:/events
   * @secure
   * @response `201` `EventsCreateData` Created
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `409` `HandlerErrorResponse` Conflict
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  eventsCreate = (body: ApiEventCreateRequest, params: RequestParams = {}) =>
    this.request<EventsCreateData, EventsCreateError>({
      path: `/events`,
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
   * @tags events
   * @name EventsDetail
   * @summary Событие по id
   * @request GET:/events/{id}
   * @response `200` `EventsDetailData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  eventsDetail = (id: string, params: RequestParams = {}) =>
    this.request<EventsDetailData, EventsDetailError>({
      path: `/events/${id}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Запись остаётся в базе, из списков и чтения пропадает.
   *
   * @tags events
   * @name EventsDelete
   * @summary Удаление события
   * @request DELETE:/events/{id}
   * @secure
   * @response `204` `EventsDeleteData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  eventsDelete = (id: string, params: RequestParams = {}) =>
    this.request<EventsDeleteData, EventsDeleteError>({
      path: `/events/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags events
   * @name EventsPartialUpdate
   * @summary Обновление события
   * @request PATCH:/events/{id}
   * @secure
   * @response `204` `EventsPartialUpdateData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  eventsPartialUpdate = (
    id: string,
    body: ApiEventUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<EventsPartialUpdateData, EventsPartialUpdateError>({
      path: `/events/${id}`,
      method: "PATCH",
      body: body,
      secure: true,
      type: "application/json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags events
   * @name FinishCreate
   * @summary Завершение события
   * @request POST:/events/{id}/finish
   * @secure
   * @response `204` `FinishCreateData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  finishCreate = (id: string, params: RequestParams = {}) =>
    this.request<FinishCreateData, FinishCreateError>({
      path: `/events/${id}/finish`,
      method: "POST",
      secure: true,
      ...params,
    });
  /**
   * @description Черновик события без сессии отвечает 401, чужому сотруднику - 403. id в ответе - id связи, его же принимают изменение, удаление и файл
   *
   * @tags events
   * @name MediaList
   * @summary Фотографии события
   * @request GET:/events/{id}/media
   * @response `200` `MediaListData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaList = (id: string, params: RequestParams = {}) =>
    this.request<MediaListData, MediaListError>({
      path: `/events/${id}/media`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Поле file: JPEG, PNG, GIF или WebP, до 10 МБ. К событию можно прикрепить несколько файлов
   *
   * @tags events
   * @name MediaCreate
   * @summary Добавление фотографии события
   * @request POST:/events/{id}/media
   * @secure
   * @response `201` `MediaCreateData` Created
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaCreate = (
    id: string,
    data: MediaCreatePayload,
    params: RequestParams = {},
  ) =>
    this.request<MediaCreateData, MediaCreateError>({
      path: `/events/${id}/media`,
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
   * @tags events
   * @name MediaUpdate
   * @summary Замена фотографии события
   * @request PUT:/events/{id}/media/{mediaId}
   * @secure
   * @response `200` `MediaUpdateData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaUpdate = (
    id: string,
    mediaId: string,
    data: MediaUpdatePayload,
    params: RequestParams = {},
  ) =>
    this.request<MediaUpdateData, MediaUpdateError>({
      path: `/events/${id}/media/${mediaId}`,
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
   * @tags events
   * @name MediaDelete
   * @summary Удаление фотографии события
   * @request DELETE:/events/{id}/media/{mediaId}
   * @secure
   * @response `204` `MediaDeleteData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaDelete = (id: string, mediaId: string, params: RequestParams = {}) =>
    this.request<MediaDeleteData, MediaDeleteError>({
      path: `/events/${id}/media/${mediaId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Черновик события без сессии отвечает 401, чужому сотруднику - 403. mediaId - id связи из списка фотографий
   *
   * @tags events
   * @name MediaContentList
   * @summary Файл фотографии события
   * @request GET:/events/{id}/media/{mediaId}/content
   * @response `200` `MediaContentListData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaContentList = (
    id: string,
    mediaId: string,
    params: RequestParams = {},
  ) =>
    this.request<MediaContentListData, MediaContentListError>({
      path: `/events/${id}/media/${mediaId}/content`,
      method: "GET",
      ...params,
    });
}
