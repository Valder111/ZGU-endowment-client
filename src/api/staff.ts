import { isAxiosError, type AxiosResponse } from 'axios';
import { Auth } from './generated/Auth';
import { Users } from './generated/Users';
import { News } from './generated/News';
import { Events } from './generated/Events';
import { Projects } from './generated/Projects';
import { Documents } from './generated/Documents';
import type {
  HandlerDocumentResponse,
  HandlerErrorResponse,
  HandlerEventResponse,
  HandlerNewsResponse,
  HandlerProjectResponse,
  HandlerUserResponse,
} from './generated/data-contracts';

export type StaffRole = 'admin' | 'moderator';
export type StaffProfile = HandlerUserResponse & {
  id: string;
  role: StaffRole;
  is_active: boolean;
};

export type ContentRecord = HandlerNewsResponse &
  HandlerEventResponse &
  HandlerProjectResponse &
  HandlerDocumentResponse;

export type StaffRequest = <T>(
  operation: Promise<AxiosResponse<T>>,
) => Promise<T>;

export function validProfile(
  profile: HandlerUserResponse,
): profile is StaffProfile {
  return (
    Boolean(profile.id) &&
    (profile.role === 'admin' || profile.role === 'moderator') &&
    typeof profile.is_active === 'boolean'
  );
}
function staffApiBase(value?: string): string | null {
  const base = value?.trim().replace(/\/$/, '');
  if (!base) return null;
  if (base === '/api/v1') return base;
  try {
    const url = new URL(base);
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:'))
      return null;
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.pathname.endsWith('/api/v1')
    )
      return null;
    return base;
  } catch {
    return null;
  }
}

export const staffBase = staffApiBase(import.meta.env.VITE_API_BASE_URL);
export const staffBaseInvalid =
  Boolean(import.meta.env.VITE_API_BASE_URL) && !staffBase;

export class StaffApiError extends Error {
  constructor(
    public status: number,
    public detail?: string,
  ) {
    super(`HTTP ${status}`);
  }
}

export function staffError(error: unknown) {
  if (!(error instanceof StaffApiError))
    return 'Связь с API фонда недоступна. Повторите попытку.';
  switch (error.status) {
    case 400:
    case 409:
    case 413:
    case 415:
      return error.detail || 'Проверьте введённые данные.';
    case 401:
      return 'Проверьте данные входа или войдите заново.';
    case 403:
      return 'У вашей учётной записи нет доступа к этой операции.';
    case 404:
      return 'Запись не найдена. Обновите список.';
    default:
      return 'API фонда не смог выполнить запрос. Повторите попытку.';
  }
}

const config = { baseURL: staffBase ?? undefined, withCredentials: true };

export const staffApi = {
  auth: new Auth(config),
  users: new Users(config),
  news: new News(config),
  events: new Events(config),
  projects: new Projects(config),
  documents: new Documents(config),
};

export async function staffResult<T>(
  operation: Promise<AxiosResponse<T>>,
): Promise<T> {
  try {
    return (await operation).data;
  } catch (error) {
    if (!isAxiosError<HandlerErrorResponse | Blob>(error) || !error.response)
      throw error;
    let data = error.response.data;
    if (data instanceof Blob && data.type.includes('json')) {
      try {
        data = await data
          .text()
          .then((text) => JSON.parse(text) as HandlerErrorResponse);
      } catch {
        data = {};
      }
    }
    throw new StaffApiError(
      error.response.status,
      data && !(data instanceof Blob) && typeof data.error === 'string'
        ? data.error
        : undefined,
    );
  }
}
