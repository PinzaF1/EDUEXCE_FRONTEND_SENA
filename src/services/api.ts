/**
 * Cliente centralizado de API
 * Todas las peticiones al backend pasan por aquí
 */

// Normalize the API URL: prefer env var, fallback to '/api'
let RAW_API_URL = import.meta.env.VITE_API_URL ?? '/api';
// Ensure it's a string and trim whitespace
RAW_API_URL = String(RAW_API_URL).trim();
// Remove trailing slashes (but keep single '/' for proxy)
// In development we force the proxy base `/api` to avoid CORS and ensure
// local dev requests go through the Vite proxy regardless of env overrides.
const API_URL = import.meta.env.DEV ? '/api' : (RAW_API_URL === '/' ? '/' : RAW_API_URL.replace(/\/+$/, ''));

console.log('🔧 API_URL raw:', RAW_API_URL);
console.log('🔧 API_URL normalized:', API_URL);
console.log('🔧 Variables de entorno:', import.meta.env);

// Headers base para todas las peticiones
const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  // Solo enviar el header de ngrok en modo desarrollo
  ...(import.meta.env.DEV ? { 'ngrok-skip-browser-warning': 'true' } : {}),
  ...(localStorage.getItem('token') && {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  })
});

// Cliente HTTP base
export const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  // join base and endpoint without producing double slashes
  const joinUrl = (base: string, ep: string) => {
    if (!base || base === '/') return ep.startsWith('/') ? ep : `/${ep}`;
    const cleanBase = base.replace(/\/+$/g, '');
    const cleanEp = ep.startsWith('/') ? ep.substring(1) : ep;
    return `${cleanBase}/${cleanEp}`;
  };

  const url = joinUrl(API_URL, endpoint);
  console.log('📡 Petición a:', url);
  
  // Compose headers, but if the body is FormData let the browser set Content-Type (boundary)
  const composedHeaders: Record<string, any> = { ...getHeaders(), ...(options.headers || {}) };
  if (options.body instanceof FormData) {
    delete composedHeaders['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers: composedHeaders
  });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      // Response was not JSON (could be HTML error page from upstream). Keep raw text.
      data = { __raw: text };
    }
  }

  // Handle 401 (unauthorized) globally: clear token, emit event and redirect to login
  if (response.status === 401) {
    let bodyText = "";
    try { bodyText = await response.text(); } catch (_) { bodyText = ""; }
    let parsed: any = {};
    if (bodyText) {
      try { parsed = JSON.parse(bodyText); } catch { parsed = { __raw: bodyText }; }
    }
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('token'); } catch (_) {}
      try { window.dispatchEvent(new CustomEvent('auth:logout')); } catch (_) {}
      try { if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'; } catch (_) {}
    }
    const e = new Error(String((parsed && (parsed.error || parsed.message)) || `HTTP ${response.status}`));
    (e as any).status = response.status;
    (e as any).body = parsed;
    throw e;
  }

  return data as T;
};

/**
 * Construye la URL final del endpoint usando la normalización interna.
 * Exportado para que otros helpers deleguen en esta lógica.
 */
export const buildUrl = (endpoint: string = ''): string => {
  const joinUrl = (base: string, ep: string) => {
    if (!base || base === '/') return ep.startsWith('/') ? ep : `/${ep}`;
    const cleanBase = base.replace(/\/+$/g, '');
    const cleanEp = ep.startsWith('/') ? ep.substring(1) : ep;
    return `${cleanBase}/${cleanEp}`;
  };

  return joinUrl(API_URL, endpoint);
};

// Métodos públicos de API
export const api = {
  // ============ AUTENTICACIÓN ============
  login: (correo: string, password: string) =>
    request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ correo: correo.trim(), password })
    }),

  register: (data: any) =>
    request('/admin/registro', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  requestPasswordReset: (correo: string) =>
    request('/admin/solicitar-restablecimiento', {
      method: 'POST',
      body: JSON.stringify({ correo })
    }),

  resetPassword: (token: string, nueva_password: string) =>
    request('/admin/restablecer-password', {
      method: 'POST',
      body: JSON.stringify({ token, nueva_password })
    }),

  // ============ PERFIL ============
  getProfile: () => request('/admin/perfil'),

  updateProfile: (data: any) =>
    request('/admin/perfil', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  changePassword: (password_actual: string, nueva_password: string) =>
    request('/admin/cambiar-password', {
      method: 'PUT',
      body: JSON.stringify({ password_actual, nueva_password })
    }),

  uploadAvatar: (formData: FormData) =>
    ((): Promise<any> => {
      const url = buildUrl('/admin/avatar');
      const headers = { ...getHeaders() } as Record<string, string>;
      // Let the browser set the correct Content-Type (boundary) for FormData
      delete headers['Content-Type'];
      return fetch(url, { method: 'POST', headers, body: formData }).then((r) => r.json());
    })(),

  // ============ ESTUDIANTES ============
  getStudents: () => request('/estudiantes'),

  createStudent: (data: any) =>
    request('/estudiantes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateStudent: (id: number, data: any) =>
    request(`/estudiantes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteStudent: (id: number) =>
    request(`/estudiantes/${id}`, { method: 'DELETE' }),

  toggleStudentStatus: (id: number) =>
    request(`/estudiantes/${id}/toggle-estado`, { method: 'PUT' }),

  uploadStudents: (formData: FormData) =>
    ((): Promise<Response> => {
      const url = buildUrl('/estudiantes/upload');
      const headers = { ...getHeaders() } as Record<string, string>;
      delete headers['Content-Type'];
      return fetch(url, { method: 'POST', headers, body: formData });
    })(),

  // Upload helper that accepts a full URL and FormData and returns the raw Response
  uploadTo: (url: string, formData: FormData) =>
    ((): Promise<Response> => {
      // Accept either an endpoint (e.g. '/admin/estudiantes/importar') or a full URL
      let finalUrl = url;
      if (!finalUrl.startsWith('http') && !finalUrl.startsWith(API_URL)) {
        finalUrl = buildUrl(finalUrl);
      }
      const headers = { ...getHeaders() } as Record<string, string>;
      delete headers['Content-Type'];
      return fetch(finalUrl, { method: 'POST', headers, body: formData });
    })(),

  // ============ NOTIFICACIONES ============
  getNotifications: () => request('/notificaciones'),

  createNotification: (data: any) =>
    request('/notificaciones', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  markNotificationAsRead: (id: number) =>
    request(`/notificaciones/${id}/marcar-leida`, { method: 'PUT' }),

  deleteNotification: (id: number) =>
    request(`/notificaciones/${id}`, { method: 'DELETE' }),

  // ============ SEGUIMIENTO ============
  getTracking: () => request('/seguimiento'),

  getTrackingByArea: (area: string) => request(`/seguimiento/area/${area}`),

  // ============ DASHBOARD ============
  getDashboardStats: () => request('/admin/estadisticas')
};

export default api;
