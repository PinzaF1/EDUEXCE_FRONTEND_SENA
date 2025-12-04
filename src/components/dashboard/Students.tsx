// src/assets/Estudiantes.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  FaSearch, FaPlus, FaFileUpload, FaEdit, FaTrash,
  FaToggleOn, FaTimes,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationCircle,
  FaUser, FaIdCard, FaSchool, FaInfoCircle
} from "react-icons/fa";

import api, { request, buildUrl } from "../../services/api";

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
    grado: "", curso: "", jornada: "", correo: "", telefono: "", direccion: "",
  });
  const [camposTocados, setCamposTocados] = useState<Record<string, boolean>>({});
  const [editOpen, setEditOpen] = useState(false),
    [edit, setEdit] = useState<Partial<Estudiante>>({}),
    [editMsg, setEditMsg] = useState("");
  const [confirm, setConfirm] = useState<{ t: "inactivar" | "eliminar"; e?: Estudiante } | null>(null);
  const [filterActivo, setFilterActivo] = useState<"todos" | "activos" | "inactivos">("todos");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [impOpen, setImpOpen] = useState(false), [drag, setDrag] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const listarRef = useRef<AbortController | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const instName = (typeof window !== 'undefined' ? localStorage.getItem('nombre_institucion') : '') || '';

  // Función toast mejorada - mensajes más largos para duplicados
  const say = (text: string, type?: "ok" | "err" | "info") => { 
    // Si es un mensaje importante de duplicados, hacerlo más largo
    const isImportantDuplicate = text.includes('pertenecen a otra institución') || 
                                 text.includes('duplicados') ||
                                 text.includes('ya existen') ||
                                 text.includes('ya existían');
    
    const duration = isImportantDuplicate ? 6000 : 4200; // 6 segundos para duplicados importantes
    
    setToast({ text, type }); 
    setTimeout(() => setToast(null), duration);
  };

  // Campos obligatorios para validación
  const camposObligatorios = ['nombre', 'apellido', 'tipo_documento', 'numero_documento', 'correo', 'telefono'];
  
  // Validación específica para número de documento (exactamente 10 dígitos)
  const validarNumeroDocumento = (documento: string): boolean => {
    return /^\d{10}$/.test(documento);
  };

  // Validación del formulario
  const formularioValido = useMemo(() => {
    return camposObligatorios.every(campo => {
      const valor = form[campo as keyof typeof form];
      const esValido = typeof valor === 'string' && valor.trim() !== '';
      
      // Validación adicional para número de documento
      if (campo === 'numero_documento' && esValido) {
        return validarNumeroDocumento(valor.trim());
      }
      
      return esValido;
    });
  }, [form]);

  // Función para marcar campo como tocado
  const tocarCampo = (nombreCampo: string) => {
    setCamposTocados(prev => ({
      ...prev,
      [nombreCampo]: true
    }));
  };

  // Verificar si un campo tiene error
  const campoConError = (nombreCampo: string) => {
    const valor = form[nombreCampo as keyof typeof form]?.trim();
    
    if (!camposTocados[nombreCampo]) return false;
    
    // Validación especial para número de documento
    if (nombreCampo === 'numero_documento') {
      return !valor || !validarNumeroDocumento(valor);
    }
    
    return !valor;
  };

  // Manejar cambio en número de documento (solo números)
  const handleNumeroDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, ''); // Solo números
    setForm({ ...form, numero_documento: valor });
  };

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
      if (!localStorage.getItem('token')) return;
      try {
        await request('/admin/perfil');
      } catch {
        // noop
      }
    })();
  }, []);

  // FUNCIÓN LISTAR CON ABORT CONTROLLER
  const listar = useCallback(async () => {
    // Cancelar petición anterior si existe
    if (listarRef.current) {
      listarRef.current.abort();
    }
    
    // Crear nuevo abort controller
    listarRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      const qs = new URLSearchParams();
      if (grado) qs.set("grado", grado);
      if (curso) qs.set("curso", curso);
      if (jornada) qs.set("jornada", jornada);
      if (q) qs.set("q", q);
      qs.set("_ts", String(Date.now()));
      console.log("Cargando estudiantes desde:", buildUrl(`/admin/estudiantes?${qs.toString()}`));
      const d = await request(`/admin/estudiantes?${qs.toString()}`, { method: 'GET', headers: { "Cache-Control": "no-cache" } });
      console.log("Respuesta del servidor:", d);
      setRows((Array.isArray(d) ? d : []).map(normRow));
      setPage(1);
    } catch (error: any) {
      // Ignorar errores de cancelación
      if (error.name === 'AbortError') {
        console.log('Petición cancelada');
        return;
      }
      
      console.error("Error al cargar estudiantes:", error);
      const errorMsg = error.message || "No se pudo cargar la lista de estudiantes";
      setError(errorMsg);
      say(errorMsg, "err");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { 
    if (localStorage.getItem('token')) listar(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (localStorage.getItem('token')) listar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grado, curso, jornada]);

  const onCrear = async (ev: React.FormEvent) => {
    ev.preventDefault();
    
    // Marcar todos los campos como tocados para mostrar errores
    const todosTocados: Record<string, boolean> = {};
    camposObligatorios.forEach(campo => {
      todosTocados[campo] = true;
    });
    setCamposTocados(todosTocados);
    
    // Si el formulario no es válido, no enviar
    if (!formularioValido) {
      say("Por favor completa todos los campos obligatorios correctamente", "err");
      return;
    }
    
    try {
      setSubmitting(true);
      await request('/admin/estudiantes', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          correo: form.correo?.trim() || null,
          telefono: form.telefono?.trim() || null,
          direccion: form.direccion?.trim() || null,
          grado: form.grado || null,
          curso: form.curso || null,
          jornada: form.jornada || null,
        })
      });
      
      say("✅ Estudiante registrado exitosamente", "ok");
      setCrear(false);
      setForm({ nombre: "", apellido: "", tipo_documento: "", numero_documento: "", grado: "", curso: "", jornada: "", correo: "", telefono: "", direccion: "" });
      setCamposTocados({});
      await listar();
    } catch (e: any) {
      // Verificar si el error es por duplicado
      if (e.message?.includes('duplicado') || e.message?.includes('ya existe') || e.message?.includes('existente')) {
        say(`⚠️ ${e.message}`, 'info');
      } else {
        say(`❌ ${e.message || "Error al registrar estudiante"}`, 'err');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Estados para validación de edición
  const [camposEditTocados, setCamposEditTocados] = useState<Record<string, boolean>>({});
  
  const abrirEditar = (e: Estudiante) => { 
    setEditMsg(""); 
    setEdit({ ...e }); 
    setEditOpen(true);
    setCamposEditTocados({}); // Limpiar validación al abrir
  };

  // Función para validar campos en edición
  const validarCampoEdicion = (campo: string, valor: string): boolean => {
    return valor.trim() !== "";
  };

  // Verificar si un campo en edición tiene error
  const campoEditConError = (nombreCampo: string) => {
    const valor = edit[nombreCampo as keyof typeof edit] as string || "";
    if (!camposEditTocados[nombreCampo]) return false;
    return !validarCampoEdicion(nombreCampo, valor);
  };

  // Función para marcar campo en edición como tocado
  const tocarCampoEdit = (nombreCampo: string) => {
    setCamposEditTocados(prev => ({
      ...prev,
      [nombreCampo]: true
    }));
  };

  // Validar si todo el formulario de edición es válido
  const formularioEdicionValido = useMemo(() => {
    const camposRequeridos = ['nombre', 'apellido', 'tipo_documento', 'numero_documento', 'correo'];
    return camposRequeridos.every(campo => {
      const valor = edit[campo as keyof typeof edit] as string || "";
      return validarCampoEdicion(campo, valor);
    });
  }, [edit]);

  const guardarEditar = async () => {
    // Marcar todos los campos requeridos como tocados
    const camposRequeridos = ['nombre', 'apellido', 'tipo_documento', 'numero_documento', 'correo'];
    const nuevosTocados: Record<string, boolean> = {};
    camposRequeridos.forEach(campo => {
      nuevosTocados[campo] = true;
    });
    setCamposEditTocados(nuevosTocados);
    
    // Si el formulario no es válido, mostrar error y no guardar
    if (!formularioEdicionValido) {
      setEditMsg("Por favor completa todos los campos obligatorios");
      return;
    }
    
    try {
      if (!edit?.id_usuario) return setEditMsg("Falta id");
      setSubmitting(true);
      await request(`/admin/estudiantes/${edit.id_usuario}`, {
        method: 'PUT',
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
        })
      });
      say("Estudiante actualizado exitosamente", "ok");
      setEditOpen(false);
      // Limpiar estados de validación
      setCamposEditTocados({});
      await listar();
    } catch (e: any) {
      setEditMsg(e.message || "Error al actualizar estudiante");
    } finally {
      setSubmitting(false);
    }
  };

  /* Activar/Inactivar - MEJORADO */
  const reactivar = async (e: Estudiante) => {
    const id = e.id_usuario;
    const estudianteNombre = `${e.nombre} ${e.apellido}`;
    
    // Actualizar UI inmediatamente
    setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: true } : r)));
    
    try {
      await request(`/admin/estudiantes/${id}`, { method: 'PUT', body: JSON.stringify({ is_active: true }) });
      say("Estudiante reactivado.", "ok");
      await listar();
    } catch (err: any) {
      // Revertir cambios en UI
      setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: false } : r)));
      console.error("Error al reactivar:", err);
      say(err.message || "❌ Error al reactivar estudiante", "err");
    }
  };

  const confirmarInactivar = async () => {
    if (!confirm?.e) return;
    const id = confirm.e.id_usuario;
    const estudianteNombre = `${confirm.e.nombre} ${confirm.e.apellido}`;
    
    // Actualizar UI inmediatamente
    setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: false } : r)));
    
    try {
      await request(`/admin/estudiantes/${id}`, { method: 'PUT', body: JSON.stringify({ is_active: false }) });
      say("Estudiante inactivado.", "ok");
      setConfirm(null);
      await listar();
    } catch (e: any) {
      // Revertir cambios en UI
      setRows((rs) => rs.map((r) => (r.id_usuario === id ? { ...r, is_active: true } : r)));
      console.error("Error en inactivación:", e);
      say(e.message || "❌ Error al inactivar estudiante", "err");
    }
  };

  const pedirEliminar = (e: Estudiante) => setConfirm({ t: "eliminar", e });

  // MODIFICADO: Cuando se confirma eliminar, si tiene historial se inactiva
  const confirmarEliminar = async () => {
    if (!confirm?.e) return;
    const id = confirm.e.id_usuario;
    const estudianteNombre = `${confirm.e.nombre} ${confirm.e.apellido}`;
    
    try {
      try {
        await request(`/admin/estudiantes/${id}`, { method: 'DELETE' });
        say("Estudiante eliminado.", "ok");
        await listar();
      } catch (err: any) {
        if ((err as any).status === 409) {
          const body = (err as any).body || {};
          say(body?.error || "Tiene historial; solo puede inactivarse.", "info");
        } else {
          throw err;
        }
      }
      
      await listar();
      
    } catch (e: any) {
      say(e.message || "Error al eliminar", "err");
    } finally {
      setConfirm(null);
    }
  };

  const importar = async (file: File) => {
    const pathA = "/admin/estudiantes/importar", pathB = "/admin/estudiantes/import";
    const A = buildUrl(pathA), B = buildUrl(pathB);
    const up = async (u: string) => {
      const fd = new FormData();
      ["estudiantes", "file", "archivo"].forEach((k) => fd.append(k, file));
      // Use centralized upload helper to keep headers and auth consistent
      return api.uploadTo(u, fd);
    };
    
    // FUNCIÓN SIMPLIFICADA: Solo muestra toasts, no modal grande
    const showAlerts = (obj: any) => {
      console.log('DEBUG - Respuesta completa del backend:', obj);
      
      const insertados = Number(obj?.insertados ?? obj?.creados ?? 0);
      const actualizados = Number(obj?.actualizados ?? 0);
      const duplicados = Number(obj?.duplicados_en_archivo ?? obj?.duplicados ?? 0);
      const omitidosExist = Number(obj?.omitidos_por_existir ?? 0);
      const omitidosOtrasInst = Number(obj?.omitidos_por_otras_instituciones ?? 0);
      const total = Number(obj?.total_leidos ?? 0);
      
      // Alertas separadas por categoria - MENSJES MEJORADOS
      if (insertados > 0) {
        if (insertados === 1) {
          say(`✅ 1 estudiante creado exitosamente`, 'ok');
        } else {
          say(`✅ ${insertados} estudiantes creados exitosamente`, 'ok');
        }
      }
      
      if (actualizados > 0) {
        if (actualizados === 1) {
          say(`✅ 1 estudiante actualizado`, 'ok');
        } else {
          say(`✅ ${actualizados} estudiantes actualizados`, 'ok');
        }
      }
      
      if (duplicados > 0) {
        if (duplicados === 1) {
          say(`⚠️ 1 estudiante duplicado en el archivo (misma fila repetida)`, 'info');
        } else {
          say(`⚠️ ${duplicados} estudiantes duplicados en el archivo (filas repetidas)`, 'info');
        }
      }
      
      if (omitidosExist > 0) {
        if (omitidosExist === 1) {
          say(`⚠️ 1 estudiante ya existía en esta institución`, 'info');
        } else {
          say(`⚠️ ${omitidosExist} estudiantes ya existían en esta institución`, 'info');
        }
      }
      
      if (omitidosOtrasInst > 0) {
        if (omitidosOtrasInst === 1) {
          say(`❌ 1 estudiante pertenece a otra institución y no fue registrado`, 'err');
        } else {
          say(`❌ ${omitidosOtrasInst} estudiantes pertenecen a otras instituciones y no fueron registrados`, 'err');
        }
      }
      
      if (insertados + actualizados === 0 && duplicados + omitidosExist + omitidosOtrasInst === 0) {
        const tips = total ? ` (leídos: ${total})` : '';
        say(`ℹ️ No se realizaron cambios${tips}. Revisa encabezados y formato.`, 'info');
      }
      
      // Resumen final
      if (insertados + actualizados > 0) {
        const resumen = `📊 Resultado: ${insertados} nuevos, ${actualizados} actualizados${total ? ` (total leídos: ${total})` : ''}`;
        say(resumen, 'ok');
      }
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
      const send = (usePath: string) =>
        request(usePath, { method: 'POST', body: JSON.stringify({ filas }) });
      let d2: any = {};
      try {
        const rj = await send(pathA);
        d2 = rj as any;
      } catch (errA: any) {
        // Try alternative path if first fails with a 404-like error
        try {
          const r2 = await send(pathB);
          d2 = r2 as any;
        } catch (errB: any) {
          return say(errB?.message || 'Error al importar', 'err');
        }
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
            onChange={(e) => { 
              const value = e.target.value;
              setQ(value);
              setPage(1);
              
              // Cancelar timeout anterior
              if (searchTimeout) {
                clearTimeout(searchTimeout);
              }
              
              // Crear nuevo timeout para búsqueda diferida
              const timeout = setTimeout(() => {
                listar();
              }, 500);
              
              setSearchTimeout(timeout);
            }}
            placeholder="Buscar por nombre o apellido..."
            className="px-4 py-2 flex-1 outline-none text-sm"
          />
          <button
            onClick={() => { 
              // Cancelar cualquier timeout pendiente
              if (searchTimeout) {
                clearTimeout(searchTimeout);
              }
              setPage(1); 
              listar(); 
            }}
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
        <div className="px-5 py-4 grid grid-cols-3 gap-4">
          <NiceSelect className="w-full" value={grado} onChange={setGrado}
            options={[{ value: "", label: "Todos los grados" }, { value: "10", label: "10°" }, { value: "11", label: "11°" }]} />
          <NiceSelect className="w-full" value={curso} onChange={setCurso}
            options={[{ value: "", label: "Todos los cursos" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} />
          <NiceSelect className="w-full" value={jornada} onChange={setJornada}
            options={[{ value: "", label: "Todas las jornadas" }, { value: "mañana", label: "Mañana" }, { value: "tarde", label: "Tarde" }]} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
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
                        <button className="text-blue-600 hover:text-blue-900" onClick={() => abrirEditar(e)} title="Editar">
                          <FaEdit size={16} />
                        </button>
                        <button
                          className={`${e.is_active ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                          onClick={() => {
                            e.is_active ? setConfirm({ t: "inactivar", e }) : reactivar(e)
                          }}
                          title={e.is_active ? 'Inactivar estudiante' : 'Reactivar estudiante'}
                        >
                          <FaToggleOn size={20} />
                        </button>
                        <button className="text-red-600 hover:text-red-900" onClick={() => pedirEliminar(e)} title="Eliminar">
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

      {/* Modal Crear Estudiante */}
      {crear && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-xl font-semibold">Registrar Nuevo Estudiante</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => { setCrear(false); setCamposTocados({}); }}>✕</button>
            </div>
            <form onSubmit={onCrear} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input 
                    value={form.nombre} 
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                    onBlur={() => tocarCampo('nombre')}
                    placeholder="Nombre *" 
                    className={`w-full border rounded-lg p-3 ${campoConError('nombre') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                  />
                  {campoConError('nombre') && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>
                <div>
                  <input 
                    value={form.apellido} 
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })} 
                    onBlur={() => tocarCampo('apellido')}
                    placeholder="Apellido *" 
                    className={`w-full border rounded-lg p-3 ${campoConError('apellido') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                  />
                  {campoConError('apellido') && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <NiceSelect className="w-full" value={form.tipo_documento} onChange={(v) => setForm({ ...form, tipo_documento: v })}
                    options={[{ value: "", label: "Tipo de Documento *" }, { value: "TI", label: "Tarjeta de Identidad" }, { value: "CC", label: "Cédula de Ciudadanía" }, { value: "CE", label: "Cédula de Extranjería" }]} />
                  {campoConError('tipo_documento') && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                </div>
                <div>
                  <input 
                    value={form.numero_documento} 
                    onChange={handleNumeroDocumentoChange}
                    onBlur={() => tocarCampo('numero_documento')}
                    placeholder="Número de documento *" 
                    maxLength={10}
                    className={`w-full border rounded-lg p-3 ${campoConError('numero_documento') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                  />
                  {campoConError('numero_documento') && (
                    <p className="text-red-500 text-xs mt-1">
                      {!form.numero_documento ? 'Este campo es obligatorio' : 'Debe tener exactamente 10 dígitos'}
                    </p>
                  )}
                  {form.numero_documento && !validarNumeroDocumento(form.numero_documento) && (
                    <p className="text-blue-500 text-xs mt-1">{form.numero_documento.length}/10 dígitos</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <NiceSelect className="w-full" value={form.grado} onChange={(v) => setForm({ ...form, grado: v })}
                  options={[{ value: "", label: "Grado" }, { value: "10", label: "Décimo (10°)" }, { value: "11", label: "Undécimo (11°)" }]} />
                <NiceSelect className="w-full" value={form.curso} onChange={(v) => setForm({ ...form, curso: v })}
                  options={[{ value: "", label: "Curso" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }]} />
                <NiceSelect className="w-full" value={form.jornada} onChange={(v) => setForm({ ...form, jornada: v })}
                  options={[{ value: "", label: "Jornada" }, { value: "mañana", label: "Mañana" }, { value: "tarde", label: "Tarde" }]} />
              </div>
              <div>
                <input 
                  type="email" 
                  value={form.correo} 
                  onChange={(e) => setForm({ ...form, correo: e.target.value })} 
                  onBlur={() => tocarCampo('correo')}
                  placeholder="Correo electrónico *" 
                  className={`w-full border rounded-lg p-3 ${campoConError('correo') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {campoConError('correo') && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
              </div>
              <div>
                <input 
                  value={form.telefono} 
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })} 
                  onBlur={() => tocarCampo('telefono')}
                  placeholder="Teléfono *" 
                  className={`w-full border rounded-lg p-3 ${campoConError('telefono') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {campoConError('telefono') && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
              </div>
              <input 
                value={form.direccion} 
                onChange={(e) => setForm({ ...form, direccion: e.target.value })} 
                placeholder="Dirección" 
                className="w-full border border-gray-300 rounded-lg p-3" 
              />
              <div>
                <div className="text-xs text-gray-600 mb-1">Institución</div>
                <input value={instName} readOnly className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-700" />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => { setCrear(false); setCamposTocados({}); }} disabled={submitting}>Cancelar</button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={submitting || !formularioValido}
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  {submitting ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                * Campos obligatorios
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Estudiante - CON VALIDACIÓN */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h2 className="text-xl font-semibold">Editar Estudiante</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setEditOpen(false)}>✕</button>
            </div>
            {editMsg && <div className="mb-3 p-2 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{editMsg}</div>}
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <input 
                  value={edit.nombre || ""} 
                  onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} 
                  onBlur={() => tocarCampoEdit('nombre')}
                  placeholder="Nombre *" 
                  className={`w-full border rounded-lg p-3 ${campoEditConError('nombre') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {campoEditConError('nombre') && <p className="text-red-500 text-xs mt-1">Este campo no puede estar vacío</p>}
              </div>
              
              {/* Apellido */}
              <div>
                <input 
                  value={edit.apellido || ""} 
                  onChange={(e) => setEdit({ ...edit, apellido: e.target.value })} 
                  onBlur={() => tocarCampoEdit('apellido')}
                  placeholder="Apellido *" 
                  className={`w-full border rounded-lg p-3 ${campoEditConError('apellido') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {campoEditConError('apellido') && <p className="text-red-500 text-xs mt-1">Este campo no puede estar vacío</p>}
              </div>
              
              {/* Tipo de Documento */}
              <div>
                <NiceSelect 
                  className="w-full" 
                  value={edit.tipo_documento || ""} 
                  onChange={(v) => setEdit({ ...edit, tipo_documento: v })}
                  options={[
                    { value: "", label: "Tipo de Documento *" }, 
                    { value: "TI", label: "Tarjeta de Identidad" }, 
                    { value: "CC", label: "Cédula de Ciudadanía" }, 
                    { value: "CE", label: "Cédula de Extranjería" }
                  ]} 
                />
                {campoEditConError('tipo_documento') && <p className="text-red-500 text-xs mt-1">Este campo no puede estar vacío</p>}
              </div>
              
              {/* Número de Documento */}
              <div>
                <input 
                  value={edit.numero_documento || ""} 
                  onChange={(e) => setEdit({ ...edit, numero_documento: e.target.value })} 
                  onBlur={() => tocarCampoEdit('numero_documento')}
                  placeholder="Número de documento *" 
                  className={`w-full border rounded-lg p-3 ${campoEditConError('numero_documento') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {campoEditConError('numero_documento') && <p className="text-red-500 text-xs mt-1">Este campo no puede estar vacío</p>}
              </div>
              
              {/* Correo electrónico */}
              <div>
                <input 
                  type="email"
                  value={edit.correo || ""} 
                  onChange={(e) => setEdit({ ...edit, correo: e.target.value })} 
                  onBlur={() => tocarCampoEdit('correo')}
                  placeholder="Correo electrónico *" 
                  className={`w-full border rounded-lg p-3 ${campoEditConError('correo') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {campoEditConError('correo') && <p className="text-red-500 text-xs mt-1">Este campo no puede estar vacío</p>}
              </div>
              
              {/* Dirección (opcional) */}
              <input 
                value={edit.direccion || ""} 
                onChange={(e) => setEdit({ ...edit, direccion: e.target.value })} 
                placeholder="Dirección" 
                className="w-full border border-gray-300 rounded-lg p-3" 
              />
              
              {/* Grado, Curso, Jornada (opcionales) */}
              <div className="grid grid-cols-3 gap-4">
                <NiceSelect 
                  className="w-full" 
                  value={(edit.grado as any) ?? ""} 
                  onChange={(v) => setEdit({ ...edit, grado: v })}
                  options={[
                    { value: "", label: "Grado" }, 
                    { value: "10", label: "Décimo (10°)" }, 
                    { value: "11", label: "Undécimo (11°)" }
                  ]} 
                />
                <NiceSelect 
                  className="w-full" 
                  value={edit.curso || ""} 
                  onChange={(v) => setEdit({ ...edit, curso: v })}
                  options={[
                    { value: "", label: "Curso" }, 
                    { value: "A", label: "A" }, 
                    { value: "B", label: "B" }, 
                    { value: "C", label: "C" }
                  ]} 
                />
                <NiceSelect 
                  className="w-full" 
                  value={edit.jornada || ""} 
                  onChange={(v) => setEdit({ ...edit, jornada: v })}
                  options={[
                    { value: "", label: "Jornada" }, 
                    { value: "mañana", label: "Mañana" }, 
                    { value: "tarde", label: "Tarde" }
                  ]} 
                />
              </div>
              
              <div className="text-xs text-gray-500">
                * Campos obligatorios
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setEditOpen(false)} disabled={submitting}>Cancelar</button>
              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                onClick={guardarEditar}
                disabled={submitting || !formularioEdicionValido}
              >
                {submitting && <FaSpinner className="animate-spin" />}
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar Estudiantes */}
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

      {/* Modal Confirmar Inactivar - MEJORADO */}
      {confirm && confirm.t === "inactivar" && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <FaExclamationCircle className="text-yellow-500 text-xl mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold">Inactivar Estudiante</h3>
                <p className="text-gray-600 mt-1">
                  ¿Estás seguro de inactivar a <strong>{confirm.e?.nombre} {confirm.e?.apellido}</strong>?
                </p>
                <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  <div><strong>Documento:</strong> {confirm.e?.tipo_documento} {confirm.e?.numero_documento}</div>
                  <div><strong>Grado/Curso:</strong> {confirm.e?.grado}° {confirm.e?.curso} - {confirm.e?.jornada}</div>
                  <div><strong>ID:</strong> {confirm.e?.id_usuario}</div>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ El estudiante dejará de aparecer en las actividades diarias pero se conservará su historial.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setConfirm(null)}>Cancelar</button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2" 
                onClick={confirmarInactivar}
              >
                <FaToggleOn />
                Inactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar - CON MENSAJE MEJORADO */}
      {confirm && confirm.t === "eliminar" && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <FaExclamationCircle className="text-yellow-500 text-xl mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold">Eliminar Estudiante</h3>
                <p className="text-gray-600 mt-1">
                  {confirm.e ? (
                    <>
                      ¿Deseas proceder con la eliminación de <strong>{confirm.e.nombre} {confirm.e.apellido}</strong>?<br /><br />
                      <span className="text-sm">
                        <strong className="text-blue-600 block mb-1">• Si NO tiene historial:</strong>
                        <span className="text-gray-700 ml-4">Se eliminará permanentemente.</span><br /><br />
                        <strong className="text-blue-600 block mb-1">• Si TIENE historial:</strong>
                        <span className="text-gray-700 ml-4">Solo se inactivará para conservar su historial académico.</span>
                      </span>
                    </>
                  ) : (
                    "¿Eliminar definitivamente a este estudiante?"
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
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