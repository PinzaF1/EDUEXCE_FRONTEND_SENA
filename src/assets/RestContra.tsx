import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGraduationCap } from 'react-icons/fa'
import { FiMail, FiLock, FiKey } from 'react-icons/fi'
import { apiUrl, baseHeaders } from '../utils/api'
import Swal from 'sweetalert2'

const BRAND_DARK = '#1E40AF'
const BRAND_MAIN = '#3B82F6'

const RestContra: React.FC = () => {
  const navigate = useNavigate()
  
  // Estado
  const [paso, setPaso] = useState<1 | 2 | 3>(1) // 1=correo, 2=código, 3=nueva contraseña
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [enviando, setEnviando] = useState(false)

  // PASO 1: Solicitar código
  const solicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    try {
      const res = await fetch(apiUrl('/auth/recovery/admin/solicitar'), {
        method: 'POST',
        headers: baseHeaders(),
        body: JSON.stringify({ correo: correo.trim().toLowerCase() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Código Enviado!',
          text: 'Revisa tu correo electrónico. Te enviamos un código de 6 dígitos.',
          confirmButtonColor: BRAND_MAIN,
        })
        setPaso(2)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Correo no registrado',
          confirmButtonColor: BRAND_MAIN,
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor. Verifica tu conexión.',
        confirmButtonColor: BRAND_MAIN,
      })
    } finally {
      setEnviando(false)
    }
  }

  // PASO 2: Verificar código
  const verificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    try {
      const res = await fetch(apiUrl('/auth/recovery/admin/verificar'), {
        method: 'POST',
        headers: baseHeaders(),
        body: JSON.stringify({ 
          correo: correo.trim().toLowerCase(),
          codigo: codigo.trim() 
        }),
      })

      const data = await res.json()

      if (res.ok && data.valid) {
        Swal.fire({
          icon: 'success',
          title: '¡Código Válido!',
          text: 'Ahora puedes establecer tu nueva contraseña',
          confirmButtonColor: BRAND_MAIN,
        })
        setPaso(3)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Código Inválido',
          text: 'El código es incorrecto o ha expirado. Intenta nuevamente.',
          confirmButtonColor: BRAND_MAIN,
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: BRAND_MAIN,
      })
    } finally {
      setEnviando(false)
    }
  }

  // PASO 3: Restablecer contraseña
  const restablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (nuevaPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 6 caracteres',
        confirmButtonColor: BRAND_MAIN,
      })
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Las contraseñas no coinciden',
        text: 'Por favor verifica que ambas contraseñas sean iguales',
        confirmButtonColor: BRAND_MAIN,
      })
      return
    }

    setEnviando(true)

    try {
      const res = await fetch(apiUrl('/auth/recovery/admin/restablecer-codigo'), {
        method: 'POST',
        headers: baseHeaders(),
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          codigo: codigo.trim(),
          nueva_password: nuevaPassword,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Contraseña Actualizada!',
          text: 'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.',
          confirmButtonColor: BRAND_MAIN,
        })
        navigate('/login')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'No se pudo restablecer la contraseña',
          confirmButtonColor: BRAND_MAIN,
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: BRAND_MAIN,
      })
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
        {/* Icono birrete */}
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
          {paso === 1 && 'Ingresa tu correo para recibir un código de verificación'}
          {paso === 2 && 'Ingresa el código que te enviamos por correo'}
          {paso === 3 && 'Establece tu nueva contraseña'}
        </p>

        {/* Indicador de pasos */}
        <div className="mt-6 flex items-center gap-2">
          <div className={`h-2 w-16 rounded-full ${paso >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <div className={`h-2 w-16 rounded-full ${paso >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <div className={`h-2 w-16 rounded-full ${paso >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
        </div>

        {/* Card principal */}
        <div className="mt-6 w-full max-w-lg rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
          
          {/* PASO 1: Solicitar código */}
          {paso === 1 && (
            <form onSubmit={solicitarCodigo} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Correo Institucional
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@institucion.edu.co"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white shadow-md transition disabled:opacity-60 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
              >
                <FiMail />
                {enviando ? 'Enviando...' : 'Enviar Código'}
              </button>
            </form>
          )}

          {/* PASO 2: Verificar código */}
          {paso === 2 && (
            <form onSubmit={verificarCodigo} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Código de Verificación
                </label>
                <div className="relative">
                  <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="123456"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-center text-2xl font-bold tracking-widest outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Ingresa el código de 6 dígitos que enviamos a {correo}
                </p>
              </div>

              <button
                type="submit"
                disabled={enviando || codigo.length !== 6}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white shadow-md transition disabled:opacity-60 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
              >
                <FiKey />
                {enviando ? 'Verificando...' : 'Verificar Código'}
              </button>

              <button
                type="button"
                onClick={() => setPaso(1)}
                className="w-full text-sm text-slate-600 hover:text-slate-800 transition"
              >
                ← Cambiar correo
              </button>
            </form>
          )}

          {/* PASO 3: Nueva contraseña */}
          {paso === 3 && (
            <form onSubmit={restablecerPassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white shadow-md transition disabled:opacity-60 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
              >
                <FiLock />
                {enviando ? 'Guardando...' : 'Restablecer Contraseña'}
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-[13px] text-slate-600">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="font-semibold" style={{ color: BRAND_MAIN }}>
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-5 w-full max-w-lg rounded-xl border border-[#E0E9FF] bg-[#F2F6FF] p-4 text-[13px] text-slate-700">
          <p>
            <span className="font-semibold">Nota:</span> El código de verificación es válido por 15 minutos.
          </p>
          <p className="mt-1">
            Si no recibes el correo, revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RestContra
