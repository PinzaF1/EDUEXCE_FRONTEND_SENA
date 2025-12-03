import React, { useEffect, useMemo, useState } from "react";
import { FaFilter, FaCheckCircle, FaTrash, FaBell, FaSearch, FaCircle } from "react-icons/fa";

type Notificacion = {
  id: number;
  title: string;
  body?: string;
  estudiante?: string;
  curso?: string;
  tipo?: string;
  read?: boolean;
  created_at?: string;
};

const API_NOTIFS = "/api/admin/notificaciones";

const authHeaders = () => {
  const t = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};

const formatTimeAgo = (iso?: string) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.round(h / 24);
  return `Hace ${d} d`;
};

const defaultTypes = ["Inactividad", "Inactividad 30d", "Puntaje Bajo", "Puntaje Crítico", "Área Crítica", "Alerta", "Progreso Lento"];

const Notificaciones: React.FC = () => {
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"todas" | "no-leidas">("todas");
  const [query, setQuery] = useState("");
  const [openFilters, setOpenFilters] = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(API_NOTIFS, { headers: authHeaders(), cache: "no-store" });
        if (!r.ok) {
          setNotifs([]);
        } else {
          const data = await r.json();
          const items = Array.isArray(data) ? data : data?.items ?? [];
          setNotifs(items || []);
        }
      } catch (err) {
        console.error("Error cargando notificaciones", err);
        setNotifs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = useMemo(() => {
    return { todas: notifs.length, noLeidas: notifs.filter((n) => !n.read).length };
  }, [notifs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notifs.filter((n) => {
      if (tab === "no-leidas" && n.read) return false;
      if (activeType && !(String(n.tipo ?? "").toLowerCase().includes(activeType.toLowerCase()))) return false;
      if (!q) return true;
      return (
        String(n.title ?? "").toLowerCase().includes(q) ||
        String(n.estudiante ?? "").toLowerCase().includes(q) ||
        String(n.body ?? "").toLowerCase().includes(q)
      );
    });
  }, [notifs, query, tab, activeType]);

  const markAsRead = (id: number) => {
    setNotifs((prev) => prev.map((p) => (p.id === id ? { ...p, read: true } : p)));
    fetch(`${API_NOTIFS}/${id}/read`, { method: "POST", headers: authHeaders() }).catch(() => {});
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((p) => ({ ...p, read: true })));
    fetch(`${API_NOTIFS}/mark-all-read`, { method: "POST", headers: authHeaders() }).catch(() => {});
    setToast("Todas las notificaciones marcadas como leídas");
    setTimeout(() => setToast(null), 3000);
  };

  const deleteNotif = (id: number) => {
    setNotifs((prev) => prev.filter((p) => p.id !== id));
    fetch(`${API_NOTIFS}/${id}`, { method: "DELETE", headers: authHeaders() }).catch(() => {});
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {toast && <div className="fixed right-6 top-24 z-50 bg-green-500 text-white px-4 py-2 rounded">{toast}</div>}

      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              data-cy="tab-todas"
              onClick={() => setTab("todas")}
              className={`px-4 py-2 rounded-lg ${tab === "todas" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-700"}`}
            >
              Todas <span className="ml-2 text-sm inline-block px-2 py-0.5 rounded-full text-xs font-semibold"> {counts.todas}</span>
            </button>

            <button
              data-cy="tab-no-leidas"
              onClick={() => setTab("no-leidas")}
              className={`px-4 py-2 rounded-lg ${tab === "no-leidas" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-700"}`}
            >
              No Leídas <span className="ml-2 text-sm inline-block px-2 py-0.5 rounded-full text-xs font-semibold">{counts.noLeidas}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-cy="btn-filtros"
              onClick={() => setOpenFilters((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md"
            >
              <FaFilter /> Filtros
            </button>

            <button data-cy="mark-all-read" onClick={markAllRead} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <FaCheckCircle /> Marcar todas como leídas
            </button>
          </div>
        </div>

        {/* filtros y búsqueda */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {openFilters && (
            <div className="flex gap-2 flex-wrap" data-cy="types-container">
              <span className="font-semibold text-sm text-gray-700 mr-2">Tipo:</span>
              {defaultTypes.map((t) => (
                <button
                  key={t}
                  data-cy={`filter-type-${t.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setActiveType((prev) => (prev === t ? null : t))}
                  className={`text-sm px-3 py-1 rounded-full border ${activeType === t ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 w-full md:w-1/2">
            <div className="relative w-full">
              <input
                data-cy="search-notifs"
                placeholder="Buscar por estudiante, área, título..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border rounded-lg px-10 py-2"
                aria-label="Buscar notificaciones"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* lista de notificaciones */}
      <div className="mt-6">
        <div className="text-xs text-gray-500 mb-4">— HOY</div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Cargando notificaciones...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No hay notificaciones para mostrar</div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                data-cy={`notif-card-${n.id}`}
                className={`bg-white border ${n.read ? "border-gray-200" : "border-blue-200"} rounded-lg p-4 flex items-start justify-between shadow-sm`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FaBell className="text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{n.title}</h4>
                      {!n.read && <FaCircle className="text-blue-500 text-xs ml-1" />}
                      <span className="text-xs text-gray-400 ml-2">{formatTimeAgo(n.created_at)}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-2">
                        {n.estudiante && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{n.estudiante}{n.curso ? ` (${n.curso})` : ""}</span>}
                        {n.tipo && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{n.tipo}</span>}
                      </div>
                      {n.body && <div className="mt-2">{n.body}</div>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    data-cy={`mark-read-${n.id}`}
                    title="Marcar leída"
                    onClick={() => markAsRead(n.id)}
                    className="text-blue-600 p-2 rounded hover:bg-blue-50"
                  >
                    <FaCheckCircle />
                  </button>

                  <button
                    data-cy="delete"
                    title="Eliminar"
                    onClick={() => deleteNotif(n.id)}
                    className="text-red-500 p-2 rounded hover:bg-red-50"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notificaciones;
