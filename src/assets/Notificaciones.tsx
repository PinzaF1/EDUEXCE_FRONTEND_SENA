// src/assets/Notificaciones.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  FaBell,
  FaRegClock,
  FaExclamationTriangle,
  FaChartLine,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";

const RAW_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  "https://gillian-semiluminous-blubberingly.ngrok-free.dev/";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

/* ===================== Tipos ===================== */
type TipoNoti = "inactividad" | "puntaje_bajo" | "progreso_lento" | "area_critica" | "estudiante_alerta" | "puntaje_bajo_inmediato" | "inactividad_30d";
type Noti = {
  id: string | number;
  tipo: TipoNoti;
  titulo: string;
  detalle: string;
  fechaISO: string;
  leida?: boolean;
  area?: string;
  puntaje?: number;
  estudiante?: string;
  curso?: string;
};

type Paginacion = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/* ===================== UI helpers ===================== */
const iconoDe = (t: TipoNoti) => {
  if (t === "inactividad" || t === "inactividad_30d") return <FaRegClock className="text-blue-600" />;
  if (t === "puntaje_bajo" || t === "puntaje_bajo_inmediato") return <FaExclamationTriangle className="text-rose-600" />;
  if (t === "area_critica") return <FaExclamationTriangle className="text-red-600" />;
  if (t === "estudiante_alerta") return <FaBell className="text-orange-600" />;
  return <FaChartLine className="text-amber-600" />;
};

/* ===================== Componente ===================== */
const Notificaciones: React.FC = () => {
  const [notis, setNotis] = useState<Noti[]>([]);
  const [tab, setTab] = useState<"todas" | "no_leidas" | TipoNoti>("todas");
  const [q, setQ] = useState("");
  const [sseConectado, setSseConectado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  // Cargar notificaciones paginadas
  const cargarNotificaciones = async (page: number = 1, append: boolean = false) => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Construir query params
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      });

      if (tab === 'no_leidas') params.append('leida', 'false');
      else if (tab !== 'todas') params.append('tipo', tab);

      const res = await fetch(`${API_BASE}/admin/notificaciones?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const notifs = data.notificaciones || [];
        
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
        
        if (append) {
          setNotis((prev) => [...prev, ...mapeadas]);
        } else {
          setNotis(mapeadas);
        }
        
        setPaginacion(data.paginacion || null);
        setPaginaActual(page);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar al montar y cuando cambia el tab
  useEffect(() => {
    setPaginaActual(1);
    cargarNotificaciones(1, false);
  }, [tab]);

  // SSE para tiempo real
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("[SSE] Conectando a notificaciones en tiempo real...");
    
    const eventSource = new EventSource(`${API_BASE}/admin/notificaciones/stream`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log("[SSE] Conexión establecida con el servidor");
      setSseConectado(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.tipo === 'conexion') {
          console.log("[SSE] Conexión confirmada:", data.mensaje);
          setSseConectado(true);
          return;
        }

        console.log("[SSE] Nueva notificación recibida:", data);

        const p = data.payload || {};
        const nuevaNotificacion: Noti = {
          id: data.id_notificacion || data.id,
          tipo: (data.tipo || "inactividad") as TipoNoti,
          titulo: data.titulo || p.titulo || "",
          detalle: data.detalle || p.detalle || "",
          fechaISO: data.created_at || data.createdAt || new Date().toISOString(),
          leida: false,
          area: p.area,
          puntaje: typeof p.porcentaje === 'number' ? Math.round(p.porcentaje) : (typeof p.puntaje === 'number' ? Math.round(p.puntaje) : undefined),
          estudiante: p.estudiante || p.nombre,
          curso: p.curso,
        };

        setNotis((prev) => {
          const existe = prev.some(n => n.id === nuevaNotificacion.id);
          if (existe) return prev;
          
          const updated = [nuevaNotificacion, ...prev];
          
          const noLeidas = updated.filter(n => !n.leida).length;
          window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { 
            detail: { noLeidas } 
          }));
          
          return updated;
        });

        if (Notification.permission === "granted") {
          new Notification(nuevaNotificacion.titulo, {
            body: nuevaNotificacion.detalle,
            icon: "/vite.svg",
            badge: "/vite.svg",
            tag: String(nuevaNotificacion.id),
          });
        }
      } catch (error) {
        console.error("[SSE] Error procesando notificación:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Error en la conexión:", error);
      console.log("[SSE] Intentando reconectar...");
      setSseConectado(false);
    };

    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log("[Notifications] Permiso:", permission);
      });
    }

    return () => {
      console.log("[SSE] Cerrando conexión");
      eventSource.close();
    };
  }, []);

  const contadores = useMemo(() => {
    return {
      total: paginacion?.total || notis.length,
      unread: notis.filter(n => !n.leida).length,
    };
  }, [notis, paginacion]);

  const marcarLeida = async (id: Noti["id"]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_BASE}/admin/notificaciones/marcar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ ids: [id] }),
      });

      setNotis((arr) => {
        const updated = arr.map((n) => (n.id === id ? { ...n, leida: true } : n));
        
        const noLeidas = updated.filter(n => !n.leida).length;
        window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { 
          detail: { noLeidas } 
        }));
        
        return updated;
      });
    } catch (error) {
      console.error("Error marcando como leída:", error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const idsNoLeidas = notis.filter(n => !n.leida).map(n => n.id);
      if (idsNoLeidas.length === 0) return;

      await fetch(`${API_BASE}/admin/notificaciones/marcar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ ids: idsNoLeidas }),
      });

      setNotis((arr) => {
        const updated = arr.map((n) => ({ ...n, leida: true }));
        
        window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { 
          detail: { noLeidas: 0 } 
        }));
        
        return updated;
      });
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  const cargarMas = () => {
    if (paginacion?.hasNextPage && !cargando) {
      cargarNotificaciones(paginaActual + 1, true);
    }
  };

  const fmtTiempo = (iso: string) => {
    const ahora = new Date();
    const fecha = new Date(iso);
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffSegundos = Math.floor(diffMs / 1000);
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffSegundos < 60) return 'Hace menos de 1 minuto';
    if (diffMinutos < 60) return `Hace ${diffMinutos} minuto${diffMinutos !== 1 ? 's' : ''}`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
    if (diffDias < 7) return `Hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
    
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: fecha.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined 
    });
  };

  const esNueva = (fechaISO: string) => {
    const ahora = new Date();
    const fecha = new Date(fechaISO);
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMinutos = diffMs / (1000 * 60);
    return diffMinutos < 60;
  };

  return (
    <div className="p-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-sm text-gray-600 mt-1">
              {paginacion ? `${paginacion.total} notificaciones totales` : 'Cargando...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sseConectado 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                sseConectado 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-yellow-500 animate-pulse'
              }`}></span>
              {sseConectado ? 'En Vivo' : 'Reconectando...'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <TabBtn active={tab === "todas"} onClick={() => setTab("todas")} label={`Todas (${contadores.total})`} />
          <TabBtn active={tab === "no_leidas"} onClick={() => setTab("no_leidas")} label={`No Leídas (${contadores.unread})`} />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={marcarTodasLeidas}
            disabled={contadores.unread === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {notis.length === 0 && !cargando ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Sin notificaciones
          </div>
        ) : (
          notis.map((n) => {
            const iconColor = n.tipo === 'puntaje_bajo' || n.tipo === 'inactividad' ? '#f59e0b' : '#8b5cf6';
            const nueva = esNueva(n.fechaISO);
            
            return (
              <div 
                key={n.id} 
                className={`bg-white rounded-lg p-4 shadow-sm transition-all ${
                  nueva 
                    ? 'border-2 border-green-300 ring-2 ring-green-100' 
                    : 'border border-gray-100'
                } ${!n.leida ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: iconColor, opacity: 0.2 }}>
                      {iconoDe(n.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{n.titulo}</h4>
                        {nueva && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            ✨ Nueva
                          </span>
                        )}
                        {!n.leida && !nueva && (
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{n.estudiante || n.area || '-'}{n.curso ? ` - ${n.curso}` : ''}</p>
                      <p className="text-xs text-gray-600 mt-1">{n.detalle}</p>
                      <p className="text-xs text-gray-500 mt-1">{fmtTiempo(n.fechaISO)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => marcarLeida(n.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Marcar como leída"
                    >
                      <span className="text-lg">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Botón cargar más */}
      {paginacion && paginacion.hasNextPage && (
        <div className="mt-6 text-center">
          <button
            onClick={cargarMas}
            disabled={cargando}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {cargando ? (
              <>
                <FaSpinner className="animate-spin" />
                Cargando...
              </>
            ) : (
              `Cargar más (${paginacion.total - notis.length} restantes)`
            )}
          </button>
        </div>
      )}

      {/* Info de paginación */}
      {paginacion && (
        <div className="mt-4 text-center text-xs text-gray-500">
          Mostrando {notis.length} de {paginacion.total} notificaciones
        </div>
      )}
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

export default Notificaciones;
