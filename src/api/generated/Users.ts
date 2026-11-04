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
  ApiUserAdminUpdateRequest,
  ApiUserCreateRequest,
  UsersCreateData,
  UsersCreateError,
  UsersDeleteData,
  UsersDeleteError,
  UsersDetailData,
  UsersDetailError,
  UsersListData,
  UsersListError,
  UsersPartialUpdateData,
  UsersPartialUpdateError,
} from "./data-contracts";
import { HttpClient, type RequestParams } from "./http-client";

export class Users<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Только роль admin.
   *
   * @tags users
   * @name UsersList
   * @summary Список пользователей
   * @request GET:/users
   * @secure
   * @response `200` `UsersListData` OK
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  usersList = (params: RequestParams = {}) =>
    this.request<UsersListData, UsersListError>({
      path: `/users`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Только роль admin. Самостоятельной регистрации нет.
   *
   * @tags users
   * @name UsersCreate
   * @summary Создание пользователя
   * @request POST:/users
   * @secure
   * @response `201` `UsersCreateData` Created
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `409` `HandlerErrorResponse` Conflict
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  usersCreate = (body: ApiUserCreateRequest, params: RequestParams = {}) =>
    this.request<UsersCreateData, UsersCreateError>({
      path: `/users`,
      method: "POST",
      body: body,
      secure: true,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Только роль admin. Возвращает и деактивированные учётные записи.
   *
   * @tags users
   * @name UsersDetail
   * @summary Пользователь по id
   * @request GET:/users/{id}
   * @secure
   * @response `200` `UsersDetailData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  usersDetail = (id: string, params: RequestParams = {}) =>
    this.request<UsersDetailData, UsersDetailError>({
      path: `/users/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Только роль admin. Сессии пользователя сбрасываются.
   *
   * @tags users
   * @name UsersDelete
   * @summary Деактивация пользователя
   * @request DELETE:/users/{id}
   * @secure
   * @response `204` `UsersDeleteData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  usersDelete = (id: string, params: RequestParams = {}) =>
    this.request<UsersDeleteData, UsersDeleteError>({
      path: `/users/${id}`,
      method: "DELETE",
      secure: true,
      ...params,
    });
  /**
   * @description Только роль admin. Пароль задаётся без текущего. Смена пароля и деактивация сбрасывают сессии этого пользователя.
   *
   * @tags users
   * @name UsersPartialUpdate
   * @summary Изменение пользователя
   * @request PATCH:/users/{id}
   * @secure
   * @response `204` `UsersPartialUpdateData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `409` `HandlerErrorResponse` Conflict
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  usersPartialUpdate = (
    id: string,
    body: ApiUserAdminUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<UsersPartialUpdateData, UsersPartialUpdateError>({
      path: `/users/${id}`,
      method: "PATCH",
      body: body,
      secure: true,
      type: "application/json",
      ...params,
    });
}
