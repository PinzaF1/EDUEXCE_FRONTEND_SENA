// src/assets/Dashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { IoHomeOutline, IoPeopleOutline, IoStatsChartOutline, IoNotificationsOutline } from "react-icons/io5";
import { FaGraduationCap, FaBell } from "react-icons/fa";

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

/* ===== Logo (birrete) ===== */
const AppLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`grid place-items-center rounded-2xl bg-gradient-to-b from-[#2e5bff] to-[#3fa2ff] shadow-sm ${className}`}
    style={{ width: 44, height: 44 }}
  >
    <FaGraduationCap className="text-white text-xl" />
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [institucion, setInstitucion] = useState("");
  const [rol, setRol] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
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
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 fixed left-0 top-0 h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AppLogo />
            <div>
              <div className="text-base font-bold text-gray-900">EduExce</div>
              <div className="text-xs text-gray-900">Dashboard Institucional</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-6 space-y-1">
          <NavLink to="" end className="block">
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e0f2fe] font-semibold"
                  : "hover:bg-gray-50"
              }`}>
                <IoHomeOutline style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '20px'
                }} />
                <span style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '15px'
                }}>
                  Inicio
                </span>
              </div>
            )}
          </NavLink>

          <NavLink to="estudiantes" className="block">
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e0f2fe] font-semibold"
                  : "hover:bg-gray-50"
              }`}>
                <IoPeopleOutline style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '20px'
                }} />
                <span style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '15px'
                }}>
                  Estudiantes
                </span>
              </div>
            )}
          </NavLink>

          <NavLink to="seguimiento" className="block">
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e0f2fe] font-semibold"
                  : "hover:bg-gray-50"
              }`}>
                <IoStatsChartOutline style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '20px'
                }} />
                <span style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '15px'
                }}>
                  Seguimiento
                </span>
              </div>
            )}
          </NavLink>

          <NavLink to="notificaciones" className="block">
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e0f2fe] font-semibold"
                  : "hover:bg-gray-50"
              }`}>
                <IoNotificationsOutline style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '20px'
                }} />
                <span style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '15px'
                }}>
                  Notificaciones
                </span>
              </div>
            )}
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-60">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="py-4 pr-6 flex items-center justify-end gap-4">
            {/* Notification Icon */}
            <div className="relative" onClick={() => navigate("/dashboard/notificaciones")}>
              <FaBell className="text-xl text-gray-600 cursor-pointer" />
              {notificacionesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificacionesCount}
                </span>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300" />
                )}
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{rol || "Administrador"}</div>
                  <div className="text-xs text-gray-600">{institucion || "Normal Superior"}</div>
                </div>
              </button>

              {openProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <button
                    onClick={irPerfil}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
                  >
                    Perfil
                  </button>
                  <button
                    onClick={cerrarSesion}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
