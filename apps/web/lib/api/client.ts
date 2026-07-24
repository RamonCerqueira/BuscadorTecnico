const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5278/api';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const raw = window.localStorage.getItem('buscador-session');
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    const token = parsed.state?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function handleError(res: Response, fallbackMsg: string): Promise<Error> {
  let errMsg = fallbackMsg;
  try {
    const errData = await res.json() as { message?: string | string[] };
    if (errData && errData.message) {
      errMsg = Array.isArray(errData.message) ? errData.message[0] : errData.message;
    }
  } catch {}
  return new Error(errMsg);
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    headers: {
      ...getAuthHeader()
    }
  });
  if (!res.ok) throw await handleError(res, `GET ${path} falhou`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw await handleError(res, `POST ${path} falhou`);
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw await handleError(res, `PATCH ${path} falhou`);
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader()
    }
  });

  if (!res.ok) throw await handleError(res, `DELETE ${path} falhou`);
  return res.json() as Promise<T>;
}

