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
  ApiUserLoginRequest,
  ApiUserUpdateRequest,
  GetAuthData,
  GetAuthError,
  LoginCreateData,
  LoginCreateError,
  PatchAuthData,
  PatchAuthError,
} from './data-contracts';
import { HttpClient, type RequestParams } from './http-client';

export class Auth<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Сессия записывается в HttpOnly cookie session на 24 часа. В теле ответа токена нет.
   *
   * @tags auth
   * @name LoginCreate
   * @summary Вход
   * @request POST:/login
   * @response `200` `LoginCreateData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  loginCreate = (body: ApiUserLoginRequest, params: RequestParams = {}) =>
    this.request<LoginCreateData, LoginCreateError>({
      path: `/login`,
      method: 'POST',
      body: body,
      type: 'application/json',
      format: 'json',
      ...params,
    });
  /**
   * @description Идентификатор берётся из сессии на сервере. Роли admin и moderator.
   *
   * @tags auth
   * @name GetAuth
   * @summary Текущий пользователь
   * @request GET:/me
   * @secure
   * @response `200` `GetAuthData` OK
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  getAuth = (params: RequestParams = {}) =>
    this.request<GetAuthData, GetAuthError>({
      path: `/me`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * @description Нужен текущий пароль. Идентификатор берётся из сессии. После смены все сессии пользователя сбрасываются.
   *
   * @tags auth
   * @name PatchAuth
   * @summary Смена своего пароля
   * @request PATCH:/me
   * @secure
   * @response `204` `PatchAuthData` No Content
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `500` `HandlerErrorResponse` Internal Server Error
   */
  patchAuth = (body: ApiUserUpdateRequest, params: RequestParams = {}) =>
    this.request<PatchAuthData, PatchAuthError>({
      path: `/me`,
      method: 'PATCH',
      body: body,
      secure: true,
      type: 'application/json',
      ...params,
    });
}
