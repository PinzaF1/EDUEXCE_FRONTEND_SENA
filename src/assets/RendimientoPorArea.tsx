import React from "react";

// Orden fijado y colores iguales en todo
const ORDER = ["Lectera Critica", "Matematicas", "Sociales y Ciudadanas", "Ciencias Naturales", "Ingles"] as const;
const COLORS: Record<(typeof ORDER)[number], string> = {
  "Lectera Critica":       "#3b82f6",
  "Matematicas":           "#ef4444",
  "Sociales y Ciudadanas": "#f59e0b",
  "Ciencias Naturales":    "#10b981",
  "Ingles":                "#8b5cf6",
};

export type RendItem = { nombre: string; valor: number };

const RendimientoPorArea: React.FC<{ data: RendItem[] }> = ({ data }) => {
  // Normaliza y ordena; si falta un área, valor 0
  const map = new Map<string, number>(data?.map(d => [d.nombre, d.valor]));
  const base: RendItem[] = ORDER.map(n => ({
    nombre: n,
    valor: Math.max(0, Math.min(100, map.get(n) ?? 0)),
  }));

  return (
    <div className="rounded-2xl p-5 shadow-sm border bg-white">
      <h3 className="font-bold text-gray-800 mb-1">Rendimiento por Área</h3>
      <p className="text-sm text-gray-500 mb-4">Promedio actual por área</p>

      <div className="space-y-4">
        {base.map((d) => (
          <div key={d.nombre} className="flex items-center gap-3">
            <span className="w-40 text-sm text-gray-700">{d.nombre}</span>
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full" style={{ width: `${d.valor}%`, background: COLORS[d.nombre as (typeof ORDER)[number]] }} />
            </div>
            <span className="w-10 text-sm font-semibold text-gray-900 text-right">{d.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RendimientoPorArea;
