function staffApiBase(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (
      (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !/\/api\/v1\/?$/.test(url.pathname)
    )
      return null;
    return url.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

export const apiBase = staffApiBase(import.meta.env.VITE_API_BASE_URL);
export const apiMisconfigured =
  Boolean(import.meta.env.VITE_API_BASE_URL) && !apiBase;

export class StaffApiError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

export async function staffRequest(
  path: string,
  body?: Record<string, string> | FormData,
  token?: string,
): Promise<Response> {
  if (!apiBase) throw new Error('Staff API is unavailable');
  const headers = new Headers({ Accept: 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const json = body && !(body instanceof FormData);
  if (json) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers,
    body: json ? JSON.stringify(body) : (body as FormData | undefined),
    credentials: 'omit',
    redirect: 'error',
  });
  if (!response.ok) throw new StaffApiError(response.status);
  return response;
}
