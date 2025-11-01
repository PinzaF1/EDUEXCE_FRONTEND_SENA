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
type TipoNoti = "inactividad" | "puntaje_bajo" | "progreso_lento" | "area_critica" | "estudiante_alerta" | "puntaje_bajo_inmediato" | "inactividad_30d";
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
const tipoChip = (t: TipoNoti) => {
  if (t === "inactividad" || t === "inactividad_30d") return "bg-blue-50 text-blue-700 border border-blue-200";
  if (t === "puntaje_bajo" || t === "puntaje_bajo_inmediato") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (t === "area_critica") return "bg-red-50 text-red-700 border border-red-200";
  if (t === "estudiante_alerta") return "bg-orange-50 text-orange-700 border border-orange-200";
  return "bg-amber-50 text-amber-700 border border-amber-200";
};

const iconoDe = (t: TipoNoti) => {
  if (t === "inactividad" || t === "inactividad_30d") return <FaRegClock className="text-blue-600" />;
  if (t === "puntaje_bajo" || t === "puntaje_bajo_inmediato") return <FaExclamationTriangle className="text-rose-600" />;
  if (t === "area_critica") return <FaExclamationTriangle className="text-red-600" />;
  if (t === "estudiante_alerta") return <FaBell className="text-orange-600" />;
  return <FaChartLine className="text-amber-600" />;
};

const etiquetaDe = (t: TipoNoti) => {
  if (t === "inactividad" || t === "inactividad_30d") return "Inactividad";
  if (t === "puntaje_bajo" || t === "puntaje_bajo_inmediato") return "Puntaje Bajo";
  if (t === "area_critica") return "Área Crítica";
  if (t === "estudiante_alerta") return "Estudiante en Alerta";
  return "Progreso Lento";
};

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });

/* ===================== Componente ===================== */
const Notificaciones: React.FC = () => {
  const [notis, setNotis] = useState<Noti[]>(NOTI_INICIALES);
  const [tab, setTab] = useState<"todas" | "no_leidas" | TipoNoti>("todas");
  const [q, setQ] = useState("");
  const [sseConectado, setSseConectado] = useState(false);

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

    // ========== CONEXIÓN SSE PARA NOTIFICACIONES EN TIEMPO REAL ==========
    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("[SSE] Conectando a notificaciones en tiempo real...");
    
    const eventSource = new EventSource(`${API_BASE}/admin/notificaciones/stream`, {
      withCredentials: true,
    });

    // Alternativa: si EventSource no soporta headers, usar fetch con ReadableStream
    // Pero EventSource es más simple y el token se puede pasar en el middleware

    eventSource.onopen = () => {
      console.log("[SSE] Conexión establecida con el servidor");
      setSseConectado(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Ignorar mensajes de sistema (heartbeat, conexión)
        if (data.tipo === 'conexion') {
          console.log("[SSE] Conexión confirmada:", data.mensaje);
          setSseConectado(true);
          return;
        }

        console.log("[SSE] Nueva notificación recibida:", data);

        // Mapear la notificación
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

        // Agregar al inicio de la lista (sin duplicados)
        setNotis((prev) => {
          const existe = prev.some(n => n.id === nuevaNotificacion.id);
          if (existe) return prev;
          return [nuevaNotificacion, ...prev];
        });

        // Mostrar notificación del navegador
        if (Notification.permission === "granted") {
          new Notification(nuevaNotificacion.titulo, {
            body: nuevaNotificacion.detalle,
            icon: "/vite.svg",
            badge: "/vite.svg",
            tag: String(nuevaNotificacion.id), // Evita duplicados
          });
        }

        // Sonido opcional (descomenta si tienes un archivo de audio)
        // try {
        //   const audio = new Audio("/notification.mp3");
        //   audio.volume = 0.3;
        //   audio.play().catch(() => {});
        // } catch {}

      } catch (error) {
        console.error("[SSE] Error procesando notificación:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Error en la conexión:", error);
      console.log("[SSE] Intentando reconectar...");
      setSseConectado(false);
    };

    // Pedir permiso para notificaciones del navegador
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log("[Notifications] Permiso:", permission);
      });
    }

    // Cleanup al desmontar el componente
    return () => {
      console.log("[SSE] Cerrando conexión");
      eventSource.close();
    };
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

  const marcarLeida = async (id: Noti["id"]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Actualizar en el servidor
      await fetch(`${API_BASE}/admin/notificaciones/marcar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ ids: [id] }),
      });

      // Actualizar localmente
      setNotis((arr) => arr.map((n) => (n.id === id ? { ...n, leida: true } : n)));
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

      setNotis((arr) => arr.map((n) => ({ ...n, leida: true })));
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  const limpiarTodas = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar todas las notificaciones? Esta acción no se puede deshacer.")) {
      setNotis([]);
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-sm text-gray-600 mt-1">Centro de alertas y comunicaciones del sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${sseConectado ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              <span className={`w-2 h-2 rounded-full ${sseConectado ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              {sseConectado ? 'Tiempo Real Activo' : 'Conectando...'}
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
          <button 
            onClick={limpiarTodas}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
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
