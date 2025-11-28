import { Navigate } from 'react-router-dom'
import { storage } from '@/utils/storage'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = storage.isAuthenticated()

  if (!isAuthenticated) {
    // Guardar la ruta intentada para redirigir después del login
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', currentPath)
    }
    
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
