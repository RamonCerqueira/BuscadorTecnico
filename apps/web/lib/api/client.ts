const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function getAuthHeader() {
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

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    headers: {
      ...getAuthHeader()
    }
  });
  if (!res.ok) throw new Error(`GET ${path} falhou`);
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

  if (!res.ok) throw new Error(`POST ${path} falhou`);
  return res.json() as Promise<T>;
}
