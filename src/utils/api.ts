/**
 * Utilidades centralizadas para peticiones HTTP al backend
 * Incluye headers de ngrok y manejo de autenticación
 */

// Base URL del backend (con fallback a ngrok)
const RAW_BASE = (import.meta as any).env?.VITE_API_URL || 
  "https://unimparted-henrietta-uninspissated.ngrok-free.dev/";

export const API_BASE_URL = RAW_BASE.replace(/\/+$/, ""); // Quitar "/" al final

/**
 * Construye una URL completa del API
 * @param path - Ruta del endpoint (ej: "/admin/login" o "admin/login")
 */
export const apiUrl = (path: string = ""): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Headers base para todas las peticiones
 * INCLUYE el header de ngrok para evitar la página de verificación
 */
export const baseHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
  "ngrok-skip-browser-warning": "true", // ← CRÍTICO para ngrok
});

/**
 * Headers con autenticación (incluye token JWT si existe)
 */
export const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return {
    ...baseHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Helper para peticiones GET con autenticación
 */
export const getJSON = async <T>(path: string): Promise<T> => {
  const url = apiUrl(path);
  const response = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Helper para peticiones POST (públicas o con auth)
 */
export const postJSON = async <T>(
  path: string,
  body: any,
  options?: { requiresAuth?: boolean }
): Promise<T> => {
  const url = apiUrl(path);
  const headers = options?.requiresAuth ? authHeaders() : baseHeaders();

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Helper para peticiones PUT con autenticación
 */
export const putJSON = async <T>(path: string, body: any): Promise<T> => {
  const url = apiUrl(path);
  const response = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Helper para peticiones DELETE con autenticación
 */
export const deleteJSON = async <T>(path: string): Promise<T> => {
  const url = apiUrl(path);
  const response = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Verificar si hay un token válido
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

/**
 * Cerrar sesión (limpiar localStorage)
 */
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("nombre_institucion");
  localStorage.removeItem("rol");
  localStorage.removeItem("id_institucion");
};

