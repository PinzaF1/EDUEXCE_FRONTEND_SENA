// src/assets/Notificaciones.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaRegClock,
  FaExclamationTriangle,
  FaChartLine,
  FaSearch,
  FaSpinner,
  FaTrash,
  FaCheckCircle,
  FaFilter,
  FaTimes,
  FaVolumeMute,
  FaVolumeUp,
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
const configTipo = (t: TipoNoti) => {
  const configs = {
    inactividad: {
      icon: <FaRegClock />,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
      label: "Inactividad"
    },
    inactividad_30d: {
      icon: <FaRegClock />,
      color: "indigo",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      iconBg: "bg-indigo-100",
      label: "Inactividad 30d"
    },
    puntaje_bajo: {
      icon: <FaExclamationTriangle />,
      color: "rose",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-700",
      iconBg: "bg-rose-100",
      label: "Puntaje Bajo"
    },
    puntaje_bajo_inmediato: {
      icon: <FaExclamationTriangle />,
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      iconBg: "bg-red-100",
      label: "Puntaje Crítico"
    },
    area_critica: {
      icon: <FaExclamationTriangle />,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      iconBg: "bg-orange-100",
      label: "Área Crítica"
    },
    estudiante_alerta: {
      icon: <FaBell />,
      color: "amber",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      iconBg: "bg-amber-100",
      label: "Alerta Estudiante"
    },
    progreso_lento: {
      icon: <FaChartLine />,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      iconBg: "bg-purple-100",
      label: "Progreso Lento"
    },
  };
  return configs[t] || configs.inactividad;
};

/* ===================== Componente ===================== */
const Notificaciones: React.FC = () => {
  const [notis, setNotis] = useState<Noti[]>([]);
  const [tab, setTab] = useState<"todas" | "no_leidas">("todas");
  const [filtroTipo, setFiltroTipo] = useState<TipoNoti | "todos">("todos");
  const [q, setQ] = useState("");
  const [sseConectado, setSseConectado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [toast, setToast] = useState<{mensaje: string, tipo: 'success' | 'error'} | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sonido de notificación (opcional)
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ0fPTgjMGHm7A7+OZUQ0PV6vo7aNaFAtBm9/zvWwi');
  }, []);

  const reproducirSonido = () => {
    if (sonidoActivo && audioRef.current) {
      audioRef.current.play().catch(() => {/* ignore */});
    }
  };

  const mostrarToast = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // Cargar notificaciones paginadas
  const cargarNotificaciones = async (page: number = 1, append: boolean = false) => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      });

      if (tab === 'no_leidas') params.append('leida', 'false');
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo);

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
      mostrarToast("Error al cargar notificaciones", "error");
    } finally {
      setCargando(false);
    }
  };

  // Cargar al montar y cuando cambia el tab o filtro
  useEffect(() => {
    setPaginaActual(1);
    cargarNotificaciones(1, false);
  }, [tab, filtroTipo]);

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

        // Reproducir sonido y mostrar notificación del navegador
        reproducirSonido();
        mostrarToast(`Nueva notificación: ${nuevaNotificacion.titulo}`, 'success');

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
  }, [sonidoActivo]);

  // Notificaciones filtradas por búsqueda
  const notisFiltradas = useMemo(() => {
    if (!q.trim()) return notis;
    
    const query = q.toLowerCase().trim();
    return notis.filter(n => 
      n.titulo.toLowerCase().includes(query) ||
      n.detalle.toLowerCase().includes(query) ||
      n.estudiante?.toLowerCase().includes(query) ||
      n.area?.toLowerCase().includes(query) ||
      n.curso?.toLowerCase().includes(query)
    );
  }, [notis, q]);

  // Agrupar por fecha
  const notisAgrupadas = useMemo(() => {
    const grupos: Record<string, Noti[]> = {
      'Hoy': [],
      'Ayer': [],
      'Esta semana': [],
      'Anteriores': []
    };

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(inicioSemana.getDate() - 7);

    notisFiltradas.forEach(n => {
      const fecha = new Date(n.fechaISO);
      const fechaSinHora = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

      if (fechaSinHora.getTime() === hoy.getTime()) {
        grupos['Hoy'].push(n);
      } else if (fechaSinHora.getTime() === ayer.getTime()) {
        grupos['Ayer'].push(n);
      } else if (fecha >= inicioSemana) {
        grupos['Esta semana'].push(n);
      } else {
        grupos['Anteriores'].push(n);
      }
    });

    return grupos;
  }, [notisFiltradas]);

  const contadores = useMemo(() => {
    return {
      total: paginacion?.total || notis.length,
      unread: notis.filter(n => !n.leida).length,
      filtradas: notisFiltradas.length,
    };
  }, [notis, paginacion, notisFiltradas]);

  const marcarLeida = async (id: Noti["id"]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Optimistic update
      setNotis((arr) => {
        const updated = arr.map((n) => (n.id === id ? { ...n, leida: true } : n));
        const noLeidas = updated.filter(n => !n.leida).length;
        window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { 
          detail: { noLeidas } 
        }));
        return updated;
      });

      await fetch(`${API_BASE}/admin/notificaciones/marcar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch (error) {
      console.error("Error marcando como leída:", error);
      mostrarToast("Error al marcar como leída", "error");
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const idsNoLeidas = notis.filter(n => !n.leida).map(n => n.id);
      if (idsNoLeidas.length === 0) return;

      // Optimistic update
      setNotis((arr) => {
        const updated = arr.map((n) => ({ ...n, leida: true }));
        window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { 
          detail: { noLeidas: 0 } 
        }));
        return updated;
      });

      await fetch(`${API_BASE}/admin/notificaciones/marcar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ ids: idsNoLeidas }),
      });

      mostrarToast("Todas las notificaciones marcadas como leídas", "success");
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
      mostrarToast("Error al marcar notificaciones", "error");
    }
  };

  const eliminarNotificacion = async (id: Noti["id"]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Optimistic update
      setNotis((arr) => arr.filter(n => n.id !== id));

      // TODO: Implementar endpoint DELETE en el backend
      // await fetch(`${API_BASE}/admin/notificaciones/${id}`, {
      //   method: "DELETE",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "ngrok-skip-browser-warning": "true",
      //   },
      // });

      mostrarToast("Notificación eliminada", "success");
    } catch (error) {
      console.error("Error eliminando notificación:", error);
      mostrarToast("Error al eliminar", "error");
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
    
    if (diffSegundos < 60) return 'Ahora mismo';
    if (diffMinutos < 60) return `Hace ${diffMinutos} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const esNueva = (fechaISO: string) => {
    const ahora = new Date();
    const fecha = new Date(fechaISO);
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMinutos = diffMs / (1000 * 60);
    return diffMinutos < 5; // Consideramos "nueva" si tiene menos de 5 minutos
  };

  return (
    <div className="p-0 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border-2 flex items-center gap-3 animate-[slideInRight_0.3s_ease-out] ${
          toast.tipo === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.tipo === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span className="font-medium">{toast.mensaje}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                <FaBell className="text-lg" />
              </div>
              Notificaciones
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {paginacion ? (
                <>
                  <span className="font-semibold">{contadores.unread}</span> sin leer de{' '}
                  <span className="font-semibold">{paginacion.total}</span> totales
                </>
              ) : 'Cargando...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Indicador SSE */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm ${
              sseConectado 
                ? 'bg-green-50 text-green-700 border-2 border-green-200' 
                : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                sseConectado 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-yellow-500 animate-pulse'
              }`}></span>
              {sseConectado ? 'Conectado' : 'Reconectando...'}
            </div>

            {/* Toggle sonido */}
            <button
              onClick={() => setSonidoActivo(!sonidoActivo)}
              className={`p-2 rounded-xl transition-all ${
                sonidoActivo 
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={sonidoActivo ? "Silenciar notificaciones" : "Activar sonido"}
            >
              {sonidoActivo ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <TabBtn 
              active={tab === "todas"} 
              onClick={() => setTab("todas")} 
              label={`Todas`}
              count={contadores.total}
            />
            <TabBtn 
              active={tab === "no_leidas"} 
              onClick={() => setTab("no_leidas")} 
              label={`No Leídas`}
              count={contadores.unread}
              highlight={contadores.unread > 0}
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <button 
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FaFilter />
              Filtros
              {filtroTipo !== 'todos' && (
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  1
                </span>
              )}
            </button>
            <button 
              onClick={marcarTodasLeidas}
              disabled={contadores.unread === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaCheckCircle />
              Marcar todas como leídas
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-[slideDown_0.2s_ease-out]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              <FiltroBtn 
                active={filtroTipo === "todos"} 
                onClick={() => setFiltroTipo("todos")} 
                label="Todos"
              />
              {(Object.keys(configTipo("inactividad")) as TipoNoti[]).slice(0, 7).map(tipo => {
                const config = configTipo(tipo);
                return (
                  <FiltroBtn 
                    key={tipo}
                    active={filtroTipo === tipo} 
                    onClick={() => setFiltroTipo(tipo)} 
                    label={config.label}
                    color={config.color}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div className="mt-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por estudiante, área, título..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
          {q && (
            <p className="text-xs text-gray-600 mt-2">
              {contadores.filtradas} resultado{contadores.filtradas !== 1 ? 's' : ''} encontrado{contadores.filtradas !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Lista de notificaciones agrupadas */}
      {cargando && notis.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : notisFiltradas.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FaBell className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {q ? 'No se encontraron resultados' : 'No hay notificaciones'}
          </h3>
          <p className="text-sm text-gray-600">
            {q 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Las notificaciones aparecerán aquí cuando haya actividad'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(notisAgrupadas).map(([grupo, notificaciones]) => {
            if (notificaciones.length === 0) return null;
            
            return (
              <div key={grupo}>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-gray-300 rounded"></span>
                  {grupo}
                  <span className="w-full h-0.5 bg-gray-300 rounded"></span>
                </h2>
                <div className="space-y-2">
                  {notificaciones.map((n, index) => {
                    const config = configTipo(n.tipo);
                    const nueva = esNueva(n.fechaISO);
                    
                    return (
                      <div 
                        key={n.id} 
                        className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-md group ${
                          nueva 
                            ? 'border-green-400 ring-2 ring-green-100 animate-[slideIn_0.3s_ease-out]' 
                            : n.leida
                            ? 'border-gray-200 hover:border-gray-300'
                            : `${config.borderColor} ${config.bgColor} hover:shadow-lg`
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icono */}
                            <div className={`w-12 h-12 rounded-xl ${config.iconBg} ${config.textColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                              {config.icon}
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {n.titulo}
                                  </h4>
                                  {nueva && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm animate-pulse">
                                      ✨ NUEVA
                                    </span>
                                  )}
                                  {!n.leida && !nueva && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {fmtTiempo(n.fechaISO)}
                                </span>
                              </div>

                              {/* Información adicional */}
                              {(n.estudiante || n.area || n.curso) && (
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {n.estudiante && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                      👤 {n.estudiante}
                                    </span>
                                  )}
                                  {n.area && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                                      📚 {n.area}
                                    </span>
                                  )}
                                  {n.curso && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                                      🎓 {n.curso}
                                    </span>
                                  )}
                                  {n.puntaje !== undefined && (
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold ${
                                      n.puntaje < 50 
                                        ? 'bg-red-100 text-red-700' 
                                        : n.puntaje < 70 
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {n.puntaje}%
                                    </span>
                                  )}
                                </div>
                              )}

                              <p className="text-sm text-gray-700 leading-relaxed">
                                {n.detalle}
                              </p>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.leida && (
                                <button 
                                  onClick={() => marcarLeida(n.id)}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Marcar como leída"
                                >
                                  <FaCheckCircle className="text-lg" />
                                </button>
                              )}
                              <button 
                                onClick={() => eliminarNotificacion(n.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botón cargar más */}
      {paginacion && paginacion.hasNextPage && !q && (
        <div className="mt-8 text-center">
          <button
            onClick={cargarMas}
            disabled={cargando}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center gap-3 mx-auto hover:scale-105"
          >
            {cargando ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                Cargando...
              </>
            ) : (
              <>
                Cargar más notificaciones
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {paginacion.total - notis.length}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Info de paginación */}
      {paginacion && !q && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{notis.length}</span> de{' '}
            <span className="font-semibold text-gray-700">{paginacion.total}</span> notificaciones
          </p>
        </div>
      )}
    </div>
  );
};

/* ====== Subcomponentes ====== */
const TabBtn: React.FC<{ 
  active: boolean; 
  label: string; 
  count?: number;
  highlight?: boolean;
  onClick: () => void 
}> = ({ active, label, count, highlight, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
      active 
        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        active 
          ? 'bg-white/20 text-white' 
          : highlight 
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const FiltroBtn: React.FC<{ 
  active: boolean; 
  label: string; 
  color?: string;
  onClick: () => void 
}> = ({ active, label, color = 'gray', onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active 
        ? `bg-${color}-100 text-${color}-700 border-2 border-${color}-300 shadow-sm` 
        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

export default Notificaciones;
