/**
 * Cliente centralizado de API
 * Todas las peticiones al backend pasan por aquí
 */

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

console.log('🔧 API_URL configurada:', API_URL);
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
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  console.log('📡 Petición a:', url);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
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

  if (!response.ok) {
    // Prefer structured messages when available, otherwise include status and raw body
    const msg = (data && (data.error || data.mensaje || data.detalle || data.message)) || data?.__raw || `HTTP ${response.status}`;
    const e = new Error(String(msg));
    (e as any).status = response.status;
    (e as any).body = data;
    throw e;
  }

  return data as T;
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
    fetch(`${API_URL}${'/admin/avatar'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData
    }).then(res => res.json()),

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
    fetch(`${API_URL}${'/estudiantes/upload'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData
    }).then(res => res.json()),

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
