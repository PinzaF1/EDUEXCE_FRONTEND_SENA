// src/assets/Dashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaUserGraduate, FaChartLine, FaBell, FaGraduationCap } from "react-icons/fa";

/* ===== Base URL (sin / al final) ===== */
const RAW_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  "https://overvaliantly-discourseless-delilah.ngrok-free.dev";
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

    cargarPerfil();
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
  const irCambiarPassword = () => {
    setOpenProfile(false);
    navigate("/admin/cambiar-password");
  };
  const cerrarSesion = () => {
    setOpenProfile(false);
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombre_institucion");
    localStorage.removeItem("last_login");
    navigate("/", { replace: true });
  };

  /* ===== Estilos de links (subrayado degradado sutil) ===== */
  const baseLink =
    "relative inline-flex items-center gap-2 px-1 pb-2 text-sm md:text-[15px] text-blue-700/80 hover:text-blue-800 transition";
  const linkUnderline =
    "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:rounded-full after:bg-gradient-to-r after:from-blue-300 after:to-sky-200 after:transition-all after:duration-300 hover:after:w-full";
  const linkActive =
    "relative inline-flex items-center gap-2 px-1 pb-2 text-sm md:text-[15px] text-blue-900 font-semibold after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-blue-400 after:to-sky-300";

  const profileBtn =
    "inline-flex items-center gap-3 bg-transparent rounded-full px-2 py-1.5 text-sm hover:bg-gray-50 transition";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#eaf2ff] to-[#f7fbff]">
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-screen-xl w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-2">
            {/* Marca (a la izquierda) */}
            <div className="flex items-center gap-3 shrink-0">
              <AppLogo />
              <div className="leading-tight">
                <div className="text-[18px] md:text-[20px] font-extrabold text-[#FFFFF] tracking-wide">
                  EduExce
                </div>
                <div className="text-[11px] text-gray-500 hidden sm:block">
                  Dashboard Institucional
                </div>
              </div>
            </div>

            {/* Nav (alineado a la derecha, cerca del perfil) */}
            <nav className="flex-1 overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-end gap-6 sm:gap-8 min-w-max pr-2">
                <NavLink
                  to=""
                  end
                  className={({ isActive }) => (isActive ? linkActive : `${baseLink} ${linkUnderline}`)}
                >
                  <FaHome />
                  <span>Inicio</span>
                </NavLink>

                <NavLink
                  to="estudiantes"
                  className={({ isActive }) => (isActive ? linkActive : `${baseLink} ${linkUnderline}`)}
                >
                  <FaUserGraduate />
                  <span>Estudiantes</span>
                </NavLink>

                <NavLink
                  to="seguimiento"
                  className={({ isActive }) => (isActive ? linkActive : `${baseLink} ${linkUnderline}`)}
                >
                  <FaChartLine />
                  <span>Seguimiento</span>
                </NavLink>

                <NavLink
                  to="notificaciones"
                  className={({ isActive }) => (isActive ? linkActive : `${baseLink} ${linkUnderline}`)}
                >
                  <FaBell />
                  <span>Notificaciones</span>
                </NavLink>
              </div>
            </nav>

            {/* Perfil (derecha) */}
            <div className="relative shrink-0" ref={profileRef}>
              <button onClick={() => setOpenProfile(!openProfile)} className={profileBtn}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Logo institución"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                )}
                <div className="text-left leading-tight max-w-[10.5rem]">
                  <div className="text-gray-800 font-semibold text-xs truncate">
                    {rol || "Administrador"}
                  </div>
                  <div className="text-gray-600 text-[11px] truncate">{institucion || "—"}</div>
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
                    onClick={irCambiarPassword}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
                  >
                    Cambiar contraseña
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
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-screen-xl w-full px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
