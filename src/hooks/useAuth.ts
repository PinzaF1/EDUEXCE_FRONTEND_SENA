/**
 * Hook personalizado para manejo de autenticación
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { storage } from '@/utils/storage';
import { ROUTES } from '@/utils/constants';
import type { LoginResponse } from '@/types';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(storage.getUser());
  const navigate = useNavigate();

  // Verificar autenticación al montar
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = storage.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Login
  const login = async (correo: string, password: string): Promise<void> => {
    try {
      const response = await api.login(correo, password) as LoginResponse;
      
      // Guardar datos en localStorage
      storage.setToken(response.token);
      storage.setUser({
        nombre_institucion: response.nombre_institucion,
        rol: response.rol,
        id_institucion: response.id_institucion
      });

      // Actualizar estado
      setIsAuthenticated(true);
      setUser(storage.getUser());

      // Redirigir a la ruta guardada o al dashboard
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath, { replace: true })
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true })
      }
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = (): void => {
    storage.clearSession();
    setIsAuthenticated(false);
    setUser({ institution: '', institutionId: '', role: '' });
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // Verificar si está autenticado
  const checkAuth = (): boolean => {
    return storage.isAuthenticated();
  };

  return {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    checkAuth
  };
};

export default useAuth;
