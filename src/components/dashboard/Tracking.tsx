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
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaTimesCircle,
  FaCalculator,
  FaGlobe,
  FaLeaf,
  FaComments,
} from "react-icons/fa";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

/* ===== API ===== */
const RAW_BASE =
  (import.meta as any).env?.VITE_API_URL;

if (!RAW_BASE) {
  console.error('❌ VITE_API_URL no configurada');
  throw new Error('Missing VITE_API_URL environment variable');
}

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
  progreso_pct?: number;
};

type EstudianteDetalle = {
  nombre: string;
  curso: string;
  estado: 'Activo' | 'Inactivo';
  promedio: number;
  variacion: number;
  ultimaActividad: string;
  correo?: string;
  telefono?: string;
  documento?: string;
  materiasCriticas?: Array<{
    materia: string;
    subtema?: string | null;
    puntaje: number;
    variacion: number;
    porcentaje: number;
  }>;
};
type AreaNombre =
  | "Lectera Critica"
  | "Lectura Crítica"
  | "Matematicas"
  | "Sociales y Ciudadanas"
  | "Ciencias Naturales"
  | "Ingles";

type Refuerzo = {
  area: AreaNombre;
  porcentaje: number;
  detalle?: string;
  subtitulo?: string;
  nivel?: number;
  subtema?: string;
};
type NivelDetalle = {
  nivel: number;
  subtema: string | null;
  con_dificultad: number;
  total: number;
  porcentaje: number;
};
type AreaDetalle = {
  area: AreaNombre;
  niveles_criticos: number;
  niveles: NivelDetalle[];
};
type AtencionRow = {
  id_usuario?: number;
  estudiante: string;
  curso: string;
  grado_curso?: string;
  telefono?: string | null;
  correo?: string | null;
  documento?: string | null;
  areaDebil: AreaNombre;
  puntaje: number;
  ultima_actividad?: string;
  materia_critica?: { area: AreaNombre | string; subtema: string | null; porcentaje?: number };
};

/* ===== Endpoints web backend ===== */
const URL_KPIS = `${API_BASE}/web/seguimiento/resumen`;
const URL_CURSOS = `${API_BASE}/web/seguimiento/cursos`;
const URL_REFUER = `${API_BASE}/web/seguimiento/areas-refuerzo?umbral=60`;
const URL_REFUER_DET = `${API_BASE}/web/seguimiento/areas-refuerzo-detalle?umbral_puntaje=60&min_porcentaje=60`;
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
  if (s.includes("lect") || s.includes("lenguaj")) return "Lectura Crítica";
  return (a as AreaNombre) || "Lectura Crítica";
};

const parseCursosItems = (raw: any): CursoRow[] => {
  const list: any[] = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
  return list.map((it) => {
    const label = String(it?.curso ?? "");
    const m = label.toUpperCase().match(/(10|11)\D*([ABC])/);
    const grado = (m ? Number(m[1]) : 10) as 10 | 11;
    const curso = (m ? (m[2] as "A" | "B" | "C") : "A");
    // Usar progreso_pct del backend si existe, sino usar progreso o progresoPct
    const progresoPct = Math.round(Number(it?.progreso_pct ?? it?.progreso ?? it?.progresoPct ?? 0));
    return {
      grado,
      curso,
      estudiantes: Number(it?.estudiantes ?? 0),
      promedio: Math.round(Number(it?.promedio ?? 0)),
      progresoPct,
      progreso_pct: progresoPct,
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
    nivel: a?.nivel != null ? Number(a?.nivel) : undefined,
    subtema: a?.subtema ?? undefined,
  }));
};

const parseAlerta = (raw: any): AtencionRow[] => {
  const list: any[] = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
  return list.map((x) => {
    const nombre = String(x?.nombre ?? x?.estudiante ?? "").trim();
    const curso = String(x?.curso ?? "").trim();
    const area = uiAreaFromBackend(x?.area_debil ?? x?.areaDebil ?? "Lectera Critica");
    const puntaje = Math.round(Number(x?.promedio ?? x?.puntaje ?? 0));
    const ultimaActividad = x?.ultima_actividad ?? x?.ultima_actividad_at ?? x?.last_activity ?? null;
    const materiaCrit = x?.materia_critica ? { area: uiAreaFromBackend(x?.materia_critica?.area), subtema: x?.materia_critica?.subtema ?? null, porcentaje: Number(x?.materia_critica?.porcentaje ?? 0) } : undefined;
    
    // Formatear fecha si existe
    let fechaFormateada = "";
    if (ultimaActividad) {
      try {
        const date = new Date(ultimaActividad);
        fechaFormateada = date.toISOString().split('T')[0];
      } catch {}
    }
    
    return {
      id_usuario: Number(x?.id_usuario ?? x?.usuario_id ?? 0) || undefined,
      estudiante: nombre || "—",
      curso: curso || "—",
      grado_curso: x?.grado_curso ?? undefined,
      telefono: x?.telefono ?? null,
      correo: x?.correo ?? null,
      documento: x?.documento ?? null,
      areaDebil: area,
      puntaje,
      ultima_actividad: fechaFormateada || undefined,
      materia_critica: materiaCrit,
    };
  });
};

/* ===== Componente ===== */
const Seguimiento: React.FC = () => {
  const [institucion, setInstitucion] = useState<string>("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [cursos, setCursos] = useState<CursoRow[]>([]);
  const [refuerzos, setRefuerzos] = useState<Refuerzo[]>([]);
  const [detalleRefuerzo, setDetalleRefuerzo] = useState<AreaDetalle[]>([]);
  const [openAreas, setOpenAreas] = useState<Record<string, boolean>>({});
  const [atencion, setAtencion] = useState<AtencionRow[]>([]);
  const [modalArea, setModalArea] = useState<{ area: string; color: string; niveles: any[] } | null>(null);
  
  // Estado para el detalle del estudiante
  const [detalleEstudiante, setDetalleEstudiante] = useState<EstudianteDetalle | null>(null);

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
        try {
          const det = await getJSON<{ areas: any[] }>(URL_REFUER_DET);
          const ordered = (det?.areas || []).map((a: any) => ({
            area: uiAreaFromBackend(a?.area) as AreaNombre,
            niveles_criticos: Number(a?.niveles_criticos ?? 0),
            niveles: Array.isArray(a?.niveles)
              ? a.niveles.map((n: any) => ({
                  nivel: Number(n?.nivel ?? 0),
                  subtema: n?.subtema ?? null,
                  con_dificultad: Number(n?.con_dificultad ?? 0),
                  total: Number(n?.total ?? 0),
                  porcentaje: Number(n?.porcentaje ?? 0),
                }))
              : [],
          }));
          setDetalleRefuerzo(ordered as any);
        } catch {}
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
    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
    </div>
  );

  const colorDe = (area: AreaNombre | string) => {
    const s = String(area || "").toLowerCase();
    if (s.includes("lectura") || s.includes("lectera")) return "#3b82f6"; // Azul
    if (s.includes("matema")) return "#ef4444"; // Rojo
    if (s.includes("social")) return "#f59e0b"; // Naranja
    if (s.includes("ciencia")) return "#10b981"; // Verde
    if (s.includes("ingl")) return "#8b5cf6"; // Morado
    return "#3b82f6"; // Default azul
  };

  // Color HEX para PDFs según el área
  const colorHex = (area: string) => {
    const s = String(area || '').toLowerCase();
    if (s.includes('lect')) return '#3b82f6';
    if (s.includes('mate')) return '#ef4444';
    if (s.includes('social')) return '#f59e0b';
    if (s.includes('ciencia')) return '#10b981';
    if (s.includes('ingl')) return '#8b5cf6';
    return '#3b82f6';
  };

  const getIcon = (area: string) => {
    const n = area.toLowerCase();
    if (n.includes("lect")) return <FaBookOpen className="text-white text-sm" />;
    if (n.includes("mate")) return <FaCalculator className="text-white text-sm" />;
    if (n.includes("social")) return <FaGlobe className="text-white text-sm" />;
    if (n.includes("ciencia")) return <FaLeaf className="text-white text-sm" />;
    if (n.includes("ingl")) return <FaComments className="text-white text-sm" />;
    return <FaBookOpen className="text-white text-sm" />;
  };

  const pct = (n: number) => `${Math.round(n)}%`;

  // Impresión/Descarga PDF (abre una ventana con solo el contenido y manda imprimir)
  const imprimirElemento = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Reporte</title>
      <style>
        *{box-sizing:border-box} body{font-family:ui-sans-serif,system-ui;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:16px;color:#111827}
        h2{font-size:18px;margin:0 0 12px 0}
        .card{border:1px solid #e5e7eb;border-radius:10px;margin-bottom:14px;overflow:hidden}
        .card-hd{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb}
        .title{font-weight:700}
        .muted{color:#6b7280;font-size:12px}
        .row{display:flex;gap:12px;padding:12px}
        .col{flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:10px;background:#fafafa}
        .col h4{margin:0 0 6px 0;font-size:13px}
        .kv{display:flex;gap:8px;align-items:center;font-size:12px;margin:3px 0}
        .icon-box{width:20px;height:20px;border-radius:4px;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .right{text-align:right}
        .kpi{font-weight:800;color:#16a34a;font-size:20px}
        .badge{font-size:11px;border-radius:999px;padding:2px 8px;background:#dcfce7;color:#166534}
        .bar{width:100%;height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;position:relative}
        .bar > span{display:block;height:100%;border-radius:999px}
      </style>
    </head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const imprimirHTML = (inner: string) => {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Reporte</title>
      <style>
        *{box-sizing:border-box} body{font-family:ui-sans-serif,system-ui;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:16px;color:#111827}
        .card{border:1px solid #e5e7eb;border-radius:10px;margin-bottom:14px;overflow:hidden}
        .card-hd{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb}
        .title{font-weight:700}
        .muted{color:#6b7280;font-size:12px}
        .row{display:flex;gap:12px;padding:12px}
        .col{flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:10px;background:#fafafa}
        .col h4{margin:0 0 6px 0;font-size:13px}
        .kv{display:flex;gap:8px;align-items:center;font-size:12px;margin:3px 0}
        .icon-box{width:20px;height:20px;border-radius:4px;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .right{text-align:right}
        .kpi{font-weight:800;color:#16a34a;font-size:20px}
        .badge{font-size:11px;border-radius:999px;padding:2px 8px;background:#dcfce7;color:#166534}
        .bar{width:100%;height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden}
        .bar > span{display:block;height:100%;border-radius:999px}
      </style>
    </head><body>${inner}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const imprimirDetalle = () => {
    if (!detalleEstudiante) return;
    const m = (detalleEstudiante.materiasCriticas || []).map((x) => ({
      materia: x.materia,
      subtema: x.subtema || null,
      porcentaje: x.porcentaje || 0,
    }));
    const inner = `
      <div class="card">
        <div class="card-hd">
          <div>
            <div class="title">${detalleEstudiante.nombre}</div>
            <div class="muted">Curso: ${detalleEstudiante.curso || '—'}</div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h4>Información Personal</h4>
            ${detalleEstudiante.curso ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"/><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"/></svg></div><span>Curso: ${detalleEstudiante.curso}</span></div>` : ''}
            ${detalleEstudiante.documento ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></svg></div><span>Documento: ${detalleEstudiante.documento}</span></div>` : ''}
            ${detalleEstudiante.correo ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"m3 5 9 7 9-7\"/></svg></div><span>${detalleEstudiante.correo}</span></div>` : ''}
            ${detalleEstudiante.telefono ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg></div><span>${detalleEstudiante.telefono}</span></div>` : ''}
            ${detalleEstudiante.ultimaActividad ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"/><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"/><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"/></svg></div><span>Última actividad: ${detalleEstudiante.ultimaActividad}</span></div>` : ''}
          </div>
          <div class="col">
            <h4>Materias Críticas</h4>
            ${m.length ? m.map(v => {
                const col = colorHex(v.materia);
                const promedioBarra = Math.max(0, Math.min(100, Math.round(detalleEstudiante.promedio)));
                return `
                  <div class=\"kv\" style=\"margin-top:6px\"><strong>${v.materia}</strong>${v.subtema ? ' — ' + v.subtema : ''}</div>
                  <div style=\"text-align:right;color:#ef4444;font-weight:600;font-size:12px;margin-top:8px\">${promedioBarra}%</div>
                  <div class=\"bar\" style=\"margin-top:12px;margin-bottom:8px\"><span style=\"width:${promedioBarra}%;background-color:${col};height:100%\"></span></div>
                `;
              }).join('') : '<div class=\"muted\">Sin datos</div>'}
          </div>
        </div>
      </div>
    `;
    imprimirHTML(inner);
  };

  const imprimirListado = () => {
    const contenido = document.getElementById('print-listado');
    if (contenido) return imprimirElemento('print-listado');
    const wrapper = document.createElement('div');
    wrapper.id = 'print-listado';
    const html = [
      '<h2>Estudiantes que requieren atención</h2>',
      ...baseAtencion.map((e) => {
        const header = `
          <div class=\"card-hd\">
            <div>
              <div class=\"title\">${e.estudiante}</div>
              <div class=\"muted\">Curso: ${e.grado_curso || e.curso || '—'}</div>
            </div>
          </div>`;
        const colLeft = `
          <div class=\"col\">
            <h4>Información Personal</h4>
            ${e.grado_curso || e.curso ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"/><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"/></svg></div><span>Curso: ${e.grado_curso || e.curso}</span></div>` : ''}
            ${e.documento ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></svg></div><span>Documento: ${e.documento}</span></div>` : ''}
            ${e.correo ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"m3 5 9 7 9-7\"/></svg></div><span>${e.correo}</span></div>` : ''}
            ${e.telefono ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg></div><span>${e.telefono}</span></div>` : ''}
            ${e.ultima_actividad ? `<div class=\"kv\"><div class=\"icon-box\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"/><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"/><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"/></svg></div><span>Última actividad: ${e.ultima_actividad}</span></div>` : ''}
          </div>`;
        const colRight = `
          <div class=\"col\">
            <h4>Materias Críticas</h4>
            ${e.materia_critica ? (() => {
                const promedioBarra = Math.max(0, Math.min(100, Math.round(e.puntaje)));
                const col = `${colorHex(e.materia_critica.area as string)}`;
                return `
                  <div class=\\"kv\\" style=\\"margin-top:6px\\"><strong>${e.materia_critica.area}</strong>${e.materia_critica.subtema ? ' — ' + e.materia_critica.subtema : ''}</div>
                  <div style=\\"text-align:right;color:#ef4444;font-weight:600;font-size:12px;margin-top:2px\\">${promedioBarra}%</div>
                  <div class=\\"bar\\" style=\\"margin-top:18px;margin-bottom:8px;width:100%;height:8px;background-color:#e5e7eb;border-radius:999px;overflow:hidden\\"><span style=\\"width:${promedioBarra}%;background-color:${col};height:100%;display:block;border-radius:999px;min-width:2px\\"></span></div>
                `;
              })() : '<div class=\"muted\">Sin datos</div>'}
          </div>`;
        return `<div class=\"card\">${header}<div class=\"row\">${colLeft}${colRight}</div></div>`;
      })
    ].join('');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);
    imprimirElemento('print-listado');
    document.body.removeChild(wrapper);
  };

  /* ===== Handlers ===== */
  const verDetalle = (estudiante: AtencionRow) => {
    setDetalleEstudiante({
      nombre: estudiante.estudiante,
      curso: estudiante.grado_curso || estudiante.curso,
      estado: 'Activo',
      promedio: estudiante.puntaje,
      variacion: 0,
      ultimaActividad: estudiante.ultima_actividad || '',
      correo: estudiante.correo || undefined,
      telefono: estudiante.telefono || undefined,
      documento: estudiante.documento || undefined,
      materiasCriticas: estudiante.materia_critica ? [
        { materia: String(estudiante.materia_critica.area), subtema: estudiante.materia_critica.subtema || null, puntaje: estudiante.puntaje, variacion: 0, porcentaje: Math.max(0, Math.min(100, estudiante.materia_critica.porcentaje || 0)) }
      ] : undefined,
    });
  };

  const ocultarDetalle = () => {
    setDetalleEstudiante(null);
  };

  /* ===== Render ===== */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaChartLine className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 leading-none">{pct(baseStats.promedioIcfes)}</p>
              <p className="text-xs text-gray-600 mt-1">Promedio actual</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              {baseStats.mejoraMes >= 0 ? (
                <FaArrowUp className="text-green-600" />
              ) : (
                <FaArrowDown className="text-red-600" />
              )}
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none ${baseStats.mejoraMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pct(baseStats.mejoraMes)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Mejora del mes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <FaBullseye className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{baseAtencion.length}</p>
              <p className="text-xs text-gray-600 mt-1">Estudiantes que requieren atención</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="space-y-6">

        {/* Comparative by Courses */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Comparativo por Cursos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-gray-600 text-xs">
                  <th className="text-left py-3 px-4">Curso</th>
                  <th className="text-left py-3 px-4">N° Estudiantes</th>
                  <th className="text-left py-3 px-4">Promedio del Curso</th>
                  <th className="text-left py-3 px-4">Progreso (%)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {baseCursos
                  .filter(r => r.promedio > 0) // Solo cursos que ya comenzaron a tener datos
                  .map((r, i) => (
                  <tr key={`${r.grado}-${r.curso}-${i}`} className="border-b last:border-b-0">
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {r.grado}°{r.curso}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{r.estudiantes}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 font-semibold w-12">{pct(r.promedio)}</span>
                        <div className="flex-1 max-w-[200px]">{barra(r.promedio, "#2563eb")}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${r.progresoPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pct(r.promedio)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Requiring Attention */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">Estudiantes que requieren atención</h3>
            <button onClick={() => imprimirListado()} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 transition-colors">
              <span>Generar PDF</span>
            </button>
          </div>
          <div className="space-y-3">
            {baseAtencion.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay estudiantes que requieran atención actualmente
              </div>
            ) : (
              baseAtencion.map((est, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{est.estudiante}</p>
                      <p className="text-xs text-gray-600">
                        Última actividad: {est.ultima_actividad || 'No disponible'}
                      </p>
                    </div>
                    <button 
                      onClick={() => verDetalle(est)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                    >
                      Ver detalles <IoChevronDown />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Areas Needing Reinforcement - Detalle por niveles */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationTriangle className="text-red-600 text-sm" />
            <h3 className="text-base font-semibold text-gray-800">Áreas que Necesitan Refuerzo</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {detalleRefuerzo.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay áreas con niveles críticos actualmente.</p>
            ) : (
              detalleRefuerzo
                .sort((a, b) => {
                  const order = ['Lectura Crítica', 'Matematicas', 'Sociales y Ciudadanas', 'Ciencias Naturales', 'Ingles'];
                  return order.indexOf(a.area) - order.indexOf(b.area);
                })
                .map((area) => {
                  const color = colorDe(area.area);
                  const nivelesOrdenados = [...area.niveles].sort((a, b) => b.porcentaje - a.porcentaje);
                  const top = nivelesOrdenados[0];
                  const restantes = Math.max(0, (area.niveles || []).length - 1);
                  const isOpen = !!openAreas[area.area];
                  return (
                    <div key={area.area} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="px-4 py-5" style={{ background: `${color}10` }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: color }}>{getIcon(area.area)}</div>
                        <div className="text-center font-semibold text-gray-900">{area.area}</div>
                      </div>
                      <div className="px-4 py-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-800">{top ? `Nivel ${top.nivel}` : '—'}</div>
                          <div className="text-sm font-semibold text-red-500">{top ? `${top.porcentaje}%` : '0%'}</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{top?.subtema || '—'}</div>
                        <div className="text-[11px] text-gray-500">{top ? `${top.con_dificultad} de ${top.total} estudiantes` : ''}</div>
                        {top && <div className="mt-2">{barra(top.porcentaje, color)}</div>}
                        {restantes > 0 && (
                          <button type="button" className="text-[12px] text-blue-600 font-medium mt-2" onClick={() => setModalArea({ area: area.area, color, niveles: nivelesOrdenados })}>
                            +{restantes} nivel más →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

      </div>

      {/* Modal Detalle */}
      {detalleEstudiante && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h4 className="font-semibold text-gray-800">Detalle del Estudiante</h4>
              <button onClick={ocultarDetalle} className="text-gray-500 hover:text-gray-700"><FaTimesCircle /></button>
            </div>
            <div id="print-detalle" className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{detalleEstudiante.nombre}</div>
                  <div className="text-sm text-gray-600">Curso: {detalleEstudiante.curso || '—'}</div>
                </div>
                {/* Promedio general removido del header */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm font-semibold mb-2">Información Personal</div>
                  <div className="text-xs text-gray-700 space-y-1.5">
                    {detalleEstudiante?.curso && (<div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center"><FaSchool className="text-blue-500 text-xs" /></div> <span>Curso: {detalleEstudiante.curso}</span></div>)}
                    {detalleEstudiante.documento && (<div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center"><FaUser className="text-blue-500 text-xs" /></div> <span>Documento: {detalleEstudiante.documento}</span></div>)}
                    {detalleEstudiante.correo && (<div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center"><FaEnvelope className="text-blue-500 text-xs" /></div> <span>{detalleEstudiante.correo}</span></div>)}
                    {detalleEstudiante.telefono && (<div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center"><FaPhone className="text-blue-500 text-xs" /></div> <span>{detalleEstudiante.telefono}</span></div>)}
                    {detalleEstudiante.ultimaActividad && (<div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center"><FaCalendar className="text-blue-500 text-xs" /></div> <span>Última actividad: {detalleEstudiante.ultimaActividad}</span></div>)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm font-semibold mb-2">Materias Críticas</div>
                  <div className="space-y-2">
                    {detalleEstudiante.materiasCriticas?.length ? (
                      detalleEstudiante.materiasCriticas.map((m, i) => (
                        <div key={i}>
                          <div className="flex items-start justify-between text-sm">
                            <div>
                              <span className="font-medium text-gray-800">{m.materia}</span>
                              {m.subtema && <div className="text-xs text-gray-600 mt-1">{m.subtema}</div>}
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-red-600 text-right mt-2">{pct(detalleEstudiante.promedio)}</div>
                          <div className="mt-3">{barra(detalleEstudiante.promedio, colorHex(m.materia))}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500">Sin datos</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t">
              <button onClick={ocultarDetalle} className="text-gray-600 hover:text-gray-800 text-sm">Cerrar</button>
              <button onClick={() => imprimirDetalle()} className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">Descargar PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Niveles por Área */}
      {modalArea && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: `${modalArea.color}10` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: modalArea.color }}>{getIcon(modalArea.area)}</div>
                <h4 className="font-semibold text-gray-800">{modalArea.area} • Niveles</h4>
              </div>
              <button onClick={() => setModalArea(null)} className="text-gray-500 hover:text-gray-700"><FaTimesCircle /></button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto space-y-3">
              {modalArea.niveles.map((n, idx) => (
                <div key={`${modalArea.area}-${n.nivel}-${idx}`} className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-800">
                      <span className="inline-block px-2 py-0.5 text-[11px] rounded-full mr-2" style={{ background: `${modalArea.color}20`, color: modalArea.color }}>{`Nivel ${n.nivel}`}</span>
                      {n.subtema || '—'}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: modalArea.color }}>{n.porcentaje}%</div>
                  </div>
                  <div className="text-[11px] text-gray-500 mb-2">{n.con_dificultad} de {n.total} estudiantes con dificultad</div>
                  {barra(n.porcentaje, modalArea.color)}
                  {n.porcentaje >= 80 && (
                    <div className="mt-2 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1">Atención urgente: Más del 80% de estudiantes requiere refuerzo inmediato en este nivel.</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seguimiento;
