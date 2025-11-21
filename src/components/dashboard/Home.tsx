// src/components/dashboard/Home.tsx
import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

// componentes
import StatsIslas from "@/components/shared/Islas";
import ProgresoPorArea from "@/components/shared/ProgresoPorArea";
import RendimientoPorArea from "@/components/shared/RendimientoPorArea";

// tipos
import type { IslaItem } from "@/components/shared/Islas";
import type { PuntoMes } from "@/components/shared/ProgresoPorArea";
import type { RendItem } from "@/components/shared/RendimientoPorArea";

/* ================== API base y helpers ================== */

const RAW_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  "https://gillian-semiluminous-blubberingly.ngrok-free.dev/";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

const authHeaders = () => {
  const t = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};

const getJSON = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

/* ================== Normalización de áreas ================== */

const strip = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const canon = (
  raw: string
): "matematicas" | "lenguaje" | "ciencias" | "sociales" | "ingles" | null => {
  const t = strip(String(raw || ""));
  if (!t) return null;
  if (t.startsWith("mate")) return "matematicas";
  if (t.startsWith("leng") || t.startsWith("lect")) return "lenguaje";
  if (t.startsWith("cien")) return "ciencias";
  if (t.startsWith("soci") || t.includes("socilaes")) return "sociales";
  if (t.startsWith("ing")) return "ingles";
  return null;
};

// Nombres mostrados en tarjetas
const LABEL_STATS: Record<
  "matematicas" | "lenguaje" | "ciencias" | "sociales" | "ingles",
  string
> = {
  lenguaje: "Lectura Crítica",
  matematicas: "Matemáticas",
  sociales: "Sociales y Ciudadanas",
  ciencias: "Ciencias Naturales",
  ingles: "Inglés",
};

const COLOR_STATS: Record<string, string> = {
  "Lectura Crítica": "#3b82f6",
  Matemáticas: "#ef4444",
  "Sociales y Ciudadanas": "#f59e0b",
  "Ciencias Naturales": "#10b981",
  Inglés: "#8b5cf6",
};

type SerieKey = keyof PuntoMes;

const KEY_SERIE: Record<
  "matematicas" | "lenguaje" | "ciencias" | "sociales" | "ingles",
  SerieKey
> = {
  lenguaje: "Lectera Critica",
  matematicas: "Matematicas",
  sociales: "Sociales y Ciudadanas",
  ciencias: "Ciencias Naturales",
  ingles: "Ingles",
};

const toSerieKey = (rawArea: string): SerieKey | null => {
  const c = canon(rawArea);
  if (c) return KEY_SERIE[c];

  const t = strip(rawArea);
  if (t.includes("lect") || t.startsWith("leng")) return "Lectera Critica";
  if (t.startsWith("mate")) return "Matematicas";
  if (t.startsWith("cien")) return "Ciencias Naturales";
  if (t.startsWith("soci") || t.includes("socilaes")) return "Sociales y Ciudadanas";
  if (t.startsWith("ing")) return "Ingles";
  return null;
};

const ORDER_REND: SerieKey[] = [
  "Lectera Critica",
  "Matematicas",
  "Sociales y Ciudadanas",
  "Ciencias Naturales",
  "Ingles",
];

/* ============ Etiquetas de mes: 2025-septiembre ============ */
const MESES_ES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre"
];

const mesLabelES = (raw: string) => {
  // espera "YYYY-MM"; si no viene así, deja el valor original
  const m = String(raw || "").match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return raw;
  const y = m[1];
  const mm = Math.max(1, Math.min(12, Number(m[2])));
  return `${y}-${MESES_ES[mm - 1]}`;
};

/* ================== Tipos de respuesta API ================== */

type AreasActivosResp = { islas: { area: string; activos: number }[] };
type SeriesResp = {
  series: { mes: string; area: string; valor?: number; promedio?: number }[];
};
type RendResp = { items: { area: string; promedio: number }[] };

/* ================== Componente ================== */

const Inicio: React.FC = () => {
  const [islas, setIslas] = useState<IslaItem[]>([]);
  const [serie, setSerie] = useState<PuntoMes[]>([]);
  const [rend, setRend] = useState<RendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      try {
        // Solo mostrar loading en la primera carga
        if (initialLoad) {
          setLoading(true);
        }
        /* ===== 1) Activos por área → StatsIslas ===== */
        const islasRes = await getJSON<AreasActivosResp>(
          `${API_BASE}/web/seguimiento/areas/activos`
        );

        const mapIslas = new Map<string, number>();
        for (const it of islasRes?.islas ?? []) {
          const c = canon(it.area);
          if (!c) continue;
          const nombre = LABEL_STATS[c];
          mapIslas.set(nombre, Number(it.activos ?? 0));
        }

        const islasData: IslaItem[] = (
          [
            LABEL_STATS.lenguaje,
            LABEL_STATS.matematicas,
            LABEL_STATS.sociales,
            LABEL_STATS.ciencias,
            LABEL_STATS.ingles,
          ] as string[]
        ).map((nombre) => ({
          color: COLOR_STATS[nombre],
          nombre,
          total: Number(mapIslas.get(nombre) ?? 0),
          subtitulo: "", // ← quitamos “estudiantes activos”
        }));
        if (!cancelled) setIslas(islasData);

        /* ===== 2) Serie Progreso por área ===== */
        const serieRes = await getJSON<SeriesResp>(
          `${API_BASE}/web/seguimiento/series/progreso-por-area?meses=6`
        );

        const byMes = new Map<string, PuntoMes>();
        for (const p of serieRes?.series ?? []) {
          const mes = String(p.mes ?? "");
          const key = toSerieKey(p.area);
          if (!mes || !key) continue;

          const val = Number(p.valor ?? p.promedio ?? 0);
          if (!byMes.has(mes)) {
            byMes.set(mes, {
              mes,
              "Lectera Critica": 0,
              Matematicas: 0,
              "Sociales y Ciudadanas": 0,
              "Ciencias Naturales": 0,
              Ingles: 0,
            });
          }
          (byMes.get(mes)! as any)[key] = val;
        }

        const serieOrdered = Array.from(byMes.values())
          .sort((a, b) => String(a.mes).localeCompare(String(b.mes)))
          // formateo a “YYYY-mes” en español
          .map((p) => ({ ...p, mes: mesLabelES(p.mes) }));

        if (!cancelled) setSerie(serieOrdered);

        /* ===== 3) Rendimiento por área ===== */
        const rendRes = await getJSON<RendResp>(
          `${API_BASE}/web/seguimiento/rendimiento-por-area`
        );

        const mapRend = new Map<keyof PuntoMes, number>();
        for (const it of rendRes?.items ?? []) {
          const key = toSerieKey(it.area);
          if (!key) continue;
          mapRend.set(key, Number(it.promedio ?? 0));
        }

        const rendData: RendItem[] = ORDER_REND.map((nombre) => ({
          nombre,
          valor: Number(mapRend.get(nombre) ?? 0),
        }));
        if (!cancelled) setRend(rendData);
        
        if (initialLoad) {
          setLoading(false);
          setInitialLoad(false);
        }
      } catch (e) {
        console.error("[Inicio] Error cargando datos:", e);
        if (!cancelled) {
          // Solo limpiar en primera carga, mantener datos anteriores en actualizaciones
          if (initialLoad) {
            setIslas([]);
            setSerie([]);
            setRend([]);
          }
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    loadAll();
    // Actualizar cada 30 segundos en segundo plano
    const int = setInterval(() => {
      if (document.visibilityState === "visible") loadAll();
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(int);
    };
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-6">
          {/* Skeleton para tarjetas de islas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          
          {/* Skeleton para gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Indicador central */}
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mr-3" />
            <span className="text-gray-600 font-medium">Cargando dashboard...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <StatsIslas data={islas} />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <ProgresoPorArea data={serie} />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <RendimientoPorArea data={rend} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Inicio;
