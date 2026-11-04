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
  ApiProjectCreateRequest,
  ApiProjectUpdateRequest,
  CompleteCreateData,
  CompleteCreateError,
  MediaContentListFails,
  MediaContentListOutput,
  MediaCreateFails,
  MediaCreateInput,
  MediaCreateOutput,
  MediaDeleteFails,
  MediaDeleteOutput,
  MediaListFails,
  MediaListOutput,
  MediaUpdateFails,
  MediaUpdateInput,
  MediaUpdateOutput,
  ProjectsCreateData,
  ProjectsCreateError,
  ProjectsDeleteData,
  ProjectsDeleteError,
  ProjectsDetailData,
  ProjectsDetailError,
  ProjectsListData,
  ProjectsListError,
  ProjectsPartialUpdateData,
  ProjectsPartialUpdateError,
} from "./data-contracts";
import { HttpClient, type RequestParams } from "./http-client";

export class Projects<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Без сессии черновики не отдаются. С сессией сотрудника видны его черновики. Черновик по id без сессии отвечает 401, чужому сотруднику - 403.
   *
   * @tags projects
   * @name ProjectsList
   * @summary Список проектов
   * @request GET:/projects
   * @response `200` `ProjectsListData` OK
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  projectsList = (params: RequestParams = {}) =>
    this.request<ProjectsListData, ProjectsListError>({
      path: `/projects`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Создатель - текущий пользователь.
   *
   * @tags projects
   * @name ProjectsCreate
   * @summary Создание проекта
   * @request POST:/projects
   * @secure
   * @response `201` `ProjectsCreateData` Created
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  projectsCreate = (
    body: ApiProjectCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ProjectsCreateData, ProjectsCreateError>({
      path: `/projects`,
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
   * @tags projects
   * @name ProjectsDetail
   * @summary Проект по id
   * @request GET:/projects/{id}
   * @response `200` `ProjectsDetailData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  projectsDetail = (id: string, params: RequestParams = {}) =>
    this.request<ProjectsDetailData, ProjectsDetailError>({
      path: `/projects/${id}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Запись остаётся в базе, из списков и чтения пропадает.
   *
   * @tags projects
   * @name ProjectsDelete
   * @summary Удаление проекта
   * @request DELETE:/projects/{id}
   * @secure
   * @response `204` `ProjectsDeleteData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  projectsDelete = (id: string, params: RequestParams = {}) =>
    this.request<ProjectsDeleteData, ProjectsDeleteError>({
      path: `/projects/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags projects
   * @name ProjectsPartialUpdate
   * @summary Обновление проекта
   * @request PATCH:/projects/{id}
   * @secure
   * @response `204` `ProjectsPartialUpdateData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  projectsPartialUpdate = (
    id: string,
    body: ApiProjectUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<ProjectsPartialUpdateData, ProjectsPartialUpdateError>({
      path: `/projects/${id}`,
      method: "PATCH",
      body: body,
      secure: true,
      type: "application/json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags projects
   * @name CompleteCreate
   * @summary Завершение проекта
   * @request POST:/projects/{id}/complete
   * @secure
   * @response `204` `CompleteCreateData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  completeCreate = (id: string, params: RequestParams = {}) =>
    this.request<CompleteCreateData, CompleteCreateError>({
      path: `/projects/${id}/complete`,
      method: "POST",
      secure: true,
      ...params,
    });
  /**
   * @description Черновик проекта без сессии отвечает 401, чужому сотруднику - 403. id в ответе - id связи, его же принимают изменение, удаление и файл
   *
   * @tags projects
   * @name MediaList
   * @summary Фотографии проекта
   * @request GET:/projects/{id}/media
   * @response `200` `MediaListOutput` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaList = (id: string, params: RequestParams = {}) =>
    this.request<MediaListOutput, MediaListFails>({
      path: `/projects/${id}/media`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Поле file: JPEG, PNG, GIF или WebP, до 10 МБ. К проекту можно прикрепить несколько файлов
   *
   * @tags projects
   * @name MediaCreate
   * @summary Добавление фотографии проекта
   * @request POST:/projects/{id}/media
   * @secure
   * @response `201` `MediaCreateOutput` Created
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaCreate = (
    id: string,
    data: MediaCreateInput,
    params: RequestParams = {},
  ) =>
    this.request<MediaCreateOutput, MediaCreateFails>({
      path: `/projects/${id}/media`,
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
   * @tags projects
   * @name MediaUpdate
   * @summary Замена фотографии проекта
   * @request PUT:/projects/{id}/media/{mediaId}
   * @secure
   * @response `200` `MediaUpdateOutput` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaUpdate = (
    id: string,
    mediaId: string,
    data: MediaUpdateInput,
    params: RequestParams = {},
  ) =>
    this.request<MediaUpdateOutput, MediaUpdateFails>({
      path: `/projects/${id}/media/${mediaId}`,
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
   * @tags projects
   * @name MediaDelete
   * @summary Удаление фотографии проекта
   * @request DELETE:/projects/{id}/media/{mediaId}
   * @secure
   * @response `204` `MediaDeleteOutput` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaDelete = (id: string, mediaId: string, params: RequestParams = {}) =>
    this.request<MediaDeleteOutput, MediaDeleteFails>({
      path: `/projects/${id}/media/${mediaId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Черновик проекта без сессии отвечает 401, чужому сотруднику - 403. mediaId - id связи из списка фотографий
   *
   * @tags projects
   * @name MediaContentList
   * @summary Файл фотографии проекта
   * @request GET:/projects/{id}/media/{mediaId}/content
   * @response `200` `MediaContentListOutput` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  mediaContentList = (
    id: string,
    mediaId: string,
    params: RequestParams = {},
  ) =>
    this.request<MediaContentListOutput, MediaContentListFails>({
      path: `/projects/${id}/media/${mediaId}/content`,
      method: "GET",
      ...params,
    });
}
