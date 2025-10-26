import React from "react";
import { FaBookOpen, FaCalculator, FaUsers, FaFlask, FaGlobeAmericas } from "react-icons/fa";

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
          { color: "#3b83f6c3", nombre: "Lectura Crítica",        total: 0, subtitulo: "estudiantes activos" },
          { color: "#ef4444b9", nombre: "Matemáticas",            total: 0, subtitulo: "estudiantes activos" },
          { color: "#f59f0bb8", nombre: "Sociales y Ciudadanas",  total: 0, subtitulo: "estudiantes activos" },
          { color: "#0fac78b5", nombre: "Ciencias Naturales",     total: 0, subtitulo: "estudiantes activos" },
          { color: "#a17ef4ff", nombre: "Inglés",                 total: 0, subtitulo: "estudiantes activos" },
        ];

  // función que devuelve ícono representativo según el área
  const getIcon = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes("lect")) return <FaBookOpen />;
    if (n.includes("mate")) return <FaCalculator />;
    if (n.includes("social")) return <FaUsers />;
    if (n.includes("ciencia")) return <FaFlask />;
    if (n.includes("ingl")) return <FaGlobeAmericas />;
    return <FaBookOpen />; // fallback por defecto
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {base.map((d) => (
        <div key={d.nombre} className="rounded-2xl p-5 shadow-sm border bg-white">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl"
            style={{ background: d.color }}
          >
            {getIcon(d.nombre)}
          </div>
          <div className="mt-3 text-gray-900 font-semibold">{d.nombre}</div>
          <div className="text-3xl font-bold mt-1">{d.total}</div>
          <div className="text-xs text-gray-500">{d.subtitulo ?? "estudiantes activos"}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsIslas;
