// src/assets/Notificaciones.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  FaBell,
  FaRegClock,
  FaExclamationTriangle,
  FaChartLine,
  FaSearch,
} from "react-icons/fa";

const RAW_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  "https://gillian-semiluminous-blubberingly.ngrok-free.dev/";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

/* ===================== Tipos ===================== */
type TipoNoti = "inactividad" | "puntaje_bajo" | "progreso_lento";
type Noti = {
  id: string | number;
  tipo: TipoNoti;
  titulo: string;
  detalle: string;
  fechaISO: string;   // ISO para ordenar
  leida?: boolean;
  area?: string;
  puntaje?: number;
  estudiante?: string;
  curso?: string;
};

/* SIN datos (conectarás backend luego) */
const NOTI_INICIALES: Noti[] = [];

/* ===================== UI helpers ===================== */
const tipoChip = (t: TipoNoti) =>
  t === "inactividad"
    ? "bg-blue-50 text-blue-700 border border-blue-200"
    : t === "puntaje_bajo"
    ? "bg-rose-50 text-rose-700 border border-rose-200"
    : "bg-amber-50 text-amber-700 border border-amber-200";

const iconoDe = (t: TipoNoti) =>
  t === "inactividad" ? (
    <FaRegClock className="text-blue-600" />
  ) : t === "puntaje_bajo" ? (
    <FaExclamationTriangle className="text-rose-600" />
  ) : (
    <FaChartLine className="text-amber-600" />
  );

const etiquetaDe = (t: TipoNoti) =>
  t === "inactividad" ? "Inactividad" : t === "puntaje_bajo" ? "Puntaje Bajo" : "Progreso Lento";

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });

/* ===================== Componente ===================== */
const Notificaciones: React.FC = () => {
  const [notis, setNotis] = useState<Noti[]>(NOTI_INICIALES);
  const [tab, setTab] = useState<"todas" | "no_leidas" | TipoNoti>("todas");
  const [q, setQ] = useState("");

  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/admin/notificaciones`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          const notifs = Array.isArray(data) ? data : data?.notificaciones || [];
          
          const mapeadas: Noti[] = notifs.map((n: any) => {
            const p = n.payload || {};
            const area = p.area || n.area || undefined;
            const porcentaje = p.porcentaje || p.promedio || p.puntaje || n.porcentaje || n.puntaje;
            const estudiante = p.estudiante || p.nombre || n.estudiante;
            const curso = p.curso || n.curso;
            return {
              id: n.id_notificacion || n.id,
              tipo: (n.tipo || p.tipo || "inactividad") as TipoNoti,
              titulo: n.titulo || p.titulo || n.mensaje || "",
              detalle: n.detalle || p.detalle || n.descripcion || "",
              fechaISO: n.created_at || n.createdAt || n.fecha || new Date().toISOString(),
              leida: !!(n.leida),
              area,
              puntaje: typeof porcentaje === 'number' ? Math.round(porcentaje) : undefined,
              estudiante,
              curso,
            }
          });
          
          setNotis(mapeadas);
        }
      } catch (error) {
        console.error("Error cargando notificaciones:", error);
      }
    };

    cargarNotificaciones();
  }, []);

  const contadores = useMemo(() => {
    let ina = 0,
      pb = 0,
      pl = 0,
      unread = 0;
    for (const n of notis) {
      if (!n.leida) unread++;
      if (n.tipo === "inactividad") ina++;
      if (n.tipo === "puntaje_bajo") pb++;
      if (n.tipo === "progreso_lento") pl++;
    }
    return { ina, pb, pl, unread, total: notis.length };
  }, [notis]);

  const visibles = useMemo(() => {
    let list = [...notis];
    if (tab === "no_leidas") list = list.filter((n) => !n.leida);
    else if (tab !== "todas") list = list.filter((n) => n.tipo === tab);

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (n) =>
          n.titulo.toLowerCase().includes(s) ||
          n.detalle.toLowerCase().includes(s) ||
          (n.estudiante || "").toLowerCase().includes(s) ||
          (n.curso || "").toLowerCase().includes(s) ||
          (n.area || "").toLowerCase().includes(s)
      );
    }
    return list.sort(
      (a, b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime()
    );
  }, [notis, tab, q]);

  const marcarLeida = (id: Noti["id"]) =>
    setNotis((arr) => arr.map((n) => (n.id === id ? { ...n, leida: true } : n)));

  const fmtTiempo = (iso: string) => {
    const ahora = new Date();
    const fecha = new Date(iso);
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDias > 0) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    if (diffHoras > 0) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    return 'Hace unos momentos';
  };

  return (
    <div className="p-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <p className="text-sm text-gray-600 mt-1">Centro de alertas y comunicaciones del sistema</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <TabBtn active={tab === "todas"} onClick={() => setTab("todas")} label={`Todas (${contadores.total})`} />
          <TabBtn active={tab === "no_leidas"} onClick={() => setTab("no_leidas")} label={`No Leídas (${contadores.unread})`} />
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Marcar todas como leídas
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
            Limpiar todas
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {visibles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Sin notificaciones
          </div>
        ) : (
          visibles.map((n) => {
            const iconColor = n.tipo === 'puntaje_bajo' || n.tipo === 'inactividad' ? '#f59e0b' : '#8b5cf6';
            return (
              <div key={n.id} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: iconColor, opacity: 0.2 }}>
                      {iconoDe(n.tipo)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{n.titulo}</h4>
                      <p className="text-sm text-gray-700 mt-1">{n.estudiante || n.area || '-'}{n.curso ? ` - ${n.curso}` : ''}</p>
                      <p className="text-xs text-gray-600 mt-1">{n.detalle}</p>
                      <p className="text-xs text-gray-500 mt-1">{fmtTiempo(n.fechaISO)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="text-lg">&gt;</span>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="text-lg">&times;</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ====== Subcomponentes ====== */
const TabBtn: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({
  active,
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
      active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
    }`}
  >
    {label}
  </button>
);

const Meta: React.FC<{ label: string; value?: string }> = ({ label, value }) =>
  value ? (
    <div>
      <div className="text-xs text-gray-500">{label}:</div>
      <div className="text-gray-800">{value}</div>
    </div>
  ) : null;

export default Notificaciones;
