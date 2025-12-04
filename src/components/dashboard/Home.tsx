// src/components/dashboard/Home.tsx
import React, { useEffect, useState } from "react";
import { getJSON } from "@/utils/api";
import { FaSpinner } from "react-icons/fa";

// componentes
import StatsIslas from "@/components/shared/Islas";
import ProgresoPorArea from "@/components/shared/ProgresoPorArea";
import RendimientoPorArea from "@/components/shared/RendimientoPorArea";
import { normalizeArea, AREAS_ORDER, AREA_COLORS, AREA_LABELS } from '@/utils/areas';
import type { AreaKey } from '@/utils/areas';

// tipos
import type { IslaItem } from "@/components/shared/Islas";
import type { PuntoMes } from "@/components/shared/ProgresoPorArea";
import type { RendItem } from "@/components/shared/RendimientoPorArea";

type AreasActivosResp = { islas: { area: string; activos: number }[] };
type SeriesResp = { series: { mes: string; area: string; valor?: number; promedio?: number }[] };
type RendResp = { items: { area: string; promedio: number }[] };

const MESES_ES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre"
];
const mesLabelES = (raw: string) => {
  const m = String(raw || "").match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return raw;
  const y = m[1];
  const mm = Math.max(1, Math.min(12, Number(m[2])));
  return `${y}-${MESES_ES[mm - 1]}`;
};

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
        if (initialLoad) setLoading(true);

        // Activos por área → Islas
        const islasRes = await getJSON<AreasActivosResp>('/web/seguimiento/areas/activos');
        console.debug('[Home] /web/seguimiento/areas/activos ->', islasRes);
        const mapIslas = new Map<string, number>();
        for (const it of islasRes?.islas ?? []) {
          const key = normalizeArea(it.area);
          if (!key) continue;
          const label = AREA_LABELS[key] ?? key;
          mapIslas.set(label, Number(it.activos ?? 0));
        }

        const islasData: IslaItem[] = AREAS_ORDER.map((k) => ({
          color: AREA_COLORS[k],
          nombre: AREA_LABELS[k] ?? k,
          total: Number(mapIslas.get(AREA_LABELS[k] ?? k) ?? 0),
          subtitulo: '',
        }));
        if (!cancelled) setIslas(islasData);

        // Serie progreso por área
        const serieRes = await getJSON<SeriesResp>('/web/seguimiento/series/progreso-por-area?meses=6');
        console.debug('[Home] /web/seguimiento/series/progreso-por-area ->', serieRes);
        const byMes = new Map<string, any>();
        for (const p of serieRes?.series ?? []) {
          const mes = String(p.mes ?? '');
          const key = normalizeArea(p.area) as AreaKey | null;
          if (!mes || !key) continue;

          const val = Number(p.valor ?? p.promedio ?? 0);
          if (!byMes.has(mes)) {
            const empty: any = { mes };
            for (const k of AREAS_ORDER) empty[k] = 0;
            byMes.set(mes, empty);
          }
          (byMes.get(mes) as any)[key] = val;
        }

        const serieOrdered = Array.from(byMes.values())
          .sort((a, b) => String(a.mes).localeCompare(String(b.mes)))
          .map((p: any) => ({ ...p, mes: mesLabelES(p.mes) }));
        if (!cancelled) setSerie(serieOrdered as PuntoMes[]);

        // Rendimiento por área
        const rendRes = await getJSON<RendResp>('/web/seguimiento/rendimiento-por-area');
        console.debug('[Home] /web/seguimiento/rendimiento-por-area ->', rendRes);
        const mapRend = new Map<AreaKey, number>();
        for (const it of rendRes?.items ?? []) {
          const key = normalizeArea(it.area);
          if (!key) continue;
          mapRend.set(key, Number(it.promedio ?? 0));
        }
        console.debug('[Home] mapRend entries ->', Array.from(mapRend.entries()));

        const rendData: RendItem[] = AREAS_ORDER.map((k) => ({ nombre: k, valor: Number(mapRend.get(k) ?? 0) }));
        if (!cancelled) setRend(rendData);

        if (initialLoad) {
          setLoading(false);
          setInitialLoad(false);
        }
      } catch (e) {
        console.error('[Inicio] Error cargando datos:', e);
        if (!cancelled) {
          if (initialLoad) { setIslas([]); setSerie([]); setRend([]); }
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    loadAll();
    const int = setInterval(() => { if (document.visibilityState === 'visible') loadAll(); }, 30_000);
    return () => { cancelled = true; clearInterval(int); };
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mr-3" />
            <span className="text-gray-600 font-medium">Cargando dashboard...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <StatsIslas data={islas} />
          </div>

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
