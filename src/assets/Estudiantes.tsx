// src/assets/Estudiantes.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaSearch, FaPlus, FaFileUpload, FaEdit, FaTrash,
  FaGraduationCap, FaToggleOn, FaToggleOff, FaTimes, FaUpload
} from "react-icons/fa";

/* API */
const BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") ||
  "https://overvaliantly-discourseless-delilah.ngrok-free.dev";
const api = (p = "") => `${BASE_URL}${p.startsWith("/") ? p : "/" + p}`;
const token = () => {
  try {
    return (
      localStorage.getItem("token") ||
      JSON.parse(localStorage.getItem("auth") || "{}")?.token ||
      ""
    );
  } catch {
    return "";
  }
};
const hdrs = () => ({
  Authorization: `Bearer ${token()}`,
  "ngrok-skip-browser-warning": "true",
});
async function jfetch(url: string, init: RequestInit = {}) {
  const r = await fetch(url, init);
  const t = await r.text();
  const d = t ? JSON.parse(t) : {};
  if (!r.ok) throw new Error(d.error || d.detalle || `HTTP ${r.status}`);
  return d;
}

/* utils */
const norm = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const starts = (a: string, b: string) => norm(a).startsWith(norm(b));
const toBool = (v: any) =>
  typeof v === "boolean"
    ? v
    : typeof v === "number"
    ? v === 1
    : typeof v === "string"
    ? v.toLowerCase() === "true" || v === "1"
    : false;

/* tipos */
type Estudiante = {
  id_usuario: number;
  tipo_documento: string;
  numero_documento: string;
  nombre: string;
  apellido: string;
  grado: string | number | null;
  curso: string | null;
  jornada: string | null;
  correo: string | null;
  is_active?: boolean;
};

/* UI */
type Opt = { value: string; label: string };
const NiceSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  className?: string;
}> = ({ value, onChange, options, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label =
    options.find((o) => o.value === value)?.label || options[0]?.label || "";
  useEffect(() => {
    const md = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const ek = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", md);
    document.addEventListener("keydown", ek);
    return () => {
      document.removeEventListener("mousedown", md);
      document.removeEventListener("keydown", ek);
    };
  }, []);
  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-left focus:ring-2 focus:ring-blue-500"
      >
        <span>{label}</span>
        <span
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                    o.value === value ? "bg-blue-600 text-white" : "hover:bg-blue-50 text-gray-700"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Confirm: React.FC<{
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  confirmColor?: "red" | "green" | "blue";
  onConfirm: () => void;
  onClose: () => void;
}> = ({
  open,
  title,
  message,
  confirmText = "Confirmar",
  confirmColor = "red",
  onConfirm,
  onClose,
}) => {
  if (!open) return null;
  const color =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-700"
      : confirmColor === "green"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-blue-600 hover:bg-blue-700";
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border p-5">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="mt-2 text-gray-600 text-sm">{message}</div>
        <div className="mt-5 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-xl border hover:bg-gray-50" onClick={onClose}>
            Cancelar
          </button>
          <button className={`px-4 py-2 rounded-xl text-white ${color}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast: React.FC<{
  text: string;
  type?: "ok" | "err" | "info";
  onClose: () => void;
}> = ({ text, type = "info", onClose }) => {
  const base = "fixed top-4 right-4 z-[80] rounded-xl px-4 py-3 flex gap-3 items-start border shadow-sm";
  const cls =
    type === "ok"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : type === "err"
      ? "bg-rose-50 text-rose-800 border-rose-200"
      : "bg-sky-50 text-sky-800 border-sky-200";
  return (
    <div role="status" aria-live="polite" className={`${base} ${cls}`}>
      <span className="pt-[2px]">•</span>
      <div className="text-sm">{text}</div>
      <button className="ml-2 opacity-80 hover:opacity-100" onClick={onClose} aria-label="Cerrar notificación">
        <FaTimes />
      </button>
    </div>
  );
};

/* Componente */
const Estudiantes: React.FC = () => {
  const [rows, setRows] = useState<Estudiante[]>([]);
  const [toast, setToast] = useState<{ text: string; type?: "ok" | "err" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);

  const [grado, setGrado] = useState(""),
    [curso, setCurso] = useState(""),
    [jornada, setJornada] = useState(""),
    [q, setQ] = useState("");
  const [crear, setCrear] = useState(false),
    [inst, setInst] = useState("—");
  const [form, setForm] = useState({
    nombre: "", apellido: "", tipo_documento: "", numero_documento: "",
    grado: "", curso: "", jornada: "", correo: "",
  });
  const [editOpen, setEditOpen] = useState(false),
    [edit, setEdit] = useState<Partial<Estudiante>>({}),
    [editMsg, setEditMsg] = useState("");
  const [confirm, setConfirm] = useState<{ t: "inactivar" | "eliminar"; e?: Estudiante } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [impOpen, setImpOpen] = useState(false), [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const say = (text: string, type?: "ok" | "err" | "info") => { setToast({ text, type }); setTimeout(() => setToast(null), 4200); };
  const initials = (e: Estudiante) =>
    `${(e.nombre || "•").trim()[0]?.toUpperCase() || "•"}${(e.apellido || "").trim()[0]?.toUpperCase() || ""}`;

  // Normaliza is_active leyendo is_active / is_activo / isActive / activo
  const normRow = (r: any): Estudiante => ({
    id_usuario: Number(r?.id_usuario ?? r?.idUsuario ?? r?.usuario_id ?? r?.user_id ?? r?.id ?? r?._id) || 0,
    tipo_documento: String(r?.tipo_documento ?? r?.tipoDocumento ?? r?.tdoc ?? ""),
    numero_documento: String(r?.numero_documento ?? r?.numeroDocumento ?? r?.ndocumento ?? r?.documento ?? ""),
    nombre: r?.nombre ?? r?.nombres ?? r?.nombre_usuario ?? "",
    apellido: r?.apellido ?? r?.apellidos ?? "",
    grado: r?.grado ?? null,
    curso: r?.curso ?? null,
    jornada: r?.jornada ?? null,
    correo: r?.correo ?? null,
    is_active: toBool(r?.is_active ?? r?.is_activo ?? r?.isActive ?? r?.activo ?? true),
  });

  useEffect(() => {
    (async () => {
      if (!token()) return;
      try {
        const d = await jfetch(api("/admin/perfil"), { headers: hdrs() });
        const i = d.institucion || d.data || {};
        setInst(i.nombre_institucion ?? i.nombreInstitucion ?? "—");
      } catch {
        setInst("—");
      }
    })();
  }, []);

  const listar = async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      if (grado) qs.set("grado", grado);
      if (curso) qs.set("curso", curso);
      if (jornada) qs.set("jornada", jornada);
      if (q) qs.set("q", q);
      qs.set("_ts", String(Date.now()));
      const d = await jfetch(api(`/admin/estudiantes?${qs.toString()}`), {
        headers: { ...hdrs(), "Cache-Control": "no-cache" },
      });
      setRows((Array.isArray(d) ? d : []).map(normRow));
      setPage(1);
    } catch (e: any) {
      say(e.message || "No se pudo cargar", "err");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (token()) listar(); }, []);

  const onCrear = async (ev: React.FormEvent) => {
    ev.preventDefault();
    try {
      await jfetch(api("/admin/estudiantes"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...hdrs() },
        body: JSON.stringify({
          ...form,
          correo: form.correo?.trim() || null,
          grado: form.grado || null,
          curso: form.curso || null,
          jornada: form.jornada || null,
        }),
      });
      say("Estudiante registrado.", "ok");
      setCrear(false);
      setForm({ nombre: "", apellido: "", tipo_documento: "", numero_documento: "", grado: "", curso: "", jornada: "", correo: "" });
      await listar();
    } catch (e: any) {
      say(e.message || "Error al registrar", "err");
    }
  };

  const abrirEditar = (e: Estudiante) => { setEditMsg(""); setEdit({ ...e }); setEditOpen(true); };
  const guardarEditar = async () => {
    try {
      if (!edit?.id_usuario) return setEditMsg("Falta id");
      await jfetch(api(`/admin/estudiantes/${edit.id_usuario}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...hdrs() },
        body: JSON.stringify({
          nombre: (edit.nombre || "").trim(),
          apellido: (edit.apellido || "").trim(),
          correo: (edit.correo || "").trim(),
          grado: edit.grado === "" ? undefined : edit.grado,
          curso: edit.curso,
          jornada: edit.jornada,
          tipo_documento: edit.tipo_documento,
          numero_documento: edit.numero_documento,
        }),
      });
      say("Estudiante actualizado", "ok");
      setEditOpen(false);
      await listar();
    } catch (e: any) {
      setEditMsg(e.message || "Error al actualizar");
    }
  };

  /* Activar/Inactivar → manda las TRES variantes para que el backend no la ignore */
  const reactivar = async (e: Estudiante) => {
    const id = e.id_usuario;
    setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: true } : r))); // Actualiza localmente
    try {
      // Aquí debes mandar el campo is_active al backend para activarlo
      await jfetch(api(`/admin/estudiantes/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...hdrs() },
        body: JSON.stringify({ is_active: true })  // Asegúrate de mandar is_active
      });
      say("Estudiante reactivado.", "ok");
      await listar(); // Cargar los datos actualizados
    } catch (err: any) {
      setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: false } : r))); // Si hay error, revertir el cambio
      say(err.message || "Error al reactivar", "err");
    }
  };

const pedirInactivar = (e: Estudiante) => setConfirm({ t: "inactivar", e });
const confirmarInactivar = async () => {
  if (!confirm?.e) return;
  const id = confirm.e.id_usuario;
  setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: false } : r)));  // Actualiza localmente
  try {
    const response = await jfetch(api(`/admin/estudiantes/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...hdrs() },
      body: JSON.stringify({ is_active: false }),  // Asegúrate de enviar is_active
    });
    say("Estudiante inactivado.", "ok");
    setConfirm(null);
    await listar();  // Recargar datos
  } catch (e: any) {
    setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: true } : r)));  // Revertir si falla
    say(e.message || "Error al inactivar", "err");
  }
};



 const pedirEliminar = (e: Estudiante) => setConfirm({ t: "eliminar", e });
const confirmarEliminar = async () => {
    if (!confirm?.e) return;
    const id = confirm.e.id_usuario;
    try {
      // Enviar la solicitud DELETE al backend
      const r = await fetch(api(`/admin/estudiantes/${id}`), {
        method: "DELETE", headers: hdrs()
      });
      if (r.status === 409) {
        // Si no se puede eliminar porque el estudiante tiene historial
        const j = await r.json().catch(() => ({}));
        say(j?.error || "Tiene historial; solo puede inactivarse.", "info");
      } else if (!r.ok) {
        // Si la respuesta no es correcta
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || j.detalle || "No se pudo eliminar");
      } else {
        say("Estudiante eliminado.", "ok");
        await listar(); // Recargar datos después de eliminar
      }
    } catch (e: any) {
      say(e.message || "Error al eliminar", "err");
    } finally {
      setConfirm(null); // Cerrar el modal de confirmación
    }
};


  /* Importar */
  const abrirArchivo = () => fileRef.current?.click();
  const importar = async (file: File) => {
    const A = api("/admin/estudiantes/importar"), B = api("/admin/estudiantes/import");
    const up = async (u: string) => {
      const fd = new FormData();
      ["estudiantes", "file", "archivo"].forEach((k) => fd.append(k, file));
      return fetch(u, { method: "POST", headers: hdrs(), body: fd });
    };
    try {
      let r = await up(A);
      if (r.status === 404) r = await up(B);
      if (r.ok) {
        const d = await r.json().catch(() => ({}));
        say(
          `Importado: ${d.insertados ?? 0} nuevos, ${d.actualizados ?? 0} act., ${d.omitidos_por_existir ?? 0} omitidos, ${d.duplicados_en_archivo ?? 0} duplicados.`,
          "ok"
        );
        setImpOpen(false);
        await listar();
        return;
      }
      const t = await file.text(), head = t.split(/\r?\n/)[0] || "";
      const sep = (head.match(/;/g)?.length ?? 0) > (head.match(/,/g)?.length ?? 0) ? ";" : ",";
      const rows: string[][] = [];
      let row: string[] = [], cur = "", q = false;
      for (let i = 0; i < t.length; i++) {
        const ch = t[i], nx = t[i + 1];
        if (ch === '"') { if (q && nx === '"') { cur += '"'; i++; } else q = !q; }
        else if (ch === sep && !q) { row.push(cur); cur = ""; }
        else if ((ch === "\n" || ch === "\r") && !q) {
          if (cur !== "" || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; }
          if (ch === "\r" && nx === "\n") i++;
        } else cur += ch;
      }
      if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
      if (!rows.length) return say("CSV vacío o ilegible", "err");
      const h = rows[0].map((s) => s.trim().toLowerCase());
      const idx = (k: string) => h.indexOf(k);
      const filas = rows
        .slice(1)
        .filter((rw) => rw.some((c) => c && c.trim() !== ""))
        .map((cols) => {
          const v = (k: string) => (idx(k) >= 0 ? (cols[idx(k)] || "").trim() : "");
          return {
            tipo_documento: v("tipo") || v("tipo_documento") || "",
            numero_documento: v("documento") || v("numero_documento") || "",
            nombre: v("nombre") || v("nombres") || "",
            apellido: v("apellido") || v("apellidos") || "",
            grado: v("grado") || null,
            curso: v("curso") || null,
            jornada: v("jornada") || null,
            correo: v("correo") || v("email") || "",
          };
        });
      const send = (u: string) =>
        fetch(u, { method: "POST", headers: { "Content-Type": "application/json", ...hdrs() }, body: JSON.stringify({ filas }) });
      let rj = await send(A);
      let d2: any = await rj.json().catch(() => ({}));
      if (rj.status === 404) {
        const r2 = await send(B);
        d2 = await r2.json().catch(() => ({}));
        if (!r2.ok) return say(d2.error || d2.detalle || "Error al importar", "err");
      } else if (!rj.ok) {
        return say(d2.error || d2.detalle || "Error al importar", "err");
      }
      say(
        `Importado: ${d2.insertados ?? 0} nuevos, ${d2.actualizados ?? 0} act., ${d2.omitidos_por_existir ?? 0} omitidos, ${d2.duplicados_en_archivo ?? 0} duplicados.`,
        "ok"
      );
      setImpOpen(false);
      await listar();
    } catch (e: any) {
      say(e.message || "No se pudo importar", "err");
    }
  };

  /* búsqueda + paginación */
  const filtrados = useMemo(
    () => (q ? rows.filter((e) => starts(e.nombre, q) || starts(e.apellido, q)) : rows),
    [rows, q]
  );
  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const current = Math.min(page, totalPages);
  const slice = filtrados.slice((current - 1) * pageSize, (current - 1) * pageSize + pageSize);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {toast && <Toast text={toast.text} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Estudiantes</h1>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold text-blue-600">{loading ? "…" : filtrados.length}</span> estudiantes
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-[260px]">
          <div className="flex border border-gray-300 rounded-xl overflow-hidden shadow-sm">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre o apellido..."
              className="px-4 py-2 w-full outline-none text-sm"
            />
            <button
              onClick={() => { setPage(1); listar(); }}
              className="flex items-center gap-2 px-4 text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaSearch className="text-sm" />
              <span className="text-sm font-medium">Buscar</span>
            </button>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm" onClick={() => setCrear(true)}>
          <FaPlus className="text-sm" /> Nuevo Estudiante
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => setImpOpen(true)}>
          <FaFileUpload className="text-sm" /> Importar CSV
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white mb-6 shadow-sm">
        <div className="px-5 py-4 border-b"><span className="text-sm text-gray-700 font-medium">Filtros</span></div>
        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Grado</label>
            <NiceSelect className="w-full" value={grado} onChange={setGrado}
              options={[{ value: "", label: "Todos los grados" }, { value: "10", label: "10°" }, { value: "11", label: "11°" }]} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Curso</label>
            <NiceSelect className="w-full" value={curso} onChange={setCurso}
              options={[{ value: "", label: "Todos los cursos" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Jornada</label>
            <NiceSelect className="w-full" value={jornada} onChange={setJornada}
              options={[{ value: "", label: "Todas las jornadas" }, { value: "mañana", label: "Mañana" }, { value: "tarde", label: "Tarde" }]} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando…</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12">
            <FaGraduationCap className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay estudiantes</h3>
            <p className="text-gray-500 text-sm">Agrega uno nuevo o importa desde un archivo</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Nombre","Apellido","Documento","Curso","Jornada","Correo","Estado","Acciones"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slice.map((e) => (
                    <tr key={e.id_usuario} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600">{initials(e)}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{e.nombre || "—"}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{e.apellido || "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {e.tipo_documento} {e.numero_documento}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {e.grado || "—"}{e.grado ? "°" : ""} {e.curso || ""}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{e.jornada || "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{e.correo || "—"}</td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            title={e.is_active ? "Inactivar" : "Activar"}
                            onClick={() => (e.is_active ? setConfirm({ t: "inactivar", e }) : reactivar(e))}
                            className={e.is_active ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                          >
                            {e.is_active ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
                          </button>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              e.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {e.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1" title="Editar" onClick={() => abrirEditar(e)}>
                            <FaEdit size={14} />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1" title="Eliminar" onClick={() => pedirEliminar(e)}>
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <div className="flex items-center gap-1">
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={current === 1}
                >
                  Anterior
                </button>
                {(() => {
                  const total = totalPages;
                  if (total <= 7)
                    return Array.from({ length: total }, (_, i) => i + 1).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 rounded border text-sm ${
                          p === current ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    ));
                  const out: (number | string)[] = [1],
                    l = Math.max(2, current - 1),
                    r = Math.min(total - 1, current + 1);
                  if (l > 2) out.push("…");
                  for (let p = l; p <= r; p++) out.push(p);
                  if (r < total - 1) out.push("…");
                  out.push(total);
                  return out.map((p, i) =>
                    typeof p === "number" ? (
                      <button
                        key={i}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 rounded border text-sm ${
                          p === current ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={i} className="px-2 text-gray-500 select-none">…</span>
                    )
                  );
                })()}
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={current === totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {crear && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-blue-600" />
                <h2 className="text-xl font-semibold">Registrar Nuevo Estudiante</h2>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setCrear(false)}>✕</button>
            </div>
            <form onSubmit={onCrear} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="w-full border border-gray-300 rounded-lg p-3" required />
                <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Apellido" className="w-full border border-gray-300 rounded-lg p-3" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NiceSelect className="w-full" value={form.tipo_documento} onChange={(v) => setForm({ ...form, tipo_documento: v })}
                  options={[{ value: "", label: "Tipo de Documento" }, { value: "TI", label: "Tarjeta de Identidad" }, { value: "CC", label: "Cédula de Ciudadanía" }, { value: "CE", label: "Cédula de Extranjería" }]} />
                <input value={form.numero_documento} onChange={(e) => setForm({ ...form, numero_documento: e.target.value })} placeholder="Número de documento" className="w-full border border-gray-300 rounded-lg p-3" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <NiceSelect className="w-full" value={form.grado} onChange={(v) => setForm({ ...form, grado: v })}
                  options={[{ value: "", label: "Grado" }, { value: "10", label: "Décimo (10°)" }, { value: "11", label: "Undécimo (11°)" }]} />
                <NiceSelect className="w-full" value={form.curso} onChange={(v) => setForm({ ...form, curso: v })}
                  options={[{ value: "", label: "Curso" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} />
                <NiceSelect className="w-full" value={form.jornada} onChange={(v) => setForm({ ...form, jornada: v })}
                  options={[{ value: "", label: "Jornada" }, { value: "mañana", label: "Mañana" }, { value: "tarde", label: "Tarde" }]} />
              </div>
              <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="Correo electrónico" className="w-full border border-gray-300 rounded-lg p-3" required />
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                <p className="text-gray-600">{inst}</p>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setCrear(false)}>Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><FaPlus size={14} /> Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FaEdit className="text-blue-600" />
                <h2 className="text-xl font-semibold">Editar Estudiante</h2>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setEditOpen(false)}>✕</button>
            </div>
            {editMsg && (
              <div className="mb-3 p-2 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{editMsg}</div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={edit.nombre || ""} onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} placeholder="Nombre" className="w-full border border-gray-300 rounded-lg p-3" />
                <input value={edit.apellido || ""} onChange={(e) => setEdit({ ...edit, apellido: e.target.value })} placeholder="Apellido" className="w-full border border-gray-300 rounded-lg p-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={edit.tipo_documento || ""} onChange={(e) => setEdit({ ...edit, tipo_documento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Tipo de Documento</option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                </select>
                <input value={edit.numero_documento || ""} onChange={(e) => setEdit({ ...edit, numero_documento: e.target.value })}
                  placeholder="Número de documento" className="w-full border border-gray-300 rounded-lg p-3" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input value={(edit.grado as any) ?? ""} onChange={(e) => setEdit({ ...edit, grado: e.target.value })} placeholder="Grado (10/11)" className="w-full border border-gray-300 rounded-lg p-3" />
                <input value={edit.curso || ""} onChange={(e) => setEdit({ ...edit, curso: e.target.value })} placeholder="Curso (A/B/C)" className="w-full border border-gray-300 rounded-lg p-3" />
                <select value={edit.jornada || ""} onChange={(e) => setEdit({ ...edit, jornada: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Jornada</option>
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                </select>
              </div>
              <input value={edit.correo || ""} onChange={(e) => setEdit({ ...edit, correo: e.target.value })} placeholder="Correo" className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setEditOpen(false)}>Cancelar</button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={guardarEditar}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {impOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-[60]">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Importar Estudiantes</h3>
              <button className="p-2 rounded hover:bg-gray-100 text-gray-500" onClick={() => setImpOpen(false)} aria-label="Cerrar">
                <FaTimes />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Sube un archivo CSV o Excel con los datos de los estudiantes</p>
            <div
              className={`rounded-xl border-2 border-dashed ${drag ? "border-blue-500 bg-blue-50" : "border-gray-300"} flex flex-col items-center justify-center py-10 mb-1 transition`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) importar(f); }}
            >
              <FaUpload className="text-3xl text-gray-400 mb-3" />
              <button className="text-blue-600 hover:text-blue-700 font-medium" onClick={abrirArchivo}>Seleccionar archivo</button>
              <p className="text-xs text-gray-500 mt-1">CSV o Excel</p>
              <input ref={fileRef} type="file" hidden accept=".csv,.xlsx,.xls"
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importar(f); }} />
            </div>
          </div>
        </div>
      )}

      <Confirm
        open={!!confirm && confirm.t === "inactivar"}
        title="Inactivar estudiante"
        message={<>¿Estás seguro de <b>inactivar</b> a este estudiante?<br />Podrás reactivarlo desde este mismo panel.</>}
        confirmText="Sí, inactivar"
        confirmColor="red"
        onConfirm={confirmarInactivar}
        onClose={() => setConfirm(null)}
      />
      <Confirm
        open={!!confirm && confirm.t === "eliminar"}
        title="Eliminar estudiante"
        message={<>¿Eliminar definitivamente a este estudiante?<br /><span className="text-gray-500">Si tiene historial, el sistema lo impedirá y deberás inactivarlo.</span></>}
        confirmText="Sí, eliminar"
        confirmColor="red"
        onConfirm={confirmarEliminar}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
};

export default Estudiantes;
