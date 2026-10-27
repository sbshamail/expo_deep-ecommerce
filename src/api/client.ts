import { API_URL } from '@/constants/config';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type FetchInit = RequestInit & { token?: string | null };

async function request(path: string, init: FetchInit): Promise<any> {
  const { token, headers, body, ...rest } = init;
  // FormData must NOT get a JSON content-type — fetch sets the multipart
  // boundary itself.
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      body,
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection.');
  }
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = payload?.detail;
    // FastAPI validation errors come back as a list of { msg } objects.
    const message = Array.isArray(detail)
      ? detail.map((d) => d?.msg).filter(Boolean).join(', ')
      : detail;
    throw new ApiError(res.status, message || payload?.message || 'Request failed');
  }
  return payload;
}

/**
 * Calls the FastAPI backend (mobile talks to it directly — there is no Next
 * proxy). Same unwrapping rule as monofrontend's backendFetch: a
 * { success, detail, data } envelope resolves to `data`; raw bodies
 * (e.g. /user/read) pass through; errors throw ApiError(detail).
 */
export async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const payload = await request(path, init);
  return (
    payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
  ) as T;
}

/** For listRecords()-style endpoints: keeps `total`, which apiFetch drops. */
export async function apiList<T>(
  path: string,
  init: FetchInit = {},
): Promise<{ data: T[]; total: number }> {
  const payload = await request(path, init);
  return { data: payload?.data ?? [], total: payload?.total ?? 0 };
}
