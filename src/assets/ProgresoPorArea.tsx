// src/pages/assets/ProgresoPorArea.tsx
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Colores fijos por área (orden exacto solicitado)
const COLORS = {
  "Lectera Critica": "#3b82f6",
  Matematicas: "#ef4444",
  "Sociales y Ciudadanas": "#f59e0b",
  "Ciencias Naturales": "#10b981",
  Ingles: "#8b5cf6",
};

export type PuntoMes = {
  mes: string; // ahora vendrá ya formateado por el contenedor (p.ej. "2025-septiembre")
  "Lectera Critica": number;
  Matematicas: number;
  "Sociales y Ciudadanas": number;
  "Ciencias Naturales": number;
  Ingles: number;
};

const ProgresoPorArea: React.FC<{ data: PuntoMes[] }> = ({ data }) => {
  const base: PuntoMes[] =
    Array.isArray(data) && data.length >= 2
      ? data.slice(-2)
      : [
          {
            mes: "2025-agosto",
            "Lectera Critica": 0,
            Matematicas: 0,
            "Sociales y Ciudadanas": 0,
            "Ciencias Naturales": 0,
            Ingles: 0,
          },
          {
            mes: "2025-septiembre",
            "Lectera Critica": 0,
            Matematicas: 0,
            "Sociales y Ciudadanas": 0,
            "Ciencias Naturales": 0,
            Ingles: 0,
          },
        ];

  return (
    <div className="rounded-2xl p-5 shadow-sm border bg-white">
      <h3 className="font-bold text-gray-800 mb-1">Progreso por Área </h3>
      <p className="text-sm text-gray-500 mb-3">
        Comparación mes anterior con el mes actual
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={base} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="Lectera Critica"
              stroke={COLORS["Lectera Critica"]}
              fill={`${COLORS["Lectera Critica"]}33`}
            />
            <Area
              type="monotone"
              dataKey="Matematicas"
              stroke={COLORS.Matematicas}
              fill={`${COLORS.Matematicas}33`}
            />
            <Area
              type="monotone"
              dataKey="Sociales y Ciudadanas"
              stroke={COLORS["Sociales y Ciudadanas"]}
              fill={`${COLORS["Sociales y Ciudadanas"]}33`}
            />
            <Area
              type="monotone"
              dataKey="Ciencias Naturales"
              stroke={COLORS["Ciencias Naturales"]}
              fill={`${COLORS["Ciencias Naturales"]}33`}
            />
            <Area
              type="monotone"
              dataKey="Ingles"
              stroke={COLORS.Ingles}
              fill={`${COLORS.Ingles}33`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgresoPorArea;
