/**
 * Constantes centralizadas de la aplicación
 */

// ============ RUTAS ============
export const ROUTES = {
  // Públicas
  HOME: '/',
  LANDING: '/publicidad',
  INFO: '/informacion',
  LOGIN: '/login',
  REGISTER: '/registro',
  PASSWORD_RESET: '/password',
  PASSWORD_CONFIRM: '/restablecer',

  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_HOME: '/dashboard',
  DASHBOARD_STUDENTS: '/dashboard/estudiantes',
  DASHBOARD_TRACKING: '/dashboard/seguimiento',
  DASHBOARD_NOTIFICATIONS: '/dashboard/notificaciones',
  DASHBOARD_PROFILE: '/dashboard/perfil',
  DASHBOARD_SETTINGS: '/dashboard/configuracion'
} as const;

// ============ MENSAJES ============
export const MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Sesión iniciada correctamente',
  LOGIN_ERROR: 'Credenciales incorrectas',
  LOGOUT_SUCCESS: 'Sesión cerrada',
  REGISTER_SUCCESS: 'Registro exitoso',
  
  // Estudiantes
  STUDENT_CREATED: 'Estudiante creado exitosamente',
  STUDENT_UPDATED: 'Estudiante actualizado exitosamente',
  STUDENT_DELETED: 'Estudiante eliminado exitosamente',
  
  // Notificaciones
  NOTIFICATION_CREATED: 'Notificación creada',
  NOTIFICATION_DELETED: 'Notificación eliminada',
  
  // Errores generales
  ERROR_GENERAL: 'Ocurrió un error. Intenta nuevamente',
  ERROR_CONNECTION: 'Error al conectar con el servidor',
  ERROR_UNAUTHORIZED: 'No tienes autorización para esta acción'
} as const;

// ============ COLORES DE MARCA ============
export const BRAND_COLORS = {
  DARK: '#1E40AF',
  MAIN: '#3B82F6',
  LIGHT: '#60A5FA',
  GRADIENT_FROM: '#2e5bff',
  GRADIENT_TO: '#3fa2ff'
} as const;

// ============ ROLES ============
export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  TEACHER: 'teacher'
} as const;

// ============ CONFIGURACIÓN ============
export const CONFIG = {
  APP_NAME: 'ZAVIRA SENA',
  API_TIMEOUT: 30000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ITEMS_PER_PAGE: 10
} as const;
