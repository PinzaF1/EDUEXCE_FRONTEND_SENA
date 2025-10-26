import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Rutas públicas
import LoginAdm from '../src/assets/LoginAdm'
import RegistroAdm from '../src/assets/RegistroAdm'
import RestContra from '../src/assets/RestContra'

// Landing / Publicidad
import Publicidad from '../src/assets/Publicidad'

// Dashboard principal
import Dashboard from '../src/assets/Dashboard'

// Componentes internos del dashboard (usando <Outlet/> en Dashboard)
import Inicio from '../src/assets/Inicio'
import Estudiantes from '../src/assets/Estudiantes'
import Seguimiento from '../src/assets/Seguimiento'
import Notificaciones from '../src/assets/Notificaciones'
import Perfil from './assets/perfil'
import Configuracion from './assets/Configuracion'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/publicidad" replace />} />

        <Route path="/publicidad" element={<Publicidad />} />

        <Route path="/login" element={<LoginAdm />} />
        <Route path="/registro" element={<RegistroAdm />} />
        <Route path="/password" element={<RestContra />} />

        <Route path="/informacion" element={<Publicidad />} />

        <Route
          path="/admin/cambiar-password"
          element={<Navigate to="/dashboard/configuracion?view=password" replace />}
        />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Inicio />} />
          <Route path="estudiantes" element={<Estudiantes />} />
          <Route path="seguimiento" element={<Seguimiento />} />
          <Route path="notificaciones" element={<Notificaciones />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        <Route path="*" element={<Navigate to="/publicidad" replace />} />
      </Routes>
    </Router>
  )
}

export default App
