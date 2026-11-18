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
  CallbackCreateData,
  CallbackCreateError,
  CheckoutCreateData,
  CheckoutCreateError,
  CompleteCreateFail,
  CompleteCreateResult,
  DonationsDetailData,
  DonationsDetailError,
  DonationsListData,
  DonationsListError,
  HandlerCashActivateRequest,
  HandlerCashIDRequest,
  HandlerCashRegisterRequest,
  HandlerCheckoutRequest,
  HandlerMoneyRequest,
  PaymentsDetailData,
  PaymentsDetailError,
  PaymentsListData,
  PaymentsListError,
  RefundsDetailData,
  RefundsDetailError,
  RefundsListData,
  RefundsListError,
  ReverseCreateData,
  SbpCashActivateCreateData,
  SbpCashDeactivateCreateData,
  SbpCashRegisterCreateData,
  SyncCreateData,
} from './data-contracts';
import { HttpClient, type RequestParams } from './http-client';

export class Payments<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name DonationsList
   * @summary Список пожертвований
   * @request GET:/donations
   * @secure
   * @response `200` `DonationsListData` OK
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   */
  donationsList = (params: RequestParams = {}) =>
    this.request<DonationsListData, DonationsListError>({
      path: `/donations`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name DonationsDetail
   * @summary Пожертвование по id
   * @request GET:/donations/{id}
   * @secure
   * @response `200` `DonationsDetailData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   */
  donationsDetail = (id: string, params: RequestParams = {}) =>
    this.request<DonationsDetailData, DonationsDetailError>({
      path: `/donations/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name PaymentsList
   * @summary Список платежей
   * @request GET:/payments
   * @secure
   * @response `200` `PaymentsListData` OK
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   */
  paymentsList = (params: RequestParams = {}) =>
    this.request<PaymentsListData, PaymentsListError>({
      path: `/payments`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * @description XML-колбэк Best2Pay. Подпись внутри тела: Base64(hex(SHA256)). Успешный ответ - текст ok.
   *
   * @tags payments
   * @name CallbackCreate
   * @summary Колбэк платёжного провайдера
   * @request POST:/payments/callback
   * @response `200` `CallbackCreateData` ok
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `409` `HandlerErrorResponse` Conflict
   * @response `503` `HandlerErrorResponse` Service Unavailable
   */
  callbackCreate = (params: RequestParams = {}) =>
    this.request<CallbackCreateData, CallbackCreateError>({
      path: `/payments/callback`,
      method: 'POST',
      type: 'text/plain',
      ...params,
    });
  /**
   * @description Карта и СБП оплачиваются на странице Best2Pay. Номер карты на сервер не передаётся. method: card, sbp, sbp_qr, authorize. Ссылка живёт 5 минут (life_period=300).
   *
   * @tags payments
   * @name CheckoutCreate
   * @summary Старт оплаты пожертвования
   * @request POST:/payments/checkout
   * @response `200` `CheckoutCreateData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `503` `HandlerErrorResponse` Service Unavailable
   */
  checkoutCreate = (body: HandlerCheckoutRequest, params: RequestParams = {}) =>
    this.request<CheckoutCreateData, CheckoutCreateError>({
      path: `/payments/checkout`,
      method: 'POST',
      body: body,
      type: 'application/json',
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. payment_id подставляет сумму и reference платежа.
   *
   * @tags payments
   * @name SbpCashActivateCreate
   * @summary Активация кассовой ссылки СБП
   * @request POST:/payments/sbp-cash/activate
   * @secure
   * @response `200` `SbpCashActivateCreateData` OK
   */
  sbpCashActivateCreate = (
    body: HandlerCashActivateRequest,
    params: RequestParams = {},
  ) =>
    this.request<SbpCashActivateCreateData, any>({
      path: `/payments/sbp-cash/activate`,
      method: 'POST',
      body: body,
      secure: true,
      type: 'application/json',
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name SbpCashDeactivateCreate
   * @summary Деактивация кассовой ссылки СБП
   * @request POST:/payments/sbp-cash/deactivate
   * @secure
   * @response `200` `SbpCashDeactivateCreateData` OK
   */
  sbpCashDeactivateCreate = (
    body: HandlerCashIDRequest,
    params: RequestParams = {},
  ) =>
    this.request<SbpCashDeactivateCreateData, any>({
      path: `/payments/sbp-cash/deactivate`,
      method: 'POST',
      body: body,
      secure: true,
      type: 'application/json',
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name SbpCashRegisterCreate
   * @summary Регистрация кассовой ссылки СБП
   * @request POST:/payments/sbp-cash/register
   * @secure
   * @response `200` `SbpCashRegisterCreateData` OK
   */
  sbpCashRegisterCreate = (
    body: HandlerCashRegisterRequest,
    params: RequestParams = {},
  ) =>
    this.request<SbpCashRegisterCreateData, any>({
      path: `/payments/sbp-cash/register`,
      method: 'POST',
      body: body,
      secure: true,
      type: 'application/json',
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name PaymentsDetail
   * @summary Платёж по id
   * @request GET:/payments/{id}
   * @secure
   * @response `200` `PaymentsDetailData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   */
  paymentsDetail = (id: string, params: RequestParams = {}) =>
    this.request<PaymentsDetailData, PaymentsDetailError>({
      path: `/payments/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Сумма необязательна, по умолчанию сумма платежа.
   *
   * @tags payments
   * @name CompleteCreate
   * @summary Завершение оплаты
   * @request POST:/payments/{id}/complete
   * @secure
   * @response `200` `CompleteCreateResult` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   */
  completeCreate = (
    id: string,
    body: HandlerMoneyRequest,
    params: RequestParams = {},
  ) =>
    this.request<CompleteCreateResult, CompleteCreateFail>({
      path: `/payments/${id}/complete`,
      method: 'POST',
      body: body,
      secure: true,
      type: 'application/json',
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator. Пустая сумма - весь непогашенный остаток.
   *
   * @tags payments
   * @name ReverseCreate
   * @summary Возврат платежа
   * @request POST:/payments/{id}/reverse
   * @secure
   * @response `200` `ReverseCreateData` OK
   */
  reverseCreate = (
    id: string,
    body: HandlerMoneyRequest,
    params: RequestParams = {},
  ) =>
    this.request<ReverseCreateData, any>({
      path: `/payments/${id}/reverse`,
      method: 'POST',
      body: body,
      secure: true,
      type: 'application/json',
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name SyncCreate
   * @summary Сверка платежа
   * @request POST:/payments/{id}/sync
   * @secure
   * @response `200` `SyncCreateData` OK
   */
  syncCreate = (id: string, params: RequestParams = {}) =>
    this.request<SyncCreateData, any>({
      path: `/payments/${id}/sync`,
      method: 'POST',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name RefundsList
   * @summary Список возвратов
   * @request GET:/refunds
   * @secure
   * @response `200` `RefundsListData` OK
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   */
  refundsList = (params: RequestParams = {}) =>
    this.request<RefundsListData, RefundsListError>({
      path: `/refunds`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * @description Нужна сессия admin или moderator.
   *
   * @tags payments
   * @name RefundsDetail
   * @summary Возврат по id
   * @request GET:/refunds/{id}
   * @secure
   * @response `200` `RefundsDetailData` OK
   * @response `400` `HandlerErrorResponse` Bad Request
   * @response `401` `HandlerErrorResponse` Unauthorized
   * @response `403` `HandlerErrorResponse` Forbidden
   * @response `404` `HandlerErrorResponse` Not Found
   */
  refundsDetail = (id: string, params: RequestParams = {}) =>
    this.request<RefundsDetailData, RefundsDetailError>({
      path: `/refunds/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
}
