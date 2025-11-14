/**
 * Cliente centralizado de API
 * Todas las peticiones al backend pasan por aquí
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://zavira-v8.onrender.com';

// Headers base para todas las peticiones
const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  ...(localStorage.getItem('token') && {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  })
});

// Cliente HTTP base
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error || data.mensaje || data.detalle || `HTTP ${response.status}`);
  }

  return data;
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
    fetch(`${API_URL}/admin/avatar`, {
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
    fetch(`${API_URL}/estudiantes/upload`, {
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
