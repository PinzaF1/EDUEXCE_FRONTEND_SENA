import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Rutas públicas (Auth) - Carga inmediata (críticas)
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import PasswordRequest from '@/components/auth/PasswordRequest'
import PasswordReset from '@/components/auth/PasswordReset'

// Landing - Carga inmediata (primera página)
import Landing from '@/components/landing/Landing'

// Dashboard principal - Lazy load (solo cuando el usuario hace login)
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'))
const Home = lazy(() => import('@/components/dashboard/Home'))
const Students = lazy(() => import('@/components/dashboard/Students'))
const Tracking = lazy(() => import('@/components/dashboard/Tracking'))
const Notifications = lazy(() => import('@/components/dashboard/Notifications'))
const Profile = lazy(() => import('@/components/dashboard/Profile'))
const Settings = lazy(() => import('@/components/dashboard/Settings'))

// Componente de carga mientras se cargan los lazy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Cargando...</p>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/publicidad" replace />} />

          <Route path="/publicidad" element={<Landing />} />

          <Route path="/login" element={<LoginForm />} />
          <Route path="/registro" element={<RegisterForm />} />
          <Route path="/password" element={<PasswordRequest />} />
          <Route path="/restablecer" element={<PasswordReset />} />

          <Route path="/informacion" element={<Landing />} />

          <Route
            path="/admin/cambiar-password"
            element={<Navigate to="/dashboard/configuracion?view=password" replace />}
          />

          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Home />} />
            <Route path="estudiantes" element={<Students />} />
            <Route path="seguimiento" element={<Tracking />} />
            <Route path="notificaciones" element={<Notifications />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="configuracion" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/publicidad" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
