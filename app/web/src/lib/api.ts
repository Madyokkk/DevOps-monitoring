function apiBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  return process.env.NEXT_PUBLIC_API_URL || '';
}

export async function api<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...init } = options || {};
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as object),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
    signal: init.signal ?? controller.signal,
  }).finally(() => clearTimeout(timeout));
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Қате орын алды');
  }
  return res.json();
}

export const fetcher = {
  get: <T>(path: string, token?: string) =>
    api<T>(path, { method: 'GET', token }) as Promise<T>,
  post: <T>(path: string, body?: unknown, token?: string) =>
    api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, token }),
  patch: <T>(path: string, body?: unknown, token?: string) =>
    api<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, token }),
};
