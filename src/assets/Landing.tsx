import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiBookOpen,
  FiTarget,
  FiUsers,
  FiGlobe,
  FiGrid,
  FiAward,
  FiZap,
} from 'react-icons/fi'
import { FaGraduationCap } from 'react-icons/fa' // ← birrete correcto (Font Awesome)

const BRAND_DARK = '#1E40AF' // azul marca
const BRAND_MAIN = '#3B82F6' // azul claro

// Colores por área
const AREA = {
  Mate:   { name: 'Matemáticas', color: '#EF4444', icon: <FiGrid /> },       // rojo
  Lengua: { name: 'Lenguaje',     color: '#3B82F6', icon: <FiBookOpen /> },   // azul
  Cien:   { name: 'Ciencias',     color: '#10B981', icon: <FiTarget /> },     // verde
  Soc:    { name: 'Sociales',     color: '#F59E0B', icon: <FiUsers /> },      // naranja/amarillo
  Ing:    { name: 'Inglés',       color: '#8B5CF6', icon: <FiGlobe /> },      // morado
} as const

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mx-auto w-full max-w-6xl px-4">{children}</div>
)

const AreaCard: React.FC<{ title: string; color: string; icon: React.ReactNode; desc: string }> = ({ title, color, icon, desc }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_25px_rgba(2,8,23,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,8,23,0.08)]">
    <div
      className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
      style={{ background: color }}
    >
      {icon}
    </div>
    <div className="text-[15px] font-semibold text-slate-900">{title}</div>
    <p className="mt-1 text-[13px] leading-6 text-slate-600">{desc}</p>
  </div>
)

const FeatureTile: React.FC<{ icon: React.ReactNode; title: string; kpi: string }> = ({ icon, title, kpi }) => (
  <div className="rounded-xl border border-slate-200 bg-[rgba(166, 207, 249, 0.8)] p-5 shadow-sm ring-1 ring-white/50">
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: '#e7eaf0ff', color: BRAND_DARK }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[13px] font-medium text-slate-600">{title}</div>
        <div className="text-lg font-semibold text-slate-900">{kpi}</div>
      </div>
    </div>
  </div>
)

const Landing: React.FC = () => {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <Shell>
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl shadow"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
                aria-hidden
              >
                <FaGraduationCap size={18} color="#fff" />
              </div>
              <div>
                <div className="text-[18px] font-extrabold">EduExce</div>
                <div className="text-[12px] -mt-0.5 text-slate-500">Excelencia Educativa</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
              >
                Registrar Institución
              </Link>
            </div>
          </div>
        </Shell>
      </header>

      {/* HERO AZUL */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `
            radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px) 0 0/14px 14px,
            linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})
          `,
        }}
      >
        <Shell>
          <div className="py-16 text-center text-white md:py-20">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 shadow">
              <FaGraduationCap size={22} color="#fff" />
            </div>

            <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
              Tu plataforma integral para la <span className="underline decoration-white/30 underline-offset-4">excelencia educativa</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-white/90">
              "EduExce combina 'Educación' y 'Excelencia'. Representa la búsqueda constante de la perfección académica y los más altos estándares educativos."
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            </div>
          </div>
        </Shell>

        <svg className="block w-full text-white" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,32L80,32C160,32,320,32,480,26.7C640,21,800,11,960,13.3C1120,16,1280,32,1360,40L1440,48L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" />
        </svg>
      </section>

      {/* BLOQUE 2×2 */}
      <section className="py-10 md:py-12">
        <Shell>
          <div className="rounded-3xl bg-gradient-to-b from-[#F0F6FF] to-white p-6 shadow-[0_20px_60px_rgba(2,8,23,0.08)]">
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureTile icon={<FiBookOpen />} title="Islas de Conocimiento" kpi="5 Áreas" />
              <FeatureTile icon={<FiAward />}     title="Sistema de Logros"      kpi="Insignias" />
              <FeatureTile icon={<FiUsers />}     title="Ranking Global"         kpi="Competitivo" />
              <FeatureTile icon={<FiZap />}       title="Retos 1v1"              kpi="En Tiempo Real" />
            </div>
          </div>
        </Shell>
      </section>

      {/* ISLAS – 5 ÁREAS */}
      <section className="bg-slate-50/60 py-12">
        <Shell>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">Explora las Islas de Conocimiento</h2>
            <p className="mx-auto mt-2 max-w-2xl text-[15px] text-slate-600">
              Avanza por subniveles, realiza simulacros finales y consulta reportes claros de progreso en cada área ICFES.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            <AreaCard title={AREA.Mate.name}   color={AREA.Mate.color}   icon={AREA.Mate.icon}   desc="resolución de problemas, razonamiento numérico, álgebra, geometría y datos." />
            <AreaCard title={AREA.Lengua.name} color={AREA.Lengua.color} icon={AREA.Lengua.icon} desc="comprensión y análisis de textos; gramática y escritura básica." />
            <AreaCard title={AREA.Cien.name}   color={AREA.Cien.color}   icon={AREA.Cien.icon}   desc="biología, física y química aplicadas; explicación de fenómenos con método científico." />
            <AreaCard title={AREA.Soc.name}    color={AREA.Soc.color}    icon={AREA.Soc.icon}    desc="historia, geografía, economía y ciudadanía; lectura crítica de contextos sociales." />
            <AreaCard title={AREA.Ing.name}    color={AREA.Ing.color}    icon={AREA.Ing.icon}    desc="comprensión lectora y uso funcional del idioma en situaciones cotidianas y académicas." />
          </div>
        </Shell>
      </section>

      {/* CTA + QR UNIVERSAL */}
      <section className="py-14">
        <Shell>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.5)]">
            <h3 className="text-2xl font-extrabold">¿Listo para alcanzar la excelencia académica?</h3>
            <p className="mx-auto mt-2 max-w-2xl text-[15px] text-slate-600">
              Únete a las instituciones que confían en EduExce para organizar, evaluar y mejorar los resultados de sus estudiantes.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/registro"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
              >
                Registrar Institución
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Iniciar Sesión
              </Link>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="rounded-2xl bg-white p-3 shadow-xl">
                <div
                  className="grid h-52 w-52 place-items-center rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${BRAND_MAIN}, ${BRAND_DARK})` }}
                >
                  <svg width="140" height="140" viewBox="0 0 120 120" fill="white">
                    <rect x="8" y="8" width="28" height="28" rx="4" />
                    <rect x="84" y="8" width="28" height="28" rx="4" />
                    <rect x="8" y="84" width="28" height="28" rx="4" />
                    <rect x="44" y="44" width="12" height="12" />
                    <rect x="60" y="44" width="8" height="8" />
                    <rect x="44" y="60" width="8" height="8" />
                    <rect x="60" y="60" width="12" height="12" />
                    <rect x="92" y="56" width="8" height="8" />
                    <rect x="72" y="84" width="10" height="10" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[13px] text-slate-500">*Código QR simulado para prototipo (universal).</p>
          </div>
        </Shell>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-6">
        <Shell>
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg shadow"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND_MAIN})` }}
              >
                <FaGraduationCap size={16} color="#fff" />
              </div>
              <div>
                <div className="text-sm font-semibold">EduExce</div>
                <div className="text-[12px] -mt-0.5 text-slate-500">Excelencia Educativa</div>
              </div>
            </div>
            <div className="text-[12px] text-slate-500">© {year} EduExce. Todos los derechos reservados.</div>
          </div>
        </Shell>
      </footer>
    </div>
  )
}

export default Landing

