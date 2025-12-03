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
  (import.meta as any).env?.VITE_API_URL;

if (!RAW_BASE) {
  console.error('❌ VITE_API_URL no configurada');
  throw new Error('Missing VITE_API_URL environment variable');
}

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
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      iconBg: "bg-blue-100",
      label: "Inactividad 30d"
    },
    puntaje_bajo: {
      icon: <FaExclamationTriangle />,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
      label: "Puntaje Bajo"
    },
    puntaje_bajo_inmediato: {
      icon: <FaExclamationTriangle />,
      color: "blue",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
      textColor: "text-blue-800",
      iconBg: "bg-blue-200",
      label: "Puntaje Crítico"
    },
    area_critica: {
      icon: <FaExclamationTriangle />,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
      label: "Área Crítica"
    },
    estudiante_alerta: {
      icon: <FaBell />,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
      label: "Alerta Estudiante"
    },
    progreso_lento: {
      icon: <FaChartLine />,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
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

  // Sonido de notificación moderno (Web Audio API - estilo Slack/Discord)
  useEffect(() => {
    // Crear un contexto de audio solo después de interacción del usuario
    let audioContext: AudioContext | null = null;

    // Función para reproducir sonido moderno de notificación
    const crearSonido = () => {
      // Crear AudioContext on-demand (después de interacción)
      if (!audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        audioContext = new AudioContextClass();
      }

      // Resume el contexto si está suspendido
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(console.warn);
      }

      const now = audioContext.currentTime;

      // Primera nota (más alta y suave)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      osc1.frequency.value = 587.33; // D5 - Nota agradable
      osc1.type = 'sine'; // Onda suave
      
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.02); // Attack suave
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Decay rápido
      
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Segunda nota (armónica - efecto espacioso)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.frequency.value = 880; // A5 - Quinta perfecta
      osc2.type = 'sine';
      
      gain2.gain.setValueAtTime(0, now + 0.05);
      gain2.gain.linearRampToValueAtTime(0.1, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc2.start(now + 0.05);
      osc2.stop(now + 0.4);
    };

    (audioRef as any).current = { play: crearSonido };
  }, []);

  const reproducirSonido = () => {
    if (!sonidoActivo) return;
    
    try {
      if (audioRef.current && typeof (audioRef.current as any).play === 'function') {
        (audioRef.current as any).play();
      }
    } catch (error) {
      console.warn('[Audio] No se pudo reproducir el sonido:', error);
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
        
        // Backend ahora filtra automáticamente las eliminadas (campo 'eliminada' = false)
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
          // Al agregar, deduplicar con las existentes
          setNotis((prev) => {
            const idsExistentes = new Set(prev.map(n => n.id));
            const nuevas = mapeadas.filter(n => !idsExistentes.has(n.id));
            return [...prev, ...nuevas];
          });
        } else {
          // Deduplicar por ID antes de establecer
          const idsVistos = new Set();
          const sinDuplicados = mapeadas.filter(n => {
            if (idsVistos.has(n.id)) return false;
            idsVistos.add(n.id);
            return true;
          });
          setNotis(sinDuplicados);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filtroTipo]);

  // Actualizar contador global cuando cambien las notificaciones
  useEffect(() => {
    const noLeidas = notis.filter(n => !n.leida).length;
    window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { 
      detail: { noLeidas } 
    }));
  }, [notis]);

  // Polling para tiempo real (fallback mientras el backend implementa SSE)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn('[Polling] No hay token, no se puede conectar');
      setSseConectado(false);
      return;
    }

    console.log("[Polling] Iniciando actualización automática cada 30 segundos...");
    setSseConectado(true); // Marcar como "conectado" con polling
    
    // Función para verificar nuevas notificaciones
    const verificarNuevas = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/notificaciones?page=1&limit=5&leida=false`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          const notifs = data.notificaciones || [];
          
          // Backend ya filtra las eliminadas automáticamente
          // Verificar si hay notificaciones nuevas usando callback para evitar stale closure
          setNotis((prevNotis) => {
            const idsExistentes = new Set(prevNotis.map(n => n.id));
            const nuevas = notifs.filter((n: any) => {
              const id = n.id_notificacion || n.id;
              return !idsExistentes.has(id);
            });

            if (nuevas.length > 0) {
              console.log(`[Polling] ${nuevas.length} notificación(es) nueva(s) detectada(s)`);
              
              // Mapear las nuevas notificaciones
              const nuevasNoti: Noti[] = nuevas.map((n: any) => {
                const p = n.payload || {};
                return {
                  id: n.id_notificacion || n.id,
                  tipo: (n.tipo || "inactividad") as TipoNoti,
                  titulo: n.titulo || p.titulo || "",
                  detalle: n.detalle || p.detalle || "",
                  fechaISO: n.created_at || n.createdAt || new Date().toISOString(),
                  leida: false,
                  area: p.area,
                  puntaje: typeof p.porcentaje === 'number' ? Math.round(p.porcentaje) : undefined,
                  estudiante: p.estudiante || p.nombre,
                  curso: p.curso,
                };
              });

              // Reproducir sonido y notificación solo para la primera
              if (nuevasNoti.length > 0) {
                reproducirSonido();
                mostrarToast(`${nuevasNoti.length} nueva(s) notificación(es)`, 'success');

                if (Notification.permission === "granted") {
                  new Notification(nuevasNoti[0].titulo, {
                    body: nuevasNoti[0].detalle,
                    icon: "/vite.svg",
                  });
                }
              }

              // Agregar las nuevas al inicio sin duplicados
              return [...nuevasNoti, ...prevNotis];
            }

            return prevNotis;
          });
        }
      } catch (error) {
        console.warn('[Polling] Error verificando notificaciones:', error);
      }
    };

    // Polling cada 30 segundos
    const intervalId = setInterval(verificarNuevas, 30000);
    
    // Verificar inmediatamente al montar
    verificarNuevas();

    // Solicitar permiso de notificaciones
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log("[Notifications] Permiso:", permission);
      });
    }

    return () => {
      console.log("[Polling] Deteniendo actualización automática");
      clearInterval(intervalId);
      setSseConectado(false);
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
      setNotis((arr) => arr.map((n) => ({ ...n, leida: true })));

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

      // Llamada real al backend (soft delete)
      const res = await fetch(`${API_BASE}/admin/notificaciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!res.ok) {
        throw new Error('Error al eliminar notificación');
      }

      mostrarToast("Notificación eliminada", "success");
    } catch (error) {
      console.error("Error eliminando notificación:", error);
      // Revertir optimistic update en caso de error
      await cargarNotificaciones(paginaActual);
      mostrarToast("Error al eliminar", "error");
    }
  };

  const eliminarMultiples = async (ids: number[]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (ids.length === 0) {
        mostrarToast("No hay notificaciones para eliminar", "error");
        return;
      }

      if (ids.length > 100) {
        mostrarToast("Máximo 100 notificaciones por vez", "error");
        return;
      }

      const res = await fetch(`${API_BASE}/admin/notificaciones/eliminar-multiples`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        throw new Error('Error al eliminar múltiples notificaciones');
      }

      const data = await res.json();
      mostrarToast(`${data.eliminadas} notificación(es) eliminada(s)`, "success");
    } catch (error) {
      console.error("Error eliminando múltiples:", error);
      await cargarNotificaciones(paginaActual);
      mostrarToast("Error al eliminar notificaciones", "error");
    }
  };

  const eliminarTodasLeidas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const leidasCount = notis.filter(n => n.leida).length;
      if (leidasCount === 0) {
        mostrarToast("No hay notificaciones leídas para eliminar", "error");
        return;
      }

      // Confirmación
      if (!confirm(`¿Eliminar ${leidasCount} notificación(es) leída(s)?`)) {
        return;
      }

      // Optimistic update
      setNotis((arr) => arr.filter(n => !n.leida));

      const res = await fetch(
        `${API_BASE}/admin/notificaciones/todas?leidas_solamente=true`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!res.ok) {
        throw new Error('Error al eliminar todas las leídas');
      }

      const data = await res.json();
      mostrarToast(`${data.eliminadas} notificación(es) eliminada(s)`, "success");
    } catch (error) {
      console.error("Error eliminando todas las leídas:", error);
      await cargarNotificaciones(paginaActual);
      mostrarToast("Error al eliminar notificaciones", "error");
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
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
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
            {/* Indicador de actualización */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm ${
              sseConectado 
                ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' 
                : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                sseConectado 
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/50' 
                  : 'bg-gray-400 animate-pulse'
              }`}></span>
              <span className="hidden sm:inline flex items-center gap-1">
                {sseConectado ? (
                  <>
                    <FaCheckCircle className="text-xs" />
                    Actualizando (30s)
                  </>
                ) : (
                  <>
                    <FaSpinner className="text-xs animate-spin" />
                    Conectando...
                  </>
                )}
              </span>
              <span className="sm:hidden">
                {sseConectado ? <FaCheckCircle /> : <FaSpinner className="animate-spin" />}
              </span>
            </div>

            {/* Toggle sonido */}
            <button
              onClick={() => {
                setSonidoActivo(!sonidoActivo);
                // Reproducir sonido de prueba al activar
                if (!sonidoActivo) {
                  setTimeout(() => reproducirSonido(), 100);
                }
              }}
              className={`p-2 rounded-xl transition-all shadow-sm ${
                sonidoActivo 
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border-2 border-gray-300'
              }`}
              title={sonidoActivo ? "Silenciar notificaciones (Click para probar)" : "Activar sonido"}
            >
              {sonidoActivo ? <FaVolumeUp className="text-lg" /> : <FaVolumeMute className="text-lg" />}
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
            <button 
              onClick={eliminarTodasLeidas}
              disabled={notis.filter(n => n.leida).length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaTrash />
              Eliminar todas las leídas
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-[slideDown_0.2s_ease-out]">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700 mr-2 min-w-[60px]">Tipo:</span>
                <div className="flex flex-wrap gap-2">
                  <FiltroBtn 
                    active={filtroTipo === "todos"} 
                    onClick={() => setFiltroTipo("todos")} 
                    label="Todos"
                    color="gray"
                  />
                  <FiltroBtn 
                    active={filtroTipo === "inactividad"} 
                    onClick={() => setFiltroTipo("inactividad")} 
                    label="Inactividad"
                    color="blue"
                  />
                  <FiltroBtn 
                    active={filtroTipo === "inactividad_30d"} 
                    onClick={() => setFiltroTipo("inactividad_30d")} 
                    label="Inactividad 30d"
                    color="blue"
                  />
                  <FiltroBtn 
                    active={filtroTipo === "puntaje_bajo"} 
                    onClick={() => setFiltroTipo("puntaje_bajo")} 
                    label="Puntaje Bajo"
                    color="blue"
                  />
                  <FiltroBtn 
                    active={filtroTipo === "puntaje_bajo_inmediato"} 
                    onClick={() => setFiltroTipo("puntaje_bajo_inmediato")} 
                    label="Puntaje Crítico"
                    color="blue"
                  />
                  <FiltroBtn 
                    active={filtroTipo === "area_critica"} 
                    onClick={() => setFiltroTipo("area_critica")} 
                    label="Área Crítica"
                    color="blue"
                  />
                  <FiltroBtn 
                    active={filtroTipo === "estudiante_alerta"} 
                    onClick={() => setFiltroTipo("estudiante_alerta")} 
                    label="Alerta"
                    color="blue"
                  />
                  <FiltroBtn 
                    active={filtroTipo === "progreso_lento"} 
                    onClick={() => setFiltroTipo("progreso_lento")} 
                    label="Progreso Lento"
                    color="blue"
                  />
                </div>
              </div>
              {filtroTipo !== 'todos' && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <FaFilter className="text-xs" />
                  <span>Mostrando solo: <strong>{configTipo(filtroTipo as TipoNoti).label}</strong></span>
                  <button
                    onClick={() => setFiltroTipo('todos')}
                    className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Limpiar filtro"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
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
                            ? 'border-blue-400 ring-2 ring-blue-100 animate-[slideIn_0.3s_ease-out]' 
                            : n.leida
                            ? 'border-gray-200 hover:border-gray-300'
                            : `${config.borderColor} hover:shadow-lg`
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
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
                                      <FaBell className="text-xs" /> NUEVA
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
                                      <FaExclamationTriangle className="text-xs" /> {n.estudiante}
                                    </span>
                                  )}
                                  {n.area && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                      <FaChartLine className="text-xs" /> {n.area}
                                    </span>
                                  )}
                                  {n.curso && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                                      <FaBell className="text-xs" /> {n.curso}
                                    </span>
                                  )}
                                  {n.puntaje !== undefined && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold bg-blue-50 text-blue-700">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center gap-3 mx-auto"
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
}> = ({ active, label, color = 'gray', onClick }) => {
  const getClasses = () => {
    if (active) {
      if (color === 'blue') {
        return 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm';
      }
      return 'bg-gray-200 text-gray-700 border-2 border-gray-400 shadow-sm';
    }
    return 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400';
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${getClasses()}`}
    >
      {label}
    </button>
  );
};

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
