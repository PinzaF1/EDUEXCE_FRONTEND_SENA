import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaGraduationCap } from 'react-icons/fa'
import { FiMail } from 'react-icons/fi'

type RecoveryResponse = {
  ok?: boolean
  mensaje?: string
  error?: string
}

const BRAND_DARK = '#1E40AF'
const BRAND_MAIN = '#3B82F6'

const RestContra: React.FC = () => {
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setExito(null)
    setEnviando(true)

    try {
      const res = await fetch(
        'https://gillian-semiluminous-blubberingly.ngrok-free.dev/auth/recovery/admin/enviar',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ correo: correo.trim().toLowerCase() }),
        }
      )
      const data: RecoveryResponse = await res.json()
      if (res.ok && (data.ok ?? true)) {
        setExito(true)
        setMensaje('Te enviamos instrucciones a tu correo electrónico.')
      } else {
        setExito(false)
        setMensaje(data.error || data.mensaje || 'No se pudo enviar el correo.')
      }
    } catch {
      setExito(false)
      setMensaje('Error de red o del servidor.')
    } finally {
      setEnviando(false)
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
        {/* Icono birrete (más pequeño) */}
        <div
          className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
          aria-hidden
        >
          <FaGraduationCap className="text-white" size={22} />
        </div>

        <h1 className="mt-3 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          Recuperar Contraseña
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Ingrese su correo para restablecer su contraseña
        </p>

        {/* Card principal (más angosta y con menos padding) */}
        <div className="mt-6 w-full max-w-lg rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-900">Restablecer Contraseña</h2>
          <p className="mt-1 text-[13px] text-slate-600">
            Le enviaremos un enlace de recuperación a su correo institucional
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-slate-700">
                Correo Institucional
              </label>
              <input
                type="email"
                placeholder="admin@institucion.edu.co"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition
                           focus:border-transparent focus:ring-2"
                // @ts-ignore
                style={{ '--tw-ring-color': BRAND_MAIN }}
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white shadow-md transition disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
            >
              <FiMail className="-ml-1" />
              {enviando ? 'Enviando…' : 'Enviar Enlace de Recuperación'}
            </button>

            {mensaje && (
              <p className={`text-center text-[13px] ${exito ? 'text-green-600' : 'text-red-500'}`}>
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
        </div>

        {/* Nota informativa (compacta) */}
        <div className="mt-5 w-full max-w-lg rounded-xl border border-[#E0E9FF] bg-[#F2F6FF] p-4 text-[13px] text-slate-700">
          <p>
            <span className="font-semibold">Nota:</span> El enlace de recuperación será válido por 1 hora.
          </p>
          <p className="mt-1">
            Si no recibe el correo, revise su carpeta de spam.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RestContra
