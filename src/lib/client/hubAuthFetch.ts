/**
 * Authenticated reads/writes against Next.js `/api/*` routes (Bearer Firebase ID token).
 */
export async function hubAuthFetch(
  path: `/api/${string}`,
  token: string,
  init: RequestInit & { skipJson?: boolean } = {},
): Promise<Response> {
  const headers = new Headers(init.headers ?? undefined);
  if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  if (init.body != null && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json');
  const { skipJson: _omit, ...rest } = init;
  return fetch(path, {
    ...rest,
    headers,
  });
}

export async function hubAuthJson<T>(
  path: `/api/${string}`,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await hubAuthFetch(path, token, init);
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || `Request failed (${res.status})`);
  }
  if (!res.ok || (body && typeof body === 'object' && body !== null && (body as { success?: boolean }).success === false)) {
    const errMsg =
      body && typeof body === 'object' && body !== null && 'error' in body ? String((body as { error: unknown }).error) : '';
    throw new Error(errMsg || `Request failed (${res.status})`);
  }
  return body as T;
}
