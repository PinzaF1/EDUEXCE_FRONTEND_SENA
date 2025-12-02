// src/assets/perfil.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FaUpload, FaTrash, FaEdit, FaSave, FaTimes, FaImage, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getJSON, putJSON, postJSON } from "@/utils/api";

/* ===== helpers para id y avatar por institución ===== */
type TokenPayload = {
  id_institucion?: number | string;
  id?: number | string;
  [k: string]: any;
};

const decodeToken = (): TokenPayload | null => {
  const token = getToken();
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
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

const setAvatarForInst = (instId: string | null, url: string | null) => {
  const key = avatarKey(instId);
  if (!key) return;
  if (url) localStorage.setItem(key, url);
  else localStorage.removeItem(key);

  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: url,
        oldValue: null,
        storageArea: localStorage,
      })
    );
  } catch {
    const ev = new Event("storage") as any;
    ev.key = key;
    ev.newValue = url;
    window.dispatchEvent(ev);
  }
};
/* ===================================================== */

type PerfilInstitucion = {
  id_institucion?: string | number;
  idInstitucion?: string | number;
  nombre_institucion?: string;
  nombreInstitucion?: string;
  institucion?: string;
  codigo_dane?: string;
  codigoDane?: string;
  direccion?: string;
  telefono?: string;
  jornada?: string;
  correo?: string;
  ciudad?: string;
  departamento?: string;
  logo_url?: string | null;
  logoUrl?: string | null;
};

type ApiPerfilResponse = {
  institucion?: PerfilInstitucion;
  rol?: string;
} | any;

const Perfil: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [msg, setMsg] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const show = (tipo: "ok" | "err", texto: string) => {
    setMsg({ tipo, texto });
    setTimeout(() => setMsg(null), 3500);
  };

  // id de institución activo
  const [instId, setInstId] = useState<string | null>(getActiveInstitutionId());

  // Logo (desde LS por institución)
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    const key = avatarKey(getActiveInstitutionId());
    return key ? localStorage.getItem(key) : null;
  });
  const [subiendo, setSubiendo] = useState(false);

  // Datos institución
  const [nombreInst, setNombreInst] = useState("");
  const [codigoDane, setCodigoDane] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [jornada, setJornada] = useState("");
  const [correoInst, setCorreoInst] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [departamento, setDepartamento] = useState("");

  const [editando, setEditando] = useState(false);

  // Modal cambiar contraseña
  const [openPass, setOpenPass] = useState(false);
  const [passOld, setPassOld] = useState("");
  const [passNew, setPassNew] = useState("");
  const [passRep, setPassRep] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const aplicarInstitution = (obj?: PerfilInstitucion | null) => {
    if (!obj) return;

    const nombre = obj.nombre_institucion ?? obj.nombreInstitucion ?? obj.institucion ?? "";
    const dane = obj.codigo_dane ?? obj.codigoDane ?? "";
    const logo = (obj.logo_url ?? obj.logoUrl ?? null) || null;

    setNombreInst(nombre || "");
    setCodigoDane(dane || "");
    setDireccion(obj.direccion || "");
    setTelefono(obj.telefono || "");
    setJornada(obj.jornada || "");
    setCorreoInst(obj.correo || "");
    setCiudad(obj.ciudad || "");
    setDepartamento(obj.departamento || "");

    if (logo) {
      setLogoUrl(logo);
      setAvatarForInst(instId, logo);
    }
  };

  // Carga inicial desde GET /admin/perfil
  useEffect(() => {
    (async () => {
      try {
        const data: ApiPerfilResponse = await getJSON('/admin/perfil');
        const perfil: PerfilInstitucion = data?.institucion ?? (data as PerfilInstitucion);

        // fijar id y sincronizar avatar de esa institución
        const id = perfil?.id_institucion ?? perfil?.idInstitucion ?? null;
        if (id != null) {
          const idStr = String(id);
          setInstId(idStr);
          localStorage.setItem("id_institucion", idStr);

          const key = avatarKey(idStr);
          const localAvatar = key ? localStorage.getItem(key) : null;
          const logo = (perfil.logo_url ?? perfil.logoUrl ?? null) as string | null;

          const resolved = logo ?? localAvatar ?? null;
          setLogoUrl(resolved);
          if (logo) setAvatarForInst(idStr, logo);
        }

        aplicarInstitution(perfil || null);
      } catch (err: any) {
        console.error('[Profile] Error cargando perfil:', err);
        if (err && err.status === 401) {
          localStorage.removeItem('token');
          show('err', 'Sesión expirada. Inicia sesión nuevamente.');
        } else {
          show("err", err?.message || "Error al cargar el perfil. Intente nuevamente.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const snapshot = useMemo(
    () => ({
      nombre_institucion: nombreInst,
      codigo_dane: codigoDane,
      direccion,
      telefono,
      jornada,
      correo: correoInst,
      ciudad,
      departamento,
    }),
    [nombreInst, codigoDane, direccion, telefono, jornada, correoInst, ciudad, departamento]
  );

  const cancelar = () => {
    setEditando(false);
    (async () => {
      try {
        setLoading(true);
        const data: ApiPerfilResponse = await getJSON('/admin/perfil');
        const perfil: PerfilInstitucion = data?.institucion ?? (data as PerfilInstitucion);
        aplicarInstitution(perfil || null);
      } catch (err: any) {
        console.error('[Profile] Error recargando perfil en cancelar:', err);
      } finally {
        setLoading(false);
      }
    })();
  };

  // PUT /admin/perfil con los campos del formulario
  const guardar = async () => {
    try {
      setSaving(true);
      const respJson = await putJSON('/admin/perfil', snapshot).catch((e:any) => { throw e; });
      const perfil: PerfilInstitucion = respJson?.institucion ?? respJson ?? snapshot;

      aplicarInstitution(perfil as PerfilInstitucion);
      show("ok", "Cambios guardados.");
      setEditando(false);
    } catch (err: any) {
      console.error('[Profile] Error guardando perfil:', err);
      show("err", err?.message || "Error al guardar. Intente nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  // ===== logo (local por ahora, pero atado a la institución) =====
  const onPickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setSubiendo(true);
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setLogoUrl(url);
      setAvatarForInst(instId, url);
      show("ok", "Imagen actualizada.");
    };
    reader.readAsDataURL(f);
    setSubiendo(false);
  };

  const quitarLogo = () => {
    setLogoUrl(null);
    setAvatarForInst(instId, null);
    show("ok", "Imagen eliminada.");
  };

  const cambiarPassword = async () => {
    if (!passOld || !passNew || !passRep) {
      show("err", "Completa todos los campos.");
      return;
    }
    if (passNew !== passRep) {
      show("err", "Las contraseñas no coinciden.");
      return;
    }
    try {
      setPassLoading(true);
      await postJSON('/admin/cambiar-password', { actual: passOld, nueva: passNew });
      show("ok", "Contraseña actualizada.");
      setOpenPass(false);
      setPassOld("");
      setPassNew("");
      setPassRep("");
    } catch (err: any) {
      console.error('[Profile] Error cambiando contraseña:', err);
      show("err", err?.message || "Error al cambiar contraseña.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {msg && (
        <div
          className={`mb-4 p-3 rounded-lg border text-sm ${
            msg.tipo === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {msg.texto}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ----------- izquierda: Foto / Logo ----------- */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Foto / Logo de la institución</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border bg-gray-50 flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} className="w-full h-full object-cover" alt="logo" />
                ) : (
                  <FaImage className="text-gray-300 text-3xl" />
                )}
              </div>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm cursor-pointer">
                  <FaUpload />
                  {subiendo ? "Subiendo..." : "Subir"}
                  <input type="file" accept="image/*" hidden onChange={onPickLogo} disabled={subiendo} />
                </label>
                <button
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                  onClick={quitarLogo}
                  disabled={!logoUrl}
                >
                  <FaTrash />
                  Quitar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ----------- derecha: Datos de la institución ----------- */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Datos de la institución</h3>
              {!editando ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPassOld("");
                      setPassNew("");
                      setPassRep("");
                      setOpenPass(true);
                    }}
                    className="px-3 py-2 rounded-lg text-sm border border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Cambiar contraseña
                  </button>
                  <button
                    onClick={() => setEditando(true)}
                    className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
                  >
                    <FaEdit />
                    Editar
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={guardar}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-60"
                  >
                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={cancelar}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
                  >
                    <FaTimes />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombre de la institución" value={nombreInst} onChange={setNombreInst} disabled={!editando || loading} />
              <Input label="Código DANE" value={codigoDane} onChange={setCodigoDane} disabled={!editando || loading} />
              <Input label="Dirección" value={direccion} onChange={setDireccion} disabled={!editando || loading} />
              <Input label="Teléfono" value={telefono} onChange={setTelefono} disabled={!editando || loading} />
              <Input label="Jornada" value={jornada} onChange={setJornada} disabled={!editando || loading} />
              <Input label="Correo de contacto" value={correoInst} onChange={setCorreoInst} disabled={!editando || loading} />
              <Input label="Ciudad" value={ciudad} onChange={setCiudad} disabled={!editando || loading} />
              <Input label="Departamento" value={departamento} onChange={setDepartamento} disabled={!editando || loading} />
            </div>
          </div>
        </div>
      </div>

      {openPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenPass(false)} />
          <form className="relative bg-white w-full max-w-md mx-auto rounded-lg shadow-lg border p-5" autoComplete="off">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Cambiar contraseña</h4>
              <button className="text-gray-400 hover:text-gray-600" onClick={(e) => { e.preventDefault(); setOpenPass(false); }}>
                <FaTimes />
              </button>
            </div>
            <div className="space-y-3">
              <FieldPassword label="Contraseña actual" value={passOld} onChange={setPassOld} />
              <FieldPassword label="Nueva contraseña" value={passNew} onChange={setPassNew} />
              <FieldPassword label="Confirmar nueva contraseña" value={passRep} onChange={setPassRep} />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={(e) => { e.preventDefault(); setOpenPass(false); }}>
                Cancelar
              </button>
              <button
                className="px-3 py-2 rounded-md text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 inline-flex items-center gap-2"
                onClick={(e) => { e.preventDefault(); cambiarPassword(); }}
                disabled={passLoading}
              >
                {passLoading && <FaSpinner className="animate-spin" />}
                {passLoading ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* ===================== helpers UI ===================== */
const Input: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ label, value, onChange, disabled }) => (
  <label className="block">
    <span className="text-sm text-gray-600">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-gray-100"
      placeholder={label}
      autoComplete="off"
    />
  </label>
);

const FieldPassword: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  const name = `pw_${label.replace(/\s+/g, '_').toLowerCase()}`;
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="relative mt-1">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          placeholder={label}
          autoComplete="new-password"
          name={name}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          type="button"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </label>
  );
};

export default Perfil;
