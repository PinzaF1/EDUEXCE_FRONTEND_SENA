# 🚀 Rama ngrok-backup - Frontend EduExce

Esta es una rama de respaldo que utiliza **ngrok** como backend en lugar del servidor AWS principal.

## 🎯 Propósito

- **Rama principal**: `develop` → Backend AWS (`https://eduexce-backend.ddns.net`)
- **Rama respaldo**: `ngrok-backup` → Backend ngrok (`https://gillian-semiluminous-blubberingly.ngrok-free.dev`)

## 🔄 Cambios Realizados

### 1. **vite.config.ts**
```typescript
// Cambio en proxy de desarrollo
target: 'https://gillian-semiluminous-blubberingly.ngrok-free.dev/'
```

### 2. **vercel.json**
```json
{
  "rewrites": [
    { 
      "source": "/api/(.*)", 
      "destination": "https://gillian-semiluminous-blubberingly.ngrok-free.dev/$1" 
    }
  ]
}
```

### 3. **.env.production**
```bash
VITE_API_URL=https://gillian-semiluminous-blubberingly.ngrok-free.dev/
```

### 4. **Nuevos archivos**
- `.env.ngrok` - Configuración específica para ngrok
- `README_NGROK_BACKUP.md` - Esta documentación

## 🚀 Deployment en Vercel

### Opción 1: Deployment directo desde GitHub
1. Conectar repo en Vercel
2. Seleccionar rama `ngrok-backup`
3. Variables de entorno en Vercel:
   ```
   VITE_API_URL=/api
   VITE_ENV=production
   ```
4. Deploy automático

### Opción 2: Deployment manual
```bash
# Desde esta rama
npm run build:prod
vercel --prod
```

## 🔧 Desarrollo Local

```bash
# Usar configuración ngrok
cp .env.ngrok .env

# O usar proxy automático (recomendado)
cp .env.example .env

# Iniciar desarrollo
npm run dev
```

## 🌐 URLs de Acceso

### Desarrollo Local
- **Frontend**: http://localhost:5174
- **Backend**: https://gillian-semiluminous-blubberingly.ngrok-free.dev

### Producción Vercel
- **Frontend**: `[tu-app].vercel.app` (se configura al hacer deploy)
- **Backend**: https://gillian-semiluminous-blubberingly.ngrok-free.dev (via proxy)

## ⚠️ Importante

1. **URL de ngrok puede cambiar**: Si el túnel ngrok se reinicia, actualizar la URL en:
   - `vite.config.ts`
   - `vercel.json` 
   - `.env.production`
   - `.env.ngrok`

2. **Headers de ngrok**: El sistema automáticamente agrega `ngrok-skip-browser-warning: true`

3. **Sincronización**: Esta rama se puede mergear con `develop` cuando sea necesario

## 🔄 Comandos Útiles

```bash
# Cambiar a rama principal
git checkout develop

# Cambiar a rama ngrok
git checkout ngrok-backup

# Actualizar URL de ngrok (si cambia)
# Editar manualmente los archivos mencionados arriba

# Test local con ngrok
npm run dev

# Build para Vercel
npm run build:prod
```

## 📋 Checklist para Actualización de URL

Si la URL de ngrok cambia, actualizar en:

- [ ] `vite.config.ts` (línea ~95)
- [ ] `vercel.json` (destination)
- [ ] `.env.production` (VITE_API_URL)
- [ ] `.env.ngrok` (VITE_API_URL)
- [ ] Este README (todas las referencias)

---

**Fecha de creación**: 11 de diciembre de 2025  
**Backend ngrok**: https://gillian-semiluminous-blubberingly.ngrok-free.dev  
**Propósito**: Rama de respaldo para deployment alternativo