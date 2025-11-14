/**
 * Tipos TypeScript centralizados
 */

// ============ AUTENTICACIÓN ============
export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  nombre_institucion: string;
  rol: string;
  id_institucion?: number;
}

export interface RegisterRequest {
  correo: string;
  password: string;
  nombre_institucion: string;
  nit: string;
  telefono?: string;
}

export interface User {
  id: number;
  correo: string;
  nombre_institucion: string;
  rol: string;
  id_institucion: number;
  avatar_url?: string;
}

// ============ ESTUDIANTE ============
export interface Student {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  correo?: string;
  telefono?: string;
  grado?: string;
  seccion?: string;
  activo: boolean;
  fecha_registro?: string;
  id_institucion: number;
}

export interface StudentFormData {
  nombre: string;
  apellido: string;
  identificacion: string;
  correo?: string;
  telefono?: string;
  grado?: string;
  seccion?: string;
}

// ============ NOTIFICACIÓN ============
export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  leida: boolean;
  fecha_creacion: string;
  id_institucion: number;
}

export interface NotificationFormData {
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
}

// ============ SEGUIMIENTO ============
export interface TrackingData {
  estudiante_id: number;
  estudiante_nombre: string;
  area: string;
  materia: string;
  progreso: number;
  fecha_actualizacion: string;
}

// ============ ESTADÍSTICAS ============
export interface DashboardStats {
  total_estudiantes: number;
  estudiantes_activos: number;
  promedio_progreso: number;
  notificaciones_pendientes: number;
}

// ============ RESPUESTAS API ============
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  detalle?: string;
  mensaje?: string;
}
