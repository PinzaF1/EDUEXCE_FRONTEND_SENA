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
  ,
  // Queue para eliminaciones pendientes de notificaciones
  NOTIS_DELETED_QUEUE: 'notificaciones_deleted_queue'
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
  ,

  // ============ NOTIFICACIONES BORRADAS (cola local) ============
  /**
   * Obtener la cola de IDs pendientes de eliminación.
   */
  getDeletedQueue: (): number[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIS_DELETED_QUEUE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((v: any) => Number(v)).filter((n: number) => !Number.isNaN(n));
      return [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Reemplaza la cola completa (útil después de sincronizar).
   */
  setDeletedQueue: (ids: number[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIS_DELETED_QUEUE, JSON.stringify(ids.map(n => Number(n))));
    } catch (err) {
      // noop
    }
  },

  /**
   * Añade IDs a la cola, evitando duplicados.
   */
  pushDeletedIds: (ids: number[] | number): void => {
    try {
      const toAdd = Array.isArray(ids) ? ids.map(n => Number(n)) : [Number(ids)];
      const cur = (localStorage.getItem(STORAGE_KEYS.NOTIS_DELETED_QUEUE) || '[]');
      const arr = JSON.parse(cur);
      const set = new Set<number>(Array.isArray(arr) ? arr.map((v: any) => Number(v)) : []);
      toAdd.forEach(n => { if (!Number.isNaN(n)) set.add(n); });
      localStorage.setItem(STORAGE_KEYS.NOTIS_DELETED_QUEUE, JSON.stringify(Array.from(set)));
    } catch (err) {
      // noop
    }
  },

  /**
   * Remueve IDs de la cola (útil tras sincronizar).
   */
  removeDeletedIds: (ids: number[] | number): void => {
    try {
      const toRemove = new Set<number>(Array.isArray(ids) ? ids.map(n => Number(n)) : [Number(ids)]);
      const cur = (localStorage.getItem(STORAGE_KEYS.NOTIS_DELETED_QUEUE) || '[]');
      const arr = Array.isArray(JSON.parse(cur)) ? JSON.parse(cur).map((v: any) => Number(v)) : [];
      const remaining = arr.filter((n: number) => !toRemove.has(n));
      localStorage.setItem(STORAGE_KEYS.NOTIS_DELETED_QUEUE, JSON.stringify(remaining));
    } catch (err) {
      // noop
    }
  }
};

export default storage;
