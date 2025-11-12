// src/components/dashboard/Settings.tsx
import React, { useEffect, useState } from "react";
import { FaShieldAlt, FaKey } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { apiUrl, authHeaders } from "@/utils/api";

type TabKey = "institucion" | "seguridad";

const Configuracion: React.FC = () => {
  const location = useLocation();
  const [tab, setTab] = useState<TabKey>("institucion");

  // abrir seguridad si viene ?view=password
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if ((params.get("view") || "").toLowerCase() === "password") {
      setTab("seguridad");
    }
  }, [location.search]);


  const [msg, setMsg] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const show = (tipo: "ok" | "err", texto: string) => {
    setMsg({ tipo, texto });
    setTimeout(() => setMsg(null), 3500);
  };

  
  const [pwdActual, setPwdActual] = useState("");
  const [pwdNueva, setPwdNueva] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pwdActual || !pwdNueva || !pwdConfirm) {
      show("err", "Completa todos los campos.");
      return;
    }
    if (pwdNueva.length < 6) {
      show("err", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (pwdNueva !== pwdConfirm) {
      show("err", "Las contraseñas nuevas no coinciden.");
      return;
    }

    setSavingPwd(true);
    try {
      const r = await fetch(apiUrl('/admin/perfil/cambiar-password'), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ actual: pwdActual, nueva: pwdNueva }),
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        show("err", txt || "No se pudo actualizar la contraseña.");
        return;
      }

      show("ok", "Contraseña actualizada.");
      setPwdActual("");
      setPwdNueva("");
      setPwdConfirm("");
    } catch {
      show("err", "Error de red al actualizar la contraseña.");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {tab === "seguridad" && (
        <div className="rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FaShieldAlt className="text-blue-600" />
            Seguridad
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Cambia tu contraseña. Asegúrate de elegir una contraseña segura que no uses en otros sitios.
          </p>

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

          <form
            onSubmit={submitPassword}
            className="flex flex-col gap-4 w-full max-w-lg" 
          >
            <PasswordInput
              label="Contraseña actual"
              value={pwdActual}
              onChange={setPwdActual}
              autoComplete="current-password"
            />
            <PasswordInput
              label="Nueva contraseña"
              value={pwdNueva}
              onChange={setPwdNueva}
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirmar contraseña"
              value={pwdConfirm}
              onChange={setPwdConfirm}
              autoComplete="new-password"
            />

            <div className="mt-2">
              <button
                type="submit"
                disabled={savingPwd}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
              >
                <FaKey />
                {savingPwd ? "Guardando..." : "Guardar contraseña"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


const PasswordInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}> = ({ label, value, onChange, autoComplete }) => (
  <label className="block">
    <span className="text-sm text-gray-600">{label}</span>
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
      placeholder={label}
    />
  </label>
);

export default Configuracion;
