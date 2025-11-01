import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { FaGraduationCap, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'

type RestablecerResponse = {
  ok?: boolean
  mensaje?: string
  error?: string
}

const BRAND_DARK = '#1E40AF'
const BRAND_MAIN = '#3B82F6'

const RestablecerAdmin: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [token, setToken] = useState<string | null>(null)
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setExito(false)
      setMensaje('Token inválido o expirado. Solicite un nuevo enlace de recuperación.')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setExito(null)

    // Validaciones
    if (!nueva || !confirmar) {
      setExito(false)
      setMensaje('Por favor complete ambos campos.')
      return
    }

    if (nueva.length < 6) {
      setExito(false)
      setMensaje('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (nueva !== confirmar) {
      setExito(false)
      setMensaje('Las contraseñas no coinciden.')
      return
    }

    if (!token) {
      setExito(false)
      setMensaje('Token inválido.')
      return
    }

    setGuardando(true)

    try {
      const res = await fetch(
        'https://gillian-semiluminous-blubberingly.ngrok-free.dev/auth/recovery/admin/restablecer',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ token, nueva }),
        }
      )

      const data: RestablecerResponse = await res.json()

      if (res.ok && (data.ok ?? true)) {
        setExito(true)
        setMensaje('¡Contraseña actualizada exitosamente! Redirigiendo al login...')
        setNueva('')
        setConfirmar('')
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
      } else {
        setExito(false)
        setMensaje(
          data.error || 
          data.mensaje || 
          'Token inválido o expirado. Solicite un nuevo enlace de recuperación.'
        )
      }
    } catch {
      setExito(false)
      setMensaje('Error de red o del servidor.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F7FAFF] via-[#F9FBFF] to-white">
      {/* Volver */}
      <div className="mx-auto w-full max-w-4xl px-5 pt-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          <span aria-hidden>←</span> Volver a inicio de sesión
        </Link>
      </div>

      {/* Contenido */}
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center px-4 pb-12">
        {/* Icono birrete */}
        <div
          className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
          aria-hidden
        >
          <FaGraduationCap className="text-white" size={22} />
        </div>

        <h1 className="mt-3 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          Restablecer Contraseña
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Ingrese su nueva contraseña
        </p>

        {/* Card principal */}
        <div className="mt-6 w-full max-w-lg rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
          {!token ? (
            // Token inválido o no presente
            <div className="text-center py-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3">
                <span className="text-2xl text-red-600">⚠️</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Token Inválido</h2>
              <p className="text-sm text-slate-600 mb-4">
                El enlace de recuperación es inválido o ha expirado.
              </p>
              <Link
                to="/password"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white shadow-md transition"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : (
            // Formulario de restablecimiento
            <>
              <h2 className="text-lg font-semibold text-slate-900">Nueva Contraseña</h2>
              <p className="mt-1 text-[13px] text-slate-600">
                Ingrese su nueva contraseña (mínimo 6 caracteres)
              </p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                {/* Nueva contraseña */}
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-700">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNueva ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={nueva}
                      onChange={(e) => setNueva(e.target.value)}
                      required
                      disabled={guardando}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 py-2 text-sm outline-none transition
                                 focus:border-transparent focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      // @ts-ignore
                      style={{ '--tw-ring-color': BRAND_MAIN }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNueva((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      tabIndex={-1}
                    >
                      {showNueva ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-700">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmar ? 'text' : 'password'}
                      placeholder="Repita la contraseña"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      required
                      disabled={guardando}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 py-2 text-sm outline-none transition
                                 focus:border-transparent focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      // @ts-ignore
                      style={{ '--tw-ring-color': BRAND_MAIN }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      tabIndex={-1}
                    >
                      {showConfirmar ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={guardando || !token}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white shadow-md transition disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
                >
                  <FiCheck className="-ml-1" />
                  {guardando ? 'Guardando…' : 'Restablecer Contraseña'}
                </button>

                {mensaje && (
                  <p
                    className={`text-center text-[13px] ${
                      exito ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {mensaje}
                  </p>
                )}
              </form>

              <div className="mt-4 text-center text-[13px] text-slate-600">
                ¿Recordó su contraseña?{' '}
                <Link to="/login" className="font-semibold" style={{ color: BRAND_MAIN }}>
                  Iniciar sesión
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Nota informativa */}
        {token && (
          <div className="mt-5 w-full max-w-lg rounded-xl border border-[#E0E9FF] bg-[#F2F6FF] p-4 text-[13px] text-slate-700">
            <p>
              <span className="font-semibold">Nota:</span> Su contraseña debe tener al menos 6
              caracteres.
            </p>
            <p className="mt-1">
              Después de cambiar su contraseña, podrá iniciar sesión con las nuevas credenciales.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RestablecerAdmin

