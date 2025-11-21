// src/pages/assets/ProgresoPorArea.tsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
    <div>
      <h3 className="font-bold text-gray-800 mb-0.5 text-sm">Progreso por Área</h3>
      <p className="text-xs text-gray-500 mb-3">
        Comparación mes anterior con el mes actual
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={base} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#9ca3af" fontSize={11} />
            <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload) return null;
                return (
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>
                      {label}
                    </div>
                    {payload.map((entry, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: entry.color,
                          borderRadius: '2px'
                        }} />
                        <span>{entry.name} : {entry.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Bar dataKey="Lectera Critica" fill={COLORS["Lectera Critica"]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Matematicas" fill={COLORS.Matematicas} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Sociales y Ciudadanas" fill={COLORS["Sociales y Ciudadanas"]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Ciencias Naturales" fill={COLORS["Ciencias Naturales"]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Ingles" fill={COLORS.Ingles} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgresoPorArea;
