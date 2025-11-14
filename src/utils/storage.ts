/**
 * Abstracción centralizada de localStorage
 * Manejo seguro de datos de sesión
 */

// Keys consistentes para localStorage
const STORAGE_KEYS = {
  TOKEN: 'token',
  INSTITUTION: 'nombre_institucion',
  INSTITUTION_ID: 'id_institucion',
  ROLE: 'rol'
} as const;

export const storage = {
  // ============ TOKEN ============
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // ============ USUARIO ============
  getUser: () => ({
    institution: localStorage.getItem(STORAGE_KEYS.INSTITUTION) || '',
    institutionId: localStorage.getItem(STORAGE_KEYS.INSTITUTION_ID) || '',
    role: localStorage.getItem(STORAGE_KEYS.ROLE) || ''
  }),

  setUser: (data: {
    nombre_institucion?: string;
    id_institucion?: number | string;
    rol?: string;
  }): void => {
    if (data.nombre_institucion) {
      localStorage.setItem(STORAGE_KEYS.INSTITUTION, data.nombre_institucion);
    }
    if (data.id_institucion != null) {
      localStorage.setItem(STORAGE_KEYS.INSTITUTION_ID, String(data.id_institucion));
    }
    if (data.rol) {
      localStorage.setItem(STORAGE_KEYS.ROLE, data.rol);
    }
  },

  // ============ AVATAR (por institución) ============
  getAvatar: (institutionId: string): string | null => {
    return localStorage.getItem(`avatar_url:${institutionId}`);
  },

  setAvatar: (institutionId: string, url: string): void => {
    localStorage.setItem(`avatar_url:${institutionId}`, url);
  },

  // ============ SESIÓN ============
  clearSession: (): void => {
    localStorage.clear();
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
};

export default storage;
