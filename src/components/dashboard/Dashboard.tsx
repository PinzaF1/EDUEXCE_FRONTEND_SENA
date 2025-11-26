// src/assets/Dashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { IoMenuOutline } from "react-icons/io5";
import { FaBell } from "react-icons/fa";
import Sidebar from "./Sidebar";

/* ===== Base URL (sin / al final) ===== */
const RAW_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  "https://gillian-semiluminous-blubberingly.ngrok-free.dev/";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

/* ===== helpers para manejar avatar por institución ===== */
type TokenPayload = { id_institucion?: number | string; id?: number | string; [k: string]: any };

const decodeToken = (): TokenPayload | null => {
  const token = localStorage.getItem("token") || "";
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const getActiveInstitutionId = (): string | null => {
  const fromLS = localStorage.getItem("id_institucion");
  if (fromLS) return fromLS;
  const p = decodeToken();
  const id = p?.id_institucion ?? p?.id;
  return id != null ? String(id) : null;
};

const avatarKey = (instId: string | null) => (instId ? `avatar_url:${instId}` : null);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [institucion, setInstitucion] = useState("");
  const [rol, setRol] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificacionesCount, setNotificacionesCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  const [instId] = useState<string | null>(getActiveInstitutionId());
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    const key = avatarKey(getActiveInstitutionId());
    return key ? localStorage.getItem(key) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const instLS = localStorage.getItem("nombre_institucion") || "";
    const rolLS = localStorage.getItem("rol") || "";
    if (instLS) setInstitucion(instLS);
    setRol(rolLS || "Administrador");

    const cargarPerfil = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          localStorage.clear();
          navigate("/", { replace: true });
          return;
        }

        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }

        const inst = data?.institucion || {};
        const nombre = inst.nombre_institucion ?? inst.nombreInstitucion ?? "";
        const id = inst.id_institucion ?? inst.idInstitucion ?? null;
        const rolBack = data?.rol || "Administrador";

        if (nombre) {
          setInstitucion(nombre);
          localStorage.setItem("nombre_institucion", nombre);
        }
        if (id != null) {
          const idStr = String(id);
          localStorage.setItem("id_institucion", idStr);

          const key = avatarKey(idStr);
          const localAvatar = key ? localStorage.getItem(key) : null;
          const logo = inst.logo_url ?? inst.logoUrl ?? null;
          const avatar = (logo as string | null) ?? localAvatar ?? null;
          setAvatarUrl(avatar);
          if (key && avatar) localStorage.setItem(key, avatar);
        } else {
          setAvatarUrl(null);
        }

        if (rolBack) {
          setRol(rolBack);
          localStorage.setItem("rol", rolBack);
        }
      } catch {
        /* nada */
      }
    };

    const cargarNotificaciones = async () => {
      try {
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
          setNotificacionesCount(notifs.filter((n: any) => !n.leida).length);
        }
      } catch {
        setNotificacionesCount(0);
      }
    };

    cargarPerfil();
    cargarNotificaciones();

    // Escuchar eventos de actualización de notificaciones
    const handleNotificacionesActualizadas = (e: any) => {
      const { noLeidas } = e.detail;
      setNotificacionesCount(noLeidas);
    };

    window.addEventListener('notificaciones-actualizadas', handleNotificacionesActualizadas);

    return () => {
      window.removeEventListener('notificaciones-actualizadas', handleNotificacionesActualizadas);
    };
  }, [navigate]);

  // Escuchar cambios de avatar en LS para ESTA institución
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      const key = avatarKey(instId);
      if (key && e.key === key) setAvatarUrl(e.newValue);
    };
    const onFocus = () => {
      const key = avatarKey(instId);
      setAvatarUrl(key ? localStorage.getItem(key) : null);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [instId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const irPerfil = () => {
    setOpenProfile(false);
    navigate("/dashboard/perfil");
  };
  const cerrarSesion = () => {
    setOpenProfile(false);
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombre_institucion");
    localStorage.removeItem("last_login");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#f5f5f5]">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-60">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 overflow-visible">
          <div className="py-4 px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Botón hamburguesa (solo móvil) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <IoMenuOutline className="text-2xl text-gray-600" />
            </button>

            {/* Espaciador para centrar en desktop */}
            <div className="flex-1 lg:hidden" />

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notification Icon */}
              <div className="relative cursor-pointer" onClick={() => navigate("/dashboard/notificaciones")}>
                <FaBell className="text-lg lg:text-xl text-gray-600" />
                {notificacionesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificacionesCount > 9 ? '9+' : notificacionesCount}
                  </span>
                )}
              </div>

              {/* Profile */}
              <div className="relative z-50" ref={profileRef}>
                <button 
                  onClick={() => setOpenProfile(!openProfile)} 
                  className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gray-300 border-2 border-gray-200" />
                  )}
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">{rol || "Administrador"}</div>
                    <div className="text-xs text-gray-500">{institucion || "Confandi"}</div>
                  </div>
                </button>

                {openProfile && (
                  <div className="absolute right-0 mt-3 w-52 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={irPerfil}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Ver perfil
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={cerrarSesion}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
