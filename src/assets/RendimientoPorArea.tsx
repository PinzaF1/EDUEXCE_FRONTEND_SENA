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
    <div>
      <h3 className="font-bold text-gray-800 mb-0.5 text-sm">Rendimiento por Área</h3>
      <p className="text-xs text-gray-500 mb-3">Promedio actual por área</p>

      <div className="space-y-3">
        {base.map((d) => (
          <div key={d.nombre} className="flex items-center gap-3">
            <span className="text-xs text-gray-700 flex-shrink-0" style={{ minWidth: '140px' }}>{d.nombre}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300" 
                style={{ width: `${d.valor}%`, background: COLORS[d.nombre as (typeof ORDER)[number]] }} 
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 text-right" style={{ minWidth: '28px' }}>{d.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RendimientoPorArea;
