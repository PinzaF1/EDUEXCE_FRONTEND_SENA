// src/pages/dashboard/Seguimiento.tsx
import React, { useEffect, useState } from "react";
import {
  FaChartLine,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaBookOpen,
  FaExclamationTriangle,
  FaBullseye,
  FaSchool,
} from "react-icons/fa";

/* ===== API ===== */
const RAW_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  "https://overvaliantly-discourseless-delilah.ngrok-free.dev";
const API_BASE = RAW_BASE.replace(/\/+$/, "");
const STUDENTS_URL = `${API_BASE}/admin/estudiantes`;

/* ===== Tipos UI ===== */
type Stats = {
  promedioIcfes: number;
  mejoraMes: number;
  participantes: number;
};
type CursoRow = {
  grado: 10 | 11;
  curso: "A" | "B" | "C";
  estudiantes: number;
  promedio: number;
  progresoPct: number;
};
type AreaNombre =
  | "Lectera Critica"
  | "Matematicas"
  | "Sociales y Ciudadanas"
  | "Ciencias Naturales"
  | "Ingles";

type Refuerzo = {
  area: AreaNombre;
  porcentaje: number;
  detalle?: string;
  subtitulo?: string;
};
type AtencionRow = {
  estudiante: string;
  curso: string;
  areaDebil: AreaNombre;
  puntaje: number;
};

/* ===== Endpoints web backend ===== */
const URL_KPIS = `${API_BASE}/web/seguimiento/resumen`;
const URL_CURSOS = `${API_BASE}/web/seguimiento/cursos`;
const URL_REFUER = `${API_BASE}/web/seguimiento/areas-refuerzo?umbral=60`;
const URL_ALERTA = `${API_BASE}/web/seguimiento/estudiantes-alerta?umbral=50&min_intentos=2`;

/* ===== Helpers auth + fetch JSON ===== */
const authHeaders = () => {
  const t = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};
const getJSON = async <T = unknown,>(url: string): Promise<T> => {
  const r = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

/* ===== Normalizadores backend → UI ===== */
const uiAreaFromBackend = (a: string): AreaNombre => {
  const s = String(a || "").toLowerCase();
  if (s.includes("ciencia")) return "Ciencias Naturales";
  if (s.includes("social")) return "Sociales y Ciudadanas";
  if (s.includes("mate")) return "Matematicas";
  if (s.includes("ingl")) return "Ingles";
  if (s.includes("lect") || s.includes("lenguaj")) return "Lectera Critica";
  return (a as AreaNombre) || "Lectera Critica";
};

const parseCursosItems = (raw: any): CursoRow[] => {
  const list: any[] = Array.isArray(raw?.items) ? raw.items : [];
  return list.map((it) => {
    const label = String(it?.curso ?? "");
    const m = label.toUpperCase().match(/(10|11)\D*([ABC])/);
    const grado = (m ? Number(m[1]) : 10) as 10 | 11;
    const curso = (m ? (m[2] as "A" | "B" | "C") : "A");
    return {
      grado,
      curso,
      estudiantes: Number(it?.estudiantes ?? 0),
      promedio: Math.round(Number(it?.promedio ?? 0)),
      progresoPct: Math.round(Number(it?.progreso ?? 0)),
    };
  });
};

const parseAreasRefuerzo = (raw: any): Refuerzo[] => {
  const arr: any[] = Array.isArray(raw?.areas) ? raw.areas : [];
  return arr.map((a) => ({
    area: uiAreaFromBackend(a?.area) as AreaNombre,
    porcentaje: Math.round(Number(a?.porcentaje ?? a?.porcentaje_bajo ?? 0)),
    detalle: a?.detalle ?? undefined,
    subtitulo: a?.subtitulo ?? undefined,
  }));
};

const parseAlerta = (raw: any): AtencionRow[] => {
  const list: any[] = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
  return list.map((x) => {
    const nombre = String(x?.nombre ?? x?.estudiante ?? "").trim();
    const curso = String(x?.curso ?? "").trim();
    const area = uiAreaFromBackend(x?.area_debil ?? x?.areaDebil ?? "Lectera Critica");
    const puntaje = Math.round(Number(x?.promedio ?? x?.puntaje ?? 0));
    return {
      estudiante: nombre || "—",
      curso: curso || "—",
      areaDebil: area,
      puntaje,
    };
  });
};

/* ===== Componente ===== */
const Seguimiento: React.FC = () => {
  const [institucion, setInstitucion] = useState<string>("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [cursos, setCursos] = useState<CursoRow[]>([]);
  const [refuerzos, setRefuerzos] = useState<Refuerzo[]>([]);
  const [atencion, setAtencion] = useState<AtencionRow[]>([]);

  useEffect(() => {
    setInstitucion(localStorage.getItem("nombre_institucion") || "");
    setStats({ promedioIcfes: 0, mejoraMes: 0, participantes: 0 });

    // fallback rápido con /admin/estudiantes
    (async () => {
      try {
        const res = await fetch(STUDENTS_URL, { headers: authHeaders(), cache: "no-store" });
        if (!res.ok) return setCursos(baseCursosVacios);

        const data = await res.json();
        const alumnos: any[] = Array.isArray(data) ? data : data?.estudiantes ?? [];

        const normalizados = alumnos
          .map(normalizeAlumno)
          .filter(Boolean) as Array<{ grado: 10 | 11; curso: "A" | "B" | "C" }>;

        const counts = new Map<string, number>();
        for (const a of normalizados) {
          const k = `${a.grado}-${a.curso}`;
          counts.set(k, (counts.get(k) || 0) + 1);
        }

        setCursos([
          { grado: 10, curso: "A", estudiantes: counts.get("10-A") || 0, promedio: 0, progresoPct: 0 },
          { grado: 10, curso: "B", estudiantes: counts.get("10-B") || 0, promedio: 0, progresoPct: 0 },
          { grado: 10, curso: "C", estudiantes: counts.get("10-C") || 0, promedio: 0, progresoPct: 0 },
          { grado: 11, curso: "A", estudiantes: counts.get("11-A") || 0, promedio: 0, progresoPct: 0 },
          { grado: 11, curso: "B", estudiantes: counts.get("11-B") || 0, promedio: 0, progresoPct: 0 },
          { grado: 11, curso: "C", estudiantes: counts.get("11-C") || 0, promedio: 0, progresoPct: 0 },
        ]);
        setStats((s) => ({
          promedioIcfes: s?.promedioIcfes ?? 0,
          mejoraMes: s?.mejoraMes ?? 0,
          participantes: normalizados.length,
        }));
      } catch {
        setCursos(baseCursosVacios);
      }
    })();

    // datos “web”
    (async () => {
      try {
        const k = await getJSON<{
          promedioActual: number;
          mejoraEsteMes: number;
          estudiantesParticipando: number;
        }>(URL_KPIS);
        setStats((s) => ({
          promedioIcfes: Number(k?.promedioActual ?? s?.promedioIcfes ?? 0),
          mejoraMes: Number(k?.mejoraEsteMes ?? s?.mejoraMes ?? 0),
          participantes: Number(s?.participantes ?? k?.estudiantesParticipando ?? 0),
        }));

        const c = parseCursosItems(await getJSON(URL_CURSOS));
        if (c.length) setCursos(c);

        setRefuerzos(parseAreasRefuerzo(await getJSON(URL_REFUER)));
        setAtencion(parseAlerta(await getJSON(URL_ALERTA)));
      } catch {}
    })();
  }, []);

  /* ===== helpers ===== */
  const normalizeAlumno = (
    al: any
  ): { grado: 10 | 11; curso: "A" | "B" | "C" } | null => {
    const gradoSrc =
      al?.grado ?? al?.gradoNumero ?? al?.grado_numero ?? al?.grade ?? al?.nivel ?? null;
    const cursoSrc = al?.curso ?? al?.paralelo ?? al?.seccion ?? al?.group ?? al?.letra ?? null;
    const cursoComp =
      al?.curso_completo ?? al?.cursoCompleto ?? al?.cursoNombre ?? al?.gradoCurso ?? null;

    let grado: 10 | 11 | null = null;
    let curso: "A" | "B" | "C" | null = null;

    if (gradoSrc != null && cursoSrc != null) {
      const g = Number(String(gradoSrc).replace(/\D+/g, ""));
      const c = String(cursoSrc).toUpperCase().replace(/[^ABC]/g, "") as "A" | "B" | "C" | "";
      if ((g === 10 || g === 11) && c) {
        grado = g as 10 | 11;
        curso = c as "A" | "B" | "C";
      }
    }
    if ((!grado || !curso) && cursoComp) {
      const m = String(cursoComp).toUpperCase().match(/(10|11)\D*([ABC])/);
      if (m) {
        grado = Number(m[1]) as 10 | 11;
        curso = m[2] as "A" | "B" | "C";
      }
    }
    if (grado && curso) return { grado, curso };
    return null;
  };

  const baseCursosVacios: CursoRow[] = [
    { grado: 10, curso: "A", estudiantes: 0, promedio: 0, progresoPct: 0 },
    { grado: 10, curso: "B", estudiantes: 0, promedio: 0, progresoPct: 0 },
    { grado: 10, curso: "C", estudiantes: 0, promedio: 0, progresoPct: 0 },
    { grado: 11, curso: "A", estudiantes: 0, promedio: 0, progresoPct: 0 },
    { grado: 11, curso: "B", estudiantes: 0, promedio: 0, progresoPct: 0 },
    { grado: 11, curso: "C", estudiantes: 0, promedio: 0, progresoPct: 0 },
  ];

  const baseStats: Stats = stats ?? { promedioIcfes: 0, mejoraMes: 0, participantes: 0 };
  const baseCursos: CursoRow[] = cursos.length ? cursos : baseCursosVacios;
  const baseAtencion: AtencionRow[] = atencion.length ? atencion : [];

  const progresoColor = (v: number) =>
    v > 0 ? "text-green-600" : v < 0 ? "text-red-600" : "text-gray-500";

  const barra = (pct: number, color: string) => (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
    </div>
  );

  const colorDe = (area: AreaNombre) =>
    area === "Ingles"
      ? "#ec4899"
      : area === "Ciencias Naturales"
      ? "#f59e0b"
      : area === "Matematicas"
      ? "#06b6d4"
      : area === "Sociales y Ciudadanas"
      ? "#a855f7"
      : "#3b82f6";

  const pct = (n: number) => `${Math.round(n)}%`;

  /* ===== Render ===== */
  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      {/* Encabezado sutil */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <FaChartLine className="text-blue-600 text-sm" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Seguimiento Académico</h2>
            <div className="mt-1.5 h-[2px] w-36 rounded-full bg-gradient-to-r from-blue-200 to-sky-200" />
          </div>
        </div>
        <div className="text-xs text-gray-600 flex items-center gap-1.5">
          <FaSchool className="text-indigo-600" />
          <span className="font-semibold text-gray-800">{institucion || "—"}</span>
        </div>
      </div>

      {/* KPIs superiores (más compactos) */}
      <div className="rounded-xl p-4 border bg-gradient-to-br from-indigo-500/5 to-indigo-500/5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-white border p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center">
              <FaBookOpen className="text-blue-600 text-sm" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-blue-600 leading-none">
                {pct(baseStats.promedioIcfes)}
              </div>
              <div className="text-gray-600 text-xs">Promedio actual</div>
            </div>
          </div>

          <div className="rounded-lg bg-white border p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-green-50 flex items-center justify-center">
              {baseStats.mejoraMes >= 0 ? (
                <FaArrowUp className="text-green-600 text-sm" />
              ) : (
                <FaArrowDown className="text-red-600 text-sm" />
              )}
            </div>
            <div>
              <div
                className={`text-2xl font-extrabold leading-none ${
                  baseStats.mejoraMes >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {pct(baseStats.mejoraMes)}
              </div>
              <div className="text-gray-600 text-xs">Mejora del mes</div>
            </div>
          </div>

          <div className="rounded-lg bg-white border p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-sky-50 flex items-center justify-center">
              <FaUsers className="text-sky-600 text-sm" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-sky-600 leading-none">
                {baseStats.participantes}
              </div>
              <div className="text-gray-600 text-xs">Estudiantes participando</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparativo por Cursos */}
      <div className="rounded-xl p-4 border bg-gradient-to-br from-violet-500/5 to-violet-500/5 mb-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Comparativo por Cursos</h3>

        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="w-full">
            <thead className="text-left text-gray-500 text-xs border-b">
              <tr>
                <th className="py-2.5 px-3">Curso</th>
                <th className="py-2.5 px-3">Nº Estudiantes</th>
                <th className="py-2.5 px-3">Promedio del Curso</th>
                <th className="py-2.5 px-3">Progreso (%)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {baseCursos.map((r, i) => (
                <tr key={`${r.grado}-${r.curso}-${i}`} className="border-b last:border-b-0">
                  <td className="py-2.5 px-3 font-semibold text-gray-800">
                    {r.grado}°{r.curso}
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">{r.estudiantes}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600 font-semibold">{pct(r.promedio)}</span>
                      <div className="flex-1 max-w-[200px]">{barra(r.promedio, "#2563eb")}</div>
                    </div>
                  </td>
                  <td className={`py-2.5 px-3 font-semibold ${progresoColor(r.progresoPct)}`}>
                    <span className="inline-flex items-center gap-1">
                      {r.progresoPct > 0 ? (
                        <FaArrowUp className="inline text-xs" />
                      ) : r.progresoPct < 0 ? (
                        <FaArrowDown className="inline text-xs" />
                      ) : null}
                      {r.progresoPct > 0 ? `+${r.progresoPct}%` : `${r.progresoPct}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Áreas que necesitan refuerzo */}
      <div className="rounded-xl p-4 border bg-gradient-to-br from-rose-500/5 to-rose-500/5 mb-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center">
            <FaExclamationTriangle className="text-rose-600 text-base" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Áreas que Necesitan Refuerzo</h3>
        </div>

        {refuerzos.length === 0 ? (
          <div className="text-xs text-gray-500">No hay áreas con necesidad de refuerzo actualmente.</div>
        ) : (
          <div className="space-y-4">
            {refuerzos.map((a) => {
              const color = colorDe(a.area);
              return (
                <div key={a.area}>
                  <div className="flex items-baseline justify-between mb-0.5">
                    <div className="font-medium text-gray-800">
                      {a.area}
                      {a.detalle ? <span className="text-gray-500 font-normal"> — {a.detalle}</span> : null}
                    </div>
                    <div className="text-xs font-semibold" style={{ color }}>
                      {pct(a.porcentaje)}
                    </div>
                  </div>
                  {barra(a.porcentaje, color)}
                  {a.subtitulo && <div className="text-[11px] text-gray-500 mt-1">{a.subtitulo}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Estudiantes que requieren atención */}
      <div className="rounded-xl p-4 border bg-gradient-to-br from-amber-500/5 to-amber-500/5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <FaBullseye className="text-amber-600 text-base" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Estudiantes que Requieren Atención</h3>
        </div>

        {baseAtencion.length === 0 ? (
          <div className="text-xs text-gray-500">No hay estudiantes con alertas actualmente.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg border">
            <table className="w-full">
              <thead className="text-left text-gray-500 text-xs border-b">
                <tr>
                  <th className="py-2.5 px-3">Estudiante</th>
                  <th className="py-2.5 px-3">Curso</th>
                  <th className="py-2.5 px-3">Área Débil</th>
                  <th className="py-2.5 px-3">Puntaje</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {baseAtencion.map((r, i) => (
                  <tr key={`${r.estudiante}-${i}`} className="border-b last:border-b-0">
                    <td className="py-2.5 px-3 text-gray-800">{r.estudiante}</td>
                    <td className="py-2.5 px-3 text-gray-700">{r.curso}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-rose-100 text-rose-700">
                        {r.areaDebil}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-red-600 font-semibold">{r.puntaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seguimiento;
