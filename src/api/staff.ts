export type StaffRole = 'admin' | 'moderator';

export interface StaffProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: StaffRole;
  is_active: boolean;
}

export interface StaffSession {
  token: string;
  user_id: string;
  email: string;
  role: StaffRole;
}

export interface StaffPhoto {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
}

export type ContentRecord = { id: string } & Partial<Record<string, string>>;

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: Record<string, string | boolean> | FormData;
  signal?: AbortSignal;
};

export type StaffRequest = <T = void>(
  path: string,
  options?: Options,
) => Promise<T>;

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

export async function staffFetch<T>(
  path: string,
  options: Options = {},
  token?: string,
): Promise<T> {
  if (!staffBase) throw new Error('Staff API is unavailable');
  const { method = 'GET', body, signal } = options;
  const headers = new Headers({ Accept: 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let payload: FormData | string | undefined;
  if (body instanceof FormData) payload = body;
  else if (body) {
    headers.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }
  const response = await fetch(`${staffBase}${path}`, {
    method,
    headers,
    body: payload,
    signal,
    credentials: 'omit',
    redirect: 'error',
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new StaffApiError(
      response.status,
      typeof body?.error === 'string' ? body.error : undefined,
    );
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

export function staffRecordPath(collection: string, id: string) {
  return `/${collection}/${encodeURIComponent(id)}`;
}
