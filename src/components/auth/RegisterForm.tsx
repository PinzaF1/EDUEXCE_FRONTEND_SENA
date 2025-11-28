import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl, baseHeaders } from '@/utils/api'
import {
  FaSchool,
  FaBarcode,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGraduationCap, // ⟵ birrete desde react-icons/fa
} from 'react-icons/fa'
import { FaChevronDown } from 'react-icons/fa6'

const BRAND_DARK = '#1E40AF'
const BRAND_MAIN = '#3B82F6'

type FormState = {
  nombre_institucion: string
  codigo_dane: string
  ciudad: string
  departamento: string
  direccion: string
  telefono: string
  jornada: string
  correo: string
  password: string
  confirm_password: string
}

/* --- Dropdown custom para Jornada (sin librerías, en el mismo archivo) --- */
const SelectJornada: React.FC<{
  value: string
  onChange: (v: string) => void
  required?: boolean
}> = ({ value, onChange, required }) => {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number>(-1)
  const ref = useRef<HTMLDivElement>(null)
  const options = ['mañana', 'tarde', 'completa']

  const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Seleccione la jornada'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setOpen(true)
      setActiveIdx(Math.max(0, options.indexOf(value)))
      return
    }
    if (!open) return
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i < options.length - 1 ? i + 1 : 0))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i > 0 ? i - 1 : options.length - 1))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const chosen = options[activeIdx >= 0 ? activeIdx : 0]
      onChange(chosen)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o)
          setActiveIdx(Math.max(0, options.indexOf(value)))
        }}
        className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-left text-sm focus:outline-none focus:ring-2"
        // @ts-ignore
        style={{ '--tw-ring-color': BRAND_MAIN }}
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>{label}</span>
        <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {options.map((opt, idx) => {
            const selected = value === opt
            const active = idx === activeIdx
            return (
              <li
                key={opt}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={`cursor-pointer select-none rounded-md px-3 py-2 text-sm ${
                  selected || active ? 'bg-[#3B82F6] text-white' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </li>
            )
          })}
        </ul>
      )}

      {/* mantiene el nombre del campo para el backend */}
      <input type="hidden" name="jornada" value={value} required={required} />
    </div>
  )
}
/* ----------------------------------------------------------------------- */

// Componente InputGroup movido FUERA para evitar recreación en cada render
const InputGroup: React.FC<{
  label: string
  name: keyof FormState
  icon: React.ReactNode
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}> = ({ label, name, icon, type = 'text', value, onChange, placeholder, required, inputProps }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...inputProps}
        className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 py-2.5 text-sm
                   outline-none transition-all duration-200 focus:border-transparent focus:ring-2 hover:border-slate-300"
        // @ts-ignore
        style={{ '--tw-ring-color': BRAND_MAIN }}
      />
    </div>
  </div>
)

/* ----------------------------------------------------------------------- */

const RegistroAdm: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({
    nombre_institucion: '',
    codigo_dane: '',
    ciudad: '',
    departamento: '',
    direccion: '',
    telefono: '',
    jornada: '',
    correo: '',
    password: '',
    confirm_password: '',
  })

  const [mensaje, setMensaje] = useState('')
  const [esExito, setEsExito] = useState(false) // Para diferenciar error de éxito
  const [cargando, setCargando] = useState(false)
  const [verPassword, setVerPassword] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

  const calcularFortaleza = (pwd: string): 'weak' | 'medium' | 'strong' | null => {
    if (!pwd) return null
    if (pwd.length < 6) return 'weak'
    const tieneNumero = /\d/.test(pwd)
    const tieneMayuscula = /[A-Z]/.test(pwd)
    const tieneMinuscula = /[a-z]/.test(pwd)
    const tieneEspecial = /[^A-Za-z0-9]/.test(pwd)
    const criterios = [tieneNumero, tieneMayuscula, tieneMinuscula, tieneEspecial].filter(Boolean).length
    if (pwd.length >= 10 && criterios >= 3) return 'strong'
    if (pwd.length >= 8 && criterios >= 2) return 'medium'
    return 'weak'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name as keyof FormState]: value } as FormState))
    if (name === 'password') {
      setPasswordStrength(calcularFortaleza(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setEsExito(false)

    if (form.password !== form.confirm_password) {
      setMensaje('Las contraseñas no coinciden')
      setEsExito(false)
      return
    }

    setCargando(true)
    try {
      const res = await fetch(apiUrl('/instituciones/registro'), {
        method: 'POST',
        headers: baseHeaders(),
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.ok && data.institucion) {
        setMensaje('✓ Institución registrada correctamente. Redirigiendo al login...')
        setEsExito(true)
        
        // Guardar datos (opcional, por si quieres hacer auto-login después)
        localStorage.setItem('nombre_institucion', data.institucion.nombre_institucion || '')
        if (data.institucion.id_institucion) {
          localStorage.setItem('id_institucion', String(data.institucion.id_institucion))
        }

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
      } else {
        setMensaje(data.mensaje || data.error || 'Error al registrar la institución')
        setEsExito(false)
      }
    } catch {
      setMensaje('Error de conexión con el servidor')
      setEsExito(false)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F7FAFF] via-[#F8FBFF] to-white">
      {/* Volver al inicio */}
      <div className="mx-auto w-full max-w-5xl px-6 py-4">
        <Link
          to="/publicidad"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <span aria-hidden>←</span> Volver al inicio
        </Link>
      </div>

      {/* Contenedor principal */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-16">
        {/* Encabezado */}
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
            style={{ background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND_MAIN} 100%)` }}
          >
            {/* Birrete de la librería */}
            <FaGraduationCap size={18} className="text-white" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Registro de Institución</h1>
            <p className="text-[13px] text-slate-600 -mt-0.5">
              Complete la información para registrar su institución
            </p>
          </div>
        </div>

        {/* Tarjeta del formulario */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Información Institucional</h2>
            <p className="text-xs text-slate-500">Todos los campos marcados con (*) son obligatorios</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <InputGroup
              label="Nombre de la Institución"
              name="nombre_institucion"
              icon={<FaSchool />}
              value={form.nombre_institucion}
              onChange={handleChange}
              placeholder="Ej: Institución Educativa San José"
              required
              inputProps={{ autoComplete: 'organization', autoFocus: true }}
            />

            <InputGroup
              label="Código DANE"
              name="codigo_dane"
              icon={<FaBarcode />}
              type="text"
              value={form.codigo_dane}
              onChange={handleChange}
              placeholder="Ej: 111000100123"
              required
              inputProps={{ inputMode: 'numeric', pattern: '\\d+', title: 'Sólo números' }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputGroup
                label="Ciudad"
                name="ciudad"
                icon={<FaMapMarkerAlt />}
                value={form.ciudad}
                onChange={handleChange}
                placeholder="Ej: Bogotá"
                required
              />
              <InputGroup
                label="Departamento"
                name="departamento"
                icon={<FaMapMarkerAlt />}
                value={form.departamento}
                onChange={handleChange}
                placeholder="Ej: Cundinamarca"
                required
              />
            </div>

            <InputGroup
              label="Dirección"
              name="direccion"
              icon={<FaMapMarkerAlt />}
              value={form.direccion}
              onChange={handleChange}
              placeholder="Ej: Calle 123 #45-67"
              required
            />

            <InputGroup
              label="Teléfono"
              name="telefono"
              icon={<FaPhoneAlt />}
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: 3001234567"
              required
            />

            <InputGroup
              label="Correo Institucional"
              name="correo"
              icon={<FaEnvelope />}
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="Ej: admin@institucion.edu.co"
              required
              inputProps={{ autoComplete: 'email' }}
            />

            {/* Jornada (dropdown custom azul) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Jornada <span className="text-red-500">*</span>
              </label>
              <SelectJornada
                value={form.jornada}
                onChange={(v) => setForm((prev) => ({ ...prev, jornada: v }))}
                required
              />
            </div>

            {/* Contraseñas */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaLock />
                  </span>
                  <input
                    type={verPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-9 py-2.5 text-sm
                               outline-none transition-all duration-200 focus:border-transparent focus:ring-2 hover:border-slate-300"
                    // @ts-ignore
                    style={{ '--tw-ring-color': BRAND_MAIN }}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded p-1"
                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    tabIndex={-1}
                  >
                    {verPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Indicador de fortaleza */}
                {form.password && passwordStrength && (
                  <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength === 'weak' ? 'bg-red-500' :
                        passwordStrength === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength === 'medium' ? 'bg-yellow-500' :
                        passwordStrength === 'strong' ? 'bg-green-500' :
                        'bg-slate-200'
                      }`} />
                      <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-slate-200'
                      }`} />
                    </div>
                    <p className={`mt-1 text-[10px] font-medium ${
                      passwordStrength === 'weak' ? 'text-red-600' :
                      passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength === 'weak' ? '⚠️ Débil: Use mayúsculas, números y símbolos' :
                       passwordStrength === 'medium' ? '🔒 Media: Agregue más caracteres o símbolos' :
                       '✅ Fuerte: Contraseña segura'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaLock />
                  </span>
                  <input
                    type={verConfirmar ? 'text' : 'password'}
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Repita la contraseña"
                    required
                    autoComplete="new-password"
                    className={`w-full rounded-md border bg-white pl-8 pr-9 py-2.5 text-sm
                               outline-none transition-all duration-200 focus:border-transparent focus:ring-2 hover:border-slate-300 ${
                                 form.confirm_password && form.password !== form.confirm_password
                                   ? 'border-red-300 focus:ring-red-500'
                                   : 'border-slate-200'
                               }`}
                    // @ts-ignore
                    style={{ '--tw-ring-color': form.confirm_password && form.password !== form.confirm_password ? '#ef4444' : BRAND_MAIN }}
                  />
                  <button
                    type="button"
                    onClick={() => setVerConfirmar((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded p-1"
                    aria-label={verConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    tabIndex={-1}
                  >
                    {verConfirmar ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Validación de coincidencia */}
                {form.confirm_password && (
                  <p className={`mt-1 text-[10px] font-medium animate-in fade-in slide-in-from-top-1 duration-300 ${
                    form.password === form.confirm_password ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {form.password === form.confirm_password ? '✅ Las contraseñas coinciden' : '⚠️ Las contraseñas no coinciden'}
                  </p>
                )}
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando || (form.password && form.confirm_password && form.password !== form.confirm_password)}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md px-4 py-2.5
                         font-semibold text-white shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                         hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND_MAIN} 100%)` }}
            >
              {cargando ? 'Registrando…' : 'Registrar Institución'}
            </button>

            {mensaje && (
              <div className={`rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-300 ${
                esExito ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-center text-xs font-medium ${
                  esExito ? 'text-green-700' : 'text-red-700'
                }`}>
                  {mensaje}
                </p>
              </div>
            )}

            <p className="mt-3 text-center text-xs text-slate-600">
              ¿Ya tiene una cuenta?{' '}
              <Link to="/login" className="font-semibold" style={{ color: BRAND_MAIN }}>
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegistroAdm
