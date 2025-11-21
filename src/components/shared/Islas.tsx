import React from "react";
import { FaBookOpen, FaCalculator, FaGlobe, FaLeaf, FaComments } from "react-icons/fa";

export type IslaItem = {
  color: string;
  nombre: string;
  total: number;
  subtitulo?: string;
};

const StatsIslas: React.FC<{ data: IslaItem[] }> = ({ data }) => {
  
  // MISMO ORDEN que las áreas ICFES pedidas
  const base: IslaItem[] =
    Array.isArray(data) && data.length > 0
      ? data
      : [
          { color: "#3b82f6", nombre: "Lectura Crítica",        total: 0, subtitulo: "estudiantes activos" },
          { color: "#ef4444", nombre: "Matemáticas",            total: 0, subtitulo: "estudiantes activos" },
          { color: "#f59e0b", nombre: "Sociales y Ciudadanas",  total: 0, subtitulo: "estudiantes activos" },
          { color: "#10b981", nombre: "Ciencias Naturales",     total: 0, subtitulo: "estudiantes activos" },
          { color: "#8b5cf6", nombre: "Inglés",                 total: 0, subtitulo: "estudiantes activos" },
        ];

  // función que devuelve ícono representativo según el área
  const getIcon = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes("lect")) return <FaBookOpen className="text-xl" />;
    if (n.includes("mate")) return <FaCalculator className="text-xl" />;
    if (n.includes("social")) return <FaGlobe className="text-xl" />;
    if (n.includes("ciencia")) return <FaLeaf className="text-xl" />;
    if (n.includes("ingl")) return <FaComments className="text-xl" />;
    return <FaBookOpen className="text-xl" />; // fallback por defecto
  };

  const getBackgroundGradient = (color: string) => {
    if (color === "#3b82f6") return "bg-gradient-to-br from-blue-50 to-blue-100/50";
    if (color === "#ef4444") return "bg-gradient-to-br from-red-50 to-red-100/50";
    if (color === "#f59e0b") return "bg-gradient-to-br from-orange-50 to-orange-100/50";
    if (color === "#10b981") return "bg-gradient-to-br from-green-50 to-green-100/50";
    if (color === "#8b5cf6") return "bg-gradient-to-br from-purple-50 to-purple-100/50";
    return "bg-white";
  };

  return (
    <>
      {base.map((d) => (
        <div key={d.nombre} className={`rounded-xl p-5 shadow-sm ${getBackgroundGradient(d.color)}`}>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ background: d.color }}
          >
            {getIcon(d.nombre)}
          </div>
          <h3 className="text-[15px] font-medium text-gray-700 mt-3 mb-2">{d.nombre}</h3>
          <div className="text-[32px] font-bold text-gray-900 leading-none">{d.total}</div>
          <p className="text-xs text-gray-600 mt-1.5">{d.subtitulo ?? "estudiantes activos"}</p>
        </div>
      ))}
    </>
  );
};

export default StatsIslas;
