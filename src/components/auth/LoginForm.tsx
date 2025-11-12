import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, BRAND_COLORS, MESSAGES } from '@/utils/constants'

const LoginForm: React.FC = () => {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setLoading(true)
    
    try {
      await login(correo, password)
    } catch (error: any) {
      setMensaje(error.message || MESSAGES.LOGIN_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F7FAFF] via-[#F9FBFF] to-white">
      {/* Volver */}
      <div className="mx-auto w-full max-w-5xl px-5 pt-4">
        <Link
          to={ROUTES.LANDING}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          <span aria-hidden>←</span> Volver al inicio
        </Link>
      </div>

      {/* Contenido */}
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-center px-4 pb-16">
        {/* Icono + título */}
        <div
          className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.DARK}, ${BRAND_COLORS.MAIN})` }}
          aria-hidden
        >
          <FaGraduationCap size={26} className="text-white" />
        </div>

        <h1 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Iniciar Sesión
        </h1>
        <p className="mt-1 text-center text-[15px] text-slate-500">
          Acceda al dashboard institucional
        </p>

        {/* Card formulario */}
        <div className="mt-6 w-full max-w-xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
          <h2 className="text-left text-lg font-semibold text-slate-900">Credenciales de Acceso</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Ingrese su correo institucional y contraseña
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
            {/* Correo */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-slate-700">
                Correo Institucional
              </label>
              <div className="relative">
                <FaEnvelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="admin@institucion.edu.co"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 outline-none transition
                             focus:border-transparent focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-[12px] font-medium text-slate-700">Contraseña</label>
                <Link to={ROUTES.PASSWORD_RESET} className="text-[12px] font-medium" style={{ color: BRAND_COLORS.MAIN }}>
                  ¿Olvidó su contraseña?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 py-2.5 outline-none transition
                             focus:border-transparent focus:ring-2 focus:ring-[#3B82F6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white shadow-md transition disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.DARK}, ${BRAND_COLORS.MAIN})` }}
            >
              <FiArrowRight className="-ml-1" />
              {loading ? 'Ingresando…' : 'Iniciar Sesión'}
            </button>

            {mensaje && (
              <p className="text-center text-xs font-medium text-red-500">{mensaje}</p>
            )}
          </form>

          {/* Registro */}
          <div className="mt-5 text-center text-[13px] text-slate-600">
            ¿No tiene una cuenta?{' '}
            <Link to={ROUTES.REGISTER} className="font-semibold" style={{ color: BRAND_COLORS.MAIN }}>
              Registrar institución
            </Link>
          </div>
        </div>

        {/* Banda informativa */}
        <div className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-[#E8EEFF] bg-[#F4F7FF] px-5 py-4">
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.DARK}, ${BRAND_COLORS.MAIN})` }}
              aria-hidden
            >
              <FaGraduationCap size={16} className="text-white" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">¿Es estudiante?</p>
              <p className="text-[13px] text-slate-600">
                Descargue la app móvil para acceder a las actividades de aprendizaje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
