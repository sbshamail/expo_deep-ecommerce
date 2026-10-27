import { API_URL } from '@/constants/config';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the FastAPI backend (mobile talks to it directly — there is no Next
 * proxy). Same unwrapping rule as monofrontend's backendFetch: a
 * { success, detail, data } envelope resolves to `data`; raw bodies
 * (e.g. /user/read) pass through; errors throw ApiError(detail).
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection.');
  }
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, payload?.detail ?? payload?.message ?? 'Request failed');
  }
  return (
    payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
  ) as T;
}
