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
  ApiDocumentUpdateRequest,
  ContentListData,
  ContentListError,
  DocumentsCreateData,
  DocumentsCreateError,
  DocumentsCreatePayload,
  DocumentsDeleteData,
  DocumentsDeleteError,
  DocumentsDetailData,
  DocumentsDetailError,
  DocumentsListData,
  DocumentsListError,
  DocumentsPartialUpdateData,
  DocumentsPartialUpdateError,
  FileUpdateData,
  FileUpdateError,
  FileUpdatePayload,
  PublishCreateData,
  PublishCreateError,
} from "./data-contracts";
import { HttpClient, type RequestParams } from "./http-client";

export class Documents<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Без сессии черновики не отдаются. С сессией сотрудника видны его черновики
   *
   * @tags documents
   * @name DocumentsList
   * @summary Список документов
   * @request GET:/documents
   * @secure
   * @response `200` `DocumentsListData` OK
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  documentsList = (params: RequestParams = {}) =>
    this.request<DocumentsListData, DocumentsListError>({
      path: `/documents`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Поле file: PDF, DOC или DOCX, до 20 МБ. Автор - текущий пользователь
   *
   * @tags documents
   * @name DocumentsCreate
   * @summary Создание документа
   * @request POST:/documents
   * @secure
   * @response `201` `DocumentsCreateData` Created
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  documentsCreate = (
    data: DocumentsCreatePayload,
    params: RequestParams = {},
  ) =>
    this.request<DocumentsCreateData, DocumentsCreateError>({
      path: `/documents`,
      method: "POST",
      body: data,
      secure: true,
      type: "multipart/form-data",
      format: "json",
      ...params,
    });
  /**
   * @description Черновик без сессии отвечает 401, чужому сотруднику - 403. Сообщение: «Черновик доступен только автору»
   *
   * @tags documents
   * @name DocumentsDetail
   * @summary Документ по id
   * @request GET:/documents/{id}
   * @secure
   * @response `200` `DocumentsDetailData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  documentsDetail = (id: string, params: RequestParams = {}) =>
    this.request<DocumentsDetailData, DocumentsDetailError>({
      path: `/documents/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Черновик удаляет только автор
   *
   * @tags documents
   * @name DocumentsDelete
   * @summary Удаление документа
   * @request DELETE:/documents/{id}
   * @secure
   * @response `204` `DocumentsDeleteData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  documentsDelete = (id: string, params: RequestParams = {}) =>
    this.request<DocumentsDeleteData, DocumentsDeleteError>({
      path: `/documents/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Черновик меняет только автор. Статус этим запросом не меняется
   *
   * @tags documents
   * @name DocumentsPartialUpdate
   * @summary Обновление документа
   * @request PATCH:/documents/{id}
   * @secure
   * @response `204` `DocumentsPartialUpdateData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  documentsPartialUpdate = (
    id: string,
    body: ApiDocumentUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<DocumentsPartialUpdateData, DocumentsPartialUpdateError>({
      path: `/documents/${id}`,
      method: "PATCH",
      body: body,
      secure: true,
      type: "application/json",
      ...params,
    });
  /**
   * @description Черновик без сессии отвечает 401, чужому сотруднику - 403
   *
   * @tags documents
   * @name ContentList
   * @summary Файл документа
   * @request GET:/documents/{id}/content
   * @secure
   * @response `200` `ContentListData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  contentList = (id: string, params: RequestParams = {}) =>
    this.request<ContentListData, ContentListError>({
      path: `/documents/${id}/content`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Черновик меняет только автор. Поле file: PDF, DOC или DOCX, до 20 МБ
   *
   * @tags documents
   * @name FileUpdate
   * @summary Замена файла документа
   * @request PUT:/documents/{id}/file
   * @secure
   * @response `200` `FileUpdateData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  fileUpdate = (
    id: string,
    data: FileUpdatePayload,
    params: RequestParams = {},
  ) =>
    this.request<FileUpdateData, FileUpdateError>({
      path: `/documents/${id}/file`,
      method: "PUT",
      body: data,
      secure: true,
      type: "multipart/form-data",
      format: "json",
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Черновик публикует только автор
   *
   * @tags documents
   * @name PublishCreate
   * @summary Публикация документа
   * @request POST:/documents/{id}/publish
   * @secure
   * @response `204` `PublishCreateData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  publishCreate = (id: string, params: RequestParams = {}) =>
    this.request<PublishCreateData, PublishCreateError>({
      path: `/documents/${id}/publish`,
      method: "POST",
      secure: true,
      ...params,
    });
}
