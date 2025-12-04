import { request, buildUrl } from "../services/api";

// Re-export API URL builder for compatibility
export const apiUrl = buildUrl;

/**
 * Headers base para todas las peticiones
 */
export const baseHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
  "ngrok-skip-browser-warning": "true",
});

/**
 * Headers con autenticación (incluye token JWT si existe)
 */
export const authHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const token = localStorage.getItem("token");
  return {
    ...baseHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

// Helpers delegando en el cliente central `request`
export const getJSON = async <T>(path: string): Promise<T> => {
  return request<T>(path, { method: 'GET' });
};

export const postJSON = async <T>(path: string, body: any, options?: { requiresAuth?: boolean }): Promise<T> => {
  // Normalize ids arrays if present to avoid backend bigint NaN errors
  if (body && Array.isArray(body.ids)) {
    body = { ...body, ids: body.ids.map((v: any) => Number(v)).filter((n: number) => !Number.isNaN(n)) };
  }

  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
};

export const putJSON = async <T>(path: string, body: any): Promise<T> => {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
};

export const deleteJSON = async <T>(path: string): Promise<T> => {
  return request<T>(path, { method: 'DELETE' });
};

export const isAuthenticated = (): boolean => !!localStorage.getItem('token');

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('nombre_institucion');
  localStorage.removeItem('rol');
  localStorage.removeItem('id_institucion');
};

