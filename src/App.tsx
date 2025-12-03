import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Rutas públicas (Auth)
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import PasswordRequest from '@/components/auth/PasswordRequest'
import PasswordReset from '@/components/auth/PasswordReset'

// Landing
import Landing from '@/components/landing/Landing'

// Dashboard principal
import Dashboard from '@/components/dashboard/Dashboard'

// Páginas del dashboard
import Home from '@/components/dashboard/Home'
import Students from '@/components/dashboard/Students'
import Tracking from '@/components/dashboard/Tracking'
import Notifications from '@/components/dashboard/Notifications'
import Profile from '@/components/dashboard/Profile'
import Settings from '@/components/dashboard/Settings'

import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/publicidad" replace />} />

        <Route path="/publicidad" element={<Landing />} />

        {/* Rutas públicas */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/registro" element={<RegisterForm />} />
        <Route path="/password" element={<PasswordRequest />} />
        <Route path="/restablecer" element={<PasswordReset />} />

        <Route path="/informacion" element={<Landing />} />

        <Route
          path="/admin/cambiar-password"
          element={<Navigate to="/dashboard/configuracion?view=password" replace />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="estudiantes" element={<Students />} />
          <Route path="seguimiento" element={<Tracking />} />
          <Route path="notificaciones" element={<Notifications />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/publicidad" replace />} />
      </Routes>
    </Router>
  )
}

export default App