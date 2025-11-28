// src/assets/Estudiantes.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaSearch, FaPlus, FaFileUpload, FaEdit, FaTrash,
  FaToggleOn, FaTimes,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationCircle
} from "react-icons/fa";

/* API */
const BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, "");

if (!BASE_URL) {
  console.error('❌ VITE_API_URL no configurada');
  throw new Error('Missing VITE_API_URL environment variable');
}
const api = (p = "") => {
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${BASE_URL}${path}`;
};
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
const hdrs = (includeContentType = false) => {
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${token()}`,
    "ngrok-skip-browser-warning": "true"
  };
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
};

async function jfetch(url: string, init: RequestInit = {}) {
  const method = init.method || 'GET';
  const includeContentType = method !== 'GET' && method !== 'HEAD';
  
  const defaultInit: RequestInit = {
    method,
    headers: {
      ...hdrs(includeContentType),
      ...(init.headers || {})
    },
    credentials: 'omit',
    mode: 'cors'
  };
  
  if (init.body) {
    defaultInit.body = init.body;
  }
  
  const r = await fetch(url, defaultInit);
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
  direccion?: string | null;
  is_active?: boolean;
  ultima_actividad?: string;
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

/* Componente */
const Estudiantes: React.FC = () => {
  const [rows, setRows] = useState<Estudiante[]>([]);
  const [toast, setToast] = useState<{ text: string; type?: "ok" | "err" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [grado, setGrado] = useState(""),
    [curso, setCurso] = useState(""),
    [jornada, setJornada] = useState(""),
    [q, setQ] = useState("");
  const [crear, setCrear] = useState(false);
  const [form, setForm] = useState({
    nombre: "", apellido: "", tipo_documento: "", numero_documento: "",
    grado: "", curso: "", jornada: "", correo: "", direccion: "",
  });
  const [editOpen, setEditOpen] = useState(false),
    [edit, setEdit] = useState<Partial<Estudiante>>({}),
    [editMsg, setEditMsg] = useState("");
  const [confirm, setConfirm] = useState<{ t: "inactivar" | "eliminar"; e?: Estudiante } | null>(null);
  const [filterActivo, setFilterActivo] = useState<"todos" | "activos" | "inactivos">("todos");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [impOpen, setImpOpen] = useState(false), [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const instName = (typeof window !== 'undefined' ? localStorage.getItem('nombre_institucion') : '') || '';

  const say = (text: string, type?: "ok" | "err" | "info") => { setToast({ text, type }); setTimeout(() => setToast(null), 4200); };

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
    direccion: r?.direccion ?? r?.direccion_residencia ?? null,
    is_active: toBool(r?.is_active ?? r?.is_activo ?? r?.isActive ?? r?.activo ?? true),
    ultima_actividad: r?.updatedAt ?? r?.updated_at ?? r?.last_activity_at ?? r?.ultima_actividad ?? null,
  });

  useEffect(() => {
    (async () => {
      if (!token()) return;
      try {
        await jfetch(api("/admin/perfil"), { headers: hdrs() });
        // eliminado: valor no utilizado
      } catch {
        // noop
      }
    })();
  }, []);

  const listar = async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = new URLSearchParams();
      if (grado) qs.set("grado", grado);
      if (curso) qs.set("curso", curso);
      if (jornada) qs.set("jornada", jornada);
      if (q) qs.set("q", q);
      qs.set("_ts", String(Date.now()));
      console.log("Cargando estudiantes desde:", api(`/admin/estudiantes?${qs.toString()}`));
      const d = await jfetch(api(`/admin/estudiantes?${qs.toString()}`), {
        headers: { "Cache-Control": "no-cache" },
      });
      console.log("Respuesta del servidor:", d);
      setRows((Array.isArray(d) ? d : []).map(normRow));
      setPage(1);
    } catch (e: any) {
      console.error("Error al cargar estudiantes:", e);
      const errorMsg = e.message || "No se pudo cargar la lista de estudiantes";
      setError(errorMsg);
      say(errorMsg, "err");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { 
    if (token()) listar(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (token()) listar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grado, curso, jornada]);

  const onCrear = async (ev: React.FormEvent) => {
    ev.preventDefault();
    try {
      setSubmitting(true);
      await jfetch(api("/admin/estudiantes"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...hdrs() },
        body: JSON.stringify({
          ...form,
          correo: form.correo?.trim() || null,
          direccion: form.direccion?.trim() || null,
          grado: form.grado || null,
          curso: form.curso || null,
          jornada: form.jornada || null,
        }),
      });
      say("Estudiante registrado exitosamente", "ok");
      setCrear(false);
      setForm({ nombre: "", apellido: "", tipo_documento: "", numero_documento: "", grado: "", curso: "", jornada: "", correo: "", direccion: "" });
      await listar();
    } catch (e: any) {
      say(e.message || "Error al registrar estudiante", "err");
    } finally {
      setSubmitting(false);
    }
  };

  const abrirEditar = (e: Estudiante) => { setEditMsg(""); setEdit({ ...e }); setEditOpen(true); };
  const guardarEditar = async () => {
    try {
      if (!edit?.id_usuario) return setEditMsg("Falta id");
      setSubmitting(true);
      await jfetch(api(`/admin/estudiantes/${edit.id_usuario}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...hdrs() },
        body: JSON.stringify({
          nombre: (edit.nombre || "").trim(),
          apellido: (edit.apellido || "").trim(),
          correo: (edit.correo || "").trim(),
          direccion: (edit.direccion || "").trim(),
          grado: edit.grado === "" ? undefined : edit.grado,
          curso: edit.curso,
          jornada: edit.jornada,
          tipo_documento: edit.tipo_documento,
          numero_documento: edit.numero_documento,
        }),
      });
      say("Estudiante actualizado exitosamente", "ok");
      setEditOpen(false);
      await listar();
    } catch (e: any) {
      setEditMsg(e.message || "Error al actualizar estudiante");
    } finally {
      setSubmitting(false);
    }
  };

  /* Activar/Inactivar */
  const reactivar = async (e: Estudiante) => {
    const id = e.id_usuario;
    setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: true } : r)));
    try {
      await jfetch(api(`/admin/estudiantes/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...hdrs() },
        body: JSON.stringify({ is_active: true })
      });
      say("Estudiante reactivado.", "ok");
      await listar();
    } catch (err: any) {
      setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: false } : r)));
      say(err.message || "Error al reactivar", "err");
    }
  };

  const confirmarInactivar = async () => {
    if (!confirm?.e) return;
    const id = confirm.e.id_usuario;
    setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: false } : r)));
    try {
      await jfetch(api(`/admin/estudiantes/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...hdrs() },
        body: JSON.stringify({ is_active: false }),
      });
      say("Estudiante inactivado.", "ok");
      setConfirm(null);
      await listar();
    } catch (e: any) {
      setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: true } : r)));
      say(e.message || "Error al inactivar", "err");
    }
  };

  const pedirEliminar = (e: Estudiante) => setConfirm({ t: "eliminar", e });
  const confirmarEliminar = async () => {
    if (!confirm?.e) return;
    const id = confirm.e.id_usuario;
    try {
      const r = await fetch(api(`/admin/estudiantes/${id}`), {
        method: "DELETE", headers: hdrs()
      });
      if (r.status === 409) {
        const j = await r.json().catch(() => ({}));
        say(j?.error || "Tiene historial; solo puede inactivarse.", "info");
      } else if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || j.detalle || "No se pudo eliminar");
      } else {
        say("Estudiante eliminado.", "ok");
        await listar();
      }
    } catch (e: any) {
      say(e.message || "Error al eliminar", "err");
    } finally {
      setConfirm(null);
    }
  };

  const importar = async (file: File) => {
    const A = api("/admin/estudiantes/importar"), B = api("/admin/estudiantes/import");
    const up = async (u: string) => {
      const fd = new FormData();
      ["estudiantes", "file", "archivo"].forEach((k) => fd.append(k, file));
      return fetch(u, { method: "POST", headers: hdrs(), body: fd });
    };
    const showAlerts = (obj: any) => {
      const insertados = Number(obj?.insertados ?? obj?.creados ?? 0);
      const actualizados = Number(obj?.actualizados ?? 0);
      const duplicados = Number(obj?.duplicados_en_archivo ?? obj?.duplicados ?? 0);
      const omitidosExist = Number(obj?.omitidos_por_existir ?? 0);
      const omitidosOtrasInst = Number(obj?.omitidos_por_otras_instituciones ?? 0);
      const conflictos = Array.isArray(obj?.documentos_en_otras_instituciones) ? obj.documentos_en_otras_instituciones.length : omitidosOtrasInst;
      const total = Number(obj?.total_leidos ?? 0);
      // Alertas separadas por categoría
      if (insertados > 0) say(`Importado: ${insertados} creados`, 'ok');
      if (actualizados > 0) say(`${actualizados} actualizados`, 'ok');
      if (duplicados > 0) say(`${duplicados} duplicados en el archivo`, 'info');
      if (omitidosExist > 0) say(`${omitidosExist} ya existían en la institución`, 'info');
      if (conflictos > 0) say(`${conflictos} pertenecen a otra institución`, 'info');
      if (insertados + actualizados === 0 && duplicados + omitidosExist + conflictos === 0) {
        const tips = total ? ` (leídos: ${total})` : '';
        say(`No se realizaron cambios${tips}. Revisa encabezados y formato.`, 'info');
      }
      // Resumen final
      const resumen = `Importado: ${insertados} nuevos, ${actualizados} act.${total ? ` (leídos: ${total})` : ''}`;
      say(resumen, insertados + actualizados > 0 ? 'ok' : 'info');
    };
    try {
      let r = await up(A);
      if (r.status === 404) r = await up(B);
      if (r.ok) {
        const d = await r.json().catch(() => ({}));
        showAlerts(d);
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
      showAlerts(d2);
      setImpOpen(false);
      await listar();
    } catch (e: any) {
      say(e.message || "No se pudo importar", "err");
    }
  };

  /* búsqueda + paginación */
  const filtrados = useMemo(() => {
    let data = rows;
    // Filtrar por búsqueda
    if (q) data = data.filter((e) => starts(e.nombre, q) || starts(e.apellido, q));
    // Filtrar por estado de actividad
    if (filterActivo === "activos") data = data.filter(e => e.is_active);
    else if (filterActivo === "inactivos") data = data.filter(e => !e.is_active);
    return data;
  }, [rows, q, filterActivo]);
  const stats = useMemo(() => {
    const total = rows.length;
    const activos = rows.filter(e => e.is_active).length;
    const inactivos = rows.filter(e => !e.is_active).length;
    return { total, activos, inactivos };
  }, [rows]);
  
  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const current = Math.min(page, totalPages);
  const startIndex = (current - 1) * pageSize;
  const paginatedData = filtrados.slice(startIndex, startIndex + pageSize);
  
  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [totalPages, page]);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-lg flex items-center gap-2">
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex gap-3">
        <div className="flex-1 flex border border-gray-300 rounded-lg overflow-hidden">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o apellido..."
            className="px-4 py-2 flex-1 outline-none text-sm"
          />
          <button
            onClick={() => { setPage(1); listar(); }}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <FaSearch className="text-sm" />
            <span className="text-sm">Buscar</span>
          </button>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2" onClick={() => setCrear(true)}>
          <FaPlus className="text-sm" />
          <span className="text-sm">Nuevo Estudiante</span>
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2" onClick={() => setImpOpen(true)}>
          <FaFileUpload className="text-sm" />
          <span className="text-sm">Importar CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b"><span className="text-sm text-gray-700 font-medium">Filtros</span></div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NiceSelect className="w-full" value={grado} onChange={setGrado}
            options={[{ value: "", label: "Todos los grados" }, { value: "10", label: "10°" }, { value: "11", label: "11°" }]} />
          <NiceSelect className="w-full" value={curso} onChange={setCurso}
            options={[{ value: "", label: "Todos los cursos" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} />
          <NiceSelect className="w-full" value={jornada} onChange={setJornada}
            options={[{ value: "", label: "Todas las jornadas" }, { value: "mañana", label: "Mañana" }, { value: "tarde", label: "Tarde" }]} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          className={`rounded-lg border p-4 cursor-pointer transition ${filterActivo === "todos" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}
          onClick={() => { setFilterActivo("todos"); setPage(1); }}
        >
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">Total Estudiantes</div>
        </div>
        <div 
          className={`rounded-lg border p-4 cursor-pointer transition ${filterActivo === "activos" ? "bg-green-50 border-green-300" : "bg-white border-gray-200"}`}
          onClick={() => { setFilterActivo("activos"); setPage(1); }}
        >
          <div className="text-3xl font-bold text-green-600">{stats.activos}</div>
          <div className="text-sm text-gray-600 mt-1">Activos</div>
        </div>
        <div 
          className={`rounded-lg border p-4 cursor-pointer transition ${filterActivo === "inactivos" ? "bg-red-50 border-red-300" : "bg-white border-gray-200"}`}
          onClick={() => { setFilterActivo("inactivos"); setPage(1); }}
        >
          <div className="text-3xl font-bold text-red-600">{stats.inactivos}</div>
          <div className="text-sm text-gray-600 mt-1">Inactivos</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center gap-3 py-8">
              <FaSpinner className="animate-spin text-3xl text-blue-600" />
              <span className="text-gray-600 font-medium">Cargando estudiantes...</span>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 border-t pt-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FaExclamationCircle className="text-5xl text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar estudiantes</h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => listar()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay estudiantes</h3>
            <p className="text-gray-500 text-sm">Agrega uno nuevo o importa desde un archivo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grado/Curso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jornada</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Actividad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((e) => (
                  <tr key={e.id_usuario} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{e.nombre} {e.apellido}</div>
                        <div className="text-xs text-gray-500">{e.correo || "—"}</div>
                        <div className="text-xs text-gray-500">{e.tipo_documento} {e.numero_documento}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{e.grado || "—"}° {e.curso || ""}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{e.jornada || "—"}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {e.is_active ? (
                          <FaCheckCircle className="text-green-600" />
                        ) : (
                          <FaTimesCircle className="text-red-600" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          e.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {e.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {e.ultima_actividad ? new Date(e.ultima_actividad).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900" onClick={() => abrirEditar(e)}>
                          <FaEdit size={16} />
                        </button>
                        <button
                          className={`${e.is_active ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                          onClick={() => (e.is_active ? setConfirm({ t: "inactivar", e }) : reactivar(e))}
                          title={e.is_active ? 'Inactivar' : 'Reactivar'}
                        >
                          <FaToggleOn size={20} />
                        </button>
                        <button className="text-red-600 hover:text-red-900" onClick={() => pedirEliminar(e)}>
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Paginación */}
      {filtrados.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div></div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={current === 1}
              className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded border text-sm ${
                  p === current ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={current === totalPages}
              className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      {crear && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-xl font-semibold">Registrar Nuevo Estudiante</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setCrear(false)}>✕</button>
            </div>
            <form onSubmit={onCrear} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="w-full border border-gray-300 rounded-lg p-3" required />
                <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Apellido" className="w-full border border-gray-300 rounded-lg p-3" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NiceSelect className="w-full" value={form.tipo_documento} onChange={(v) => setForm({ ...form, tipo_documento: v })}
                  options={[{ value: "", label: "Tipo de Documento" }, { value: "TI", label: "Tarjeta de Identidad" }, { value: "CC", label: "Cédula de Ciudadanía" }, { value: "CE", label: "Cédula de Extranjería" }]} />
                <input value={form.numero_documento} onChange={(e) => setForm({ ...form, numero_documento: e.target.value })} placeholder="Número de documento" className="w-full border border-gray-300 rounded-lg p-3" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NiceSelect className="w-full" value={form.grado} onChange={(v) => setForm({ ...form, grado: v })}
                  options={[{ value: "", label: "Grado" }, { value: "10", label: "Décimo (10°)" }, { value: "11", label: "Undécimo (11°)" }]} />
                <NiceSelect className="w-full" value={form.curso} onChange={(v) => setForm({ ...form, curso: v })}
                  options={[{ value: "", label: "Curso" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} />
                <NiceSelect className="w-full" value={form.jornada} onChange={(v) => setForm({ ...form, jornada: v })}
                  options={[{ value: "", label: "Jornada" }, { value: "mañana", label: "Mañana" }, { value: "tarde", label: "Tarde" }]} />
              </div>
              <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección" className="w-full border border-gray-300 rounded-lg p-3" />
              <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="Correo electrónico" className="w-full border border-gray-300 rounded-lg p-3" required />
              <div>
                <div className="text-xs text-gray-600 mb-1">Institución</div>
                <input value={instName} readOnly className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-700" />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setCrear(false)} disabled={submitting}>Cancelar</button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  {submitting ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h2 className="text-xl font-semibold">Editar Estudiante</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setEditOpen(false)}>✕</button>
            </div>
            {editMsg && <div className="mb-3 p-2 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{editMsg}</div>}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={edit.nombre || ""} onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} placeholder="Nombre" className="w-full border border-gray-300 rounded-lg p-3" />
                <input value={edit.apellido || ""} onChange={(e) => setEdit({ ...edit, apellido: e.target.value })} placeholder="Apellido" className="w-full border border-gray-300 rounded-lg p-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NiceSelect className="w-full" value={edit.tipo_documento || ""} onChange={(v) => setEdit({ ...edit, tipo_documento: v })}
                  options={[{ value: "", label: "Tipo de Documento" }, { value: "TI", label: "Tarjeta de Identidad" }, { value: "CC", label: "Cédula de Ciudadanía" }, { value: "CE", label: "Cédula de Extranjería" }]} />
                <input value={edit.numero_documento || ""} onChange={(e) => setEdit({ ...edit, numero_documento: e.target.value })} placeholder="Número de documento" className="w-full border border-gray-300 rounded-lg p-3" />
              </div>
              <input value={edit.correo || ""} onChange={(e) => setEdit({ ...edit, correo: e.target.value })} placeholder="Correo electrónico" className="w-full border border-gray-300 rounded-lg p-3" />
              <input value={edit.direccion || ""} onChange={(e) => setEdit({ ...edit, direccion: e.target.value })} placeholder="Dirección" className="w-full border border-gray-300 rounded-lg p-3" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NiceSelect className="w-full" value={(edit.grado as any) ?? ""} onChange={(v) => setEdit({ ...edit, grado: v })}
                  options={[{ value: "", label: "Grado" }, { value: "10", label: "Décimo (10°)" }, { value: "11", label: "Undécimo (11°)" }]} />
                <NiceSelect className="w-full" value={edit.curso || ""} onChange={(v) => setEdit({ ...edit, curso: v })}
                  options={[{ value: "", label: "Curso" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} />
                <NiceSelect className="w-full" value={edit.jornada || ""} onChange={(v) => setEdit({ ...edit, jornada: v })}
                  options={[{ value: "", label: "Jornada" }, { value: "mañana", label: "Mañana" }, { value: "tarde", label: "Tarde" }]} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setEditOpen(false)} disabled={submitting}>Cancelar</button>
              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                onClick={guardarEditar}
                disabled={submitting}
              >
                {submitting && <FaSpinner className="animate-spin" />}
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {impOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-[60]">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Importar Estudiantes</h3>
              <button className="p-2 rounded hover:bg-gray-100 text-gray-500" onClick={() => setImpOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="px-6 pt-3 pb-6">
              <p className="text-sm text-gray-600 mb-4">Sube un archivo CSV o Excel con los datos de los estudiantes</p>
              <div
                className={`rounded-xl border-2 border-dashed ${drag ? "border-blue-500 bg-blue-50" : "border-gray-300"} flex flex-col items-center justify-center py-12 text-center`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) importar(f); }}
              >
                <FaFileUpload className="text-4xl text-gray-400 mb-3" />
                <button className="text-blue-600 hover:text-blue-700 font-semibold" onClick={() => fileRef.current?.click()}>Seleccionar archivo</button>
                <div className="text-xs text-gray-500 mt-1">CSV o Excel</div>
                <input ref={fileRef} type="file" hidden accept=".csv,.xlsx,.xls"
                  onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importar(f); }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm && confirm.t === "inactivar" && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Inactivar Estudiante</h3>
            <p className="text-gray-600 mb-4">¿Estás seguro de inactivar a este estudiante?</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={confirmarInactivar}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {confirm && confirm.t === "eliminar" && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Eliminar Estudiante</h3>
            <p className="text-gray-600 mb-4">¿Eliminar definitivamente a este estudiante?</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={confirmarEliminar}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estudiantes;
