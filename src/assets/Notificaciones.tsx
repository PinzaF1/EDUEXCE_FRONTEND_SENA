// src/assets/Notificaciones.tsx
import React, { useMemo, useState } from "react";
import {
  FaBell,
  FaRegClock,
  FaExclamationTriangle,
  FaChartLine,
  FaSearch,
} from "react-icons/fa";

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 grid place-items-center">
          <FaBell className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Centro de Notificaciones</h2>
          <p className="text-sm text-gray-500">
            Recibe avisos por <strong>inactividad</strong>, <strong>puntajes bajos</strong> y{" "}
            <strong>progreso lento</strong>.
          </p>
        </div>

        {/* Buscar */}
        <div className="ml-auto relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por estudiante, área, curso…"
            className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-72"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border bg-white overflow-hidden mb-4">
        <div className="grid grid-cols-5">
          <TabBtn active={tab === "todas"} onClick={() => setTab("todas")} label={`Todas (${contadores.total})`} />
          <TabBtn active={tab === "no_leidas"} onClick={() => setTab("no_leidas")} label={`No Leídas (${contadores.unread})`} />
          <TabBtn active={tab === "inactividad"} onClick={() => setTab("inactividad")} label="Inactividad" />
          <TabBtn active={tab === "puntaje_bajo"} onClick={() => setTab("puntaje_bajo")} label="Puntajes Bajos" />
          <TabBtn active={tab === "progreso_lento"} onClick={() => setTab("progreso_lento")} label="Progreso Lento" />
        </div>
      </div>

      {/* Lista */}
      <div className="border rounded-xl overflow-hidden">
        {visibles.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 border border-blue-200 grid place-items-center">
              <FaBell className="text-blue-500 text-2xl" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">Sin notificaciones</h3>
            <p className="text-gray-500 text-sm">
              Cuando haya actividad, los avisos aparecerán aquí.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {visibles.map((n) => (
              <li key={n.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border grid place-items-center">
                    {iconoDe(n.tipo)}
                  </div>

                  <div className="flex-1">
                    {/* Encabezado de tarjeta */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${tipoChip(n.tipo)}`}>
                        {etiquetaDe(n.tipo)}
                      </span>
                      {!n.leida && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          Nueva
                        </span>
                      )}
                      <span className="ml-auto text-xs text-gray-500">{fmtFecha(n.fechaISO)}</span>
                    </div>

                    <h4 className="mt-1 font-semibold text-gray-900">{n.titulo}</h4>
                    <p className="text-sm text-gray-600">{n.detalle}</p>

                    {/* Meta */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <Meta label="Estudiante" value={n.estudiante} />
                      <Meta label="Curso" value={n.curso} />
                      <div className="flex gap-3">
                        {n.area && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                            Área: {n.area}
                          </span>
                        )}
                        {typeof n.puntaje === "number" && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                            Puntaje: {n.puntaje}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acción */}
                  {!n.leida && (
                    <button
                      onClick={() => marcarLeida(n.id)}
                      className="ml-2 text-sm text-blue-700 hover:text-blue-900"
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
    className={
      "px-4 py-3 text-sm font-medium border-r last:border-r-0 transition " +
      (active
        ? "bg-blue-50 text-blue-700"
        : "bg-white text-gray-600 hover:bg-gray-50")
    }
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
