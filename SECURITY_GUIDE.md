# 🔒 Guía de Seguridad - APIs y Variables de Entorno

## ✅ Correcciones Aplicadas

### 1. **Archivos `.env*` añadidos a `.gitignore`**
Ahora los archivos con credenciales NO se subirán a Git:
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.testing`

### 2. **URLs hardcodeadas eliminadas**
Todos los archivos ahora **requieren** `VITE_API_URL` configurada.

**Archivos actualizados:**
- ✅ `src/utils/api.ts`
- ✅ `src/services/api.ts`
- ✅ `src/components/dashboard/Tracking.tsx`
- ✅ `src/components/dashboard/Students.tsx`
- ✅ `src/components/dashboard/Profile.tsx`
- ✅ `src/components/dashboard/Notifications.tsx`
- ✅ `cypress.config.ts`

### 3. **Archivo `.env.example` creado**
Template para configuración sin exponer valores reales.

---

## 🚨 ADVERTENCIAS DE SEGURIDAD

### ❌ **NO HACER:**
- ❌ NO subas archivos `.env*` a Git
- ❌ NO pongas URLs de producción en el código
- ❌ NO pongas passwords en el código
- ❌ NO compartas credenciales en documentación pública
- ❌ NO uses la misma API key para desarrollo y producción

### ✅ **SÍ HACER:**
- ✅ Usa variables de entorno para TODAS las URLs
- ✅ Mantén archivos `.env*` locales
- ✅ Configura variables en tu plataforma de hosting
- ✅ Rota credenciales si fueron expuestas
- ✅ Usa diferentes credenciales para testing

---

## 📋 Configuración Correcta

### **1. Desarrollo Local**
```bash
# Copia el ejemplo
cp .env.example .env

# Edita con tu URL local o de desarrollo
VITE_API_URL=https://tu-ngrok.ngrok-free.dev
VITE_ENV=development
```

### **2. Testing**
```bash
# .env.testing (local, no subir a Git)
VITE_API_URL=http://localhost:3000
VITE_ENV=testing
TEST_EMAIL=test@example.com
TEST_PASSWORD=test123456
```

### **3. Producción (en Vercel/Netlify)**
Configurar en el panel de variables de entorno:
- `VITE_API_URL` = `https://tu-backend-produccion.onrender.com`
- `VITE_ENV` = `production`

---

## ⚠️ SI EXPUSISTE CREDENCIALES

### **Pasos a seguir:**

1. **Eliminar archivos sensibles del historial de Git:**
```bash
# Eliminar del historial (CUIDADO - reescribe historia)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.development .env.production" \
  --prune-empty --tag-name-filter cat -- --all

# O usa BFG Repo-Cleaner (más fácil)
bfg --delete-files .env
```

2. **Rotar credenciales:**
- Cambia passwords de usuarios de testing
- Regenera API keys
- Actualiza URLs de ngrok

3. **Forzar push (CUIDADO):**
```bash
git push origin --force --all
```

---

## 🔍 Verificar Seguridad

### **Comando para verificar que no hay URLs expuestas:**
```bash
# Buscar URLs hardcodeadas
git grep -E "https://.*\.(onrender|ngrok|railway)\.(com|dev)" -- '*.ts' '*.tsx' '*.js' '*.jsx'

# No debería retornar nada
```

### **Verificar que .env no está en Git:**
```bash
git ls-files | grep "\.env"

# Si aparece algo, eliminarlo:
git rm --cached .env
git commit -m "Remove .env from git"
```

---

## ✅ Estado Actual

| Elemento | Estado | Acción Requerida |
|----------|--------|------------------|
| `.env*` en `.gitignore` | ✅ Protegido | Ninguna |
| URLs hardcodeadas | ✅ Eliminadas | Ninguna |
| Variables de entorno obligatorias | ✅ Implementado | Configurar `.env` local |
| `.env.example` | ✅ Creado | Actualizar con tus variables |
| Credenciales en código | ✅ Eliminadas | Ninguna |

---

## 🎯 Próximos Pasos

1. **Verifica que los archivos `.env*` NO están en Git:**
```bash
git status
# No deberían aparecer .env*
```

2. **Si ya subiste archivos `.env` al repositorio:**
   - Sigue los pasos de "SI EXPUSISTE CREDENCIALES"
   - Rota todas las credenciales
   - Notifica al equipo

3. **Configura tu `.env` local:**
```bash
cp .env.example .env
# Edita .env con tus valores reales
```

4. **Verifica que la app funciona:**
```bash
npm run dev
# Debe cargar sin errores
```

---

## 📞 Checklist Final

- [x] `.env*` en `.gitignore`
- [x] URLs hardcodeadas eliminadas
- [x] Variables de entorno obligatorias
- [x] `.env.example` creado
- [x] Validación de errores implementada
- [ ] Verificar que `.env` NO está en Git
- [ ] Rotar credenciales si fueron expuestas
- [ ] Configurar variables en plataforma de hosting
- [ ] Documentar al equipo el nuevo flujo

---

**Fecha de implementación:** 14 de noviembre de 2025
**Estado:** ✅ Seguridad mejorada - Pendiente configuración local
