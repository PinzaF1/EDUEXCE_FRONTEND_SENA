# 🚀 QUICK START - EDUEXCE Frontend con Docker

## ✅ **¿Por qué Docker?**

| Ventaja | Descripción |
|---------|-------------|
| 🚀 **Deploy Rápido** | `docker-compose up` y listo |
| 📦 **Portabilidad** | Funciona igual en Windows, Mac, Linux |
| 🔄 **Consistencia** | Mismo ambiente en dev/prod |
| 🎯 **Simplicidad** | No necesitas instalar Node, npm, etc. |
| 🐳 **Estándar** | Fácil integración con CI/CD |

---

## 🎯 **Dos Opciones de Deploy**

### **Opción 1: Docker (Recomendado para VPS/EC2)** 🐳
- ✅ **Setup:** 5 minutos
- ✅ **Costo:** $5-10/mes (VPS)
- ✅ **Control total:** Tu propio servidor
- ✅ **Ideal para:** Testing, staging, producción simple

### **Opción 2: S3 + CloudFront (Recomendado para producción escalable)** ☁️
- ✅ **Setup:** 15 minutos
- ✅ **Costo:** $0/mes (Free Tier por 12 meses)
- ✅ **CDN global:** Performance excelente
- ✅ **Ideal para:** Producción, alta disponibilidad

---

## 🏃 **START EN 30 SEGUNDOS**

### **Desarrollo (con hot-reload)**
```powershell
# Levantar
npm run docker:dev

# Acceder
http://localhost:5173
```

### **Producción (con Nginx)**
```powershell
# Build y levantar
npm run docker:prod

# Acceder
http://localhost:8080
```

---

## 📦 **Scripts npm Disponibles**

### **Docker**
```powershell
npm run docker:dev    # Desarrollo con hot-reload
npm run docker:prod   # Producción con Nginx
npm run docker:build  # Solo build de imagen
npm run docker:run    # Ejecutar imagen ya buildeada
```

### **S3 + CloudFront**
```powershell
npm run build:prod         # Build optimizado
npm run build:analyze      # Build + análisis de tamaño
npm run deploy:s3          # Subir a S3
npm run deploy:invalidate  # Invalidar caché CloudFront
npm run deploy:full        # Deploy completo (todo en uno)
```

---

## 🐳 **Comandos Docker Útiles**

```powershell
# Ver contenedores corriendo
docker ps

# Ver logs
docker logs -f eduexce-frontend-prod

# Detener
docker-compose down

# Reconstruir imagen
docker-compose up --build frontend-prod

# Ver tamaño de imagen
docker images | grep eduexce

# Entrar al contenedor
docker exec -it eduexce-frontend-prod sh
```

---

## 🌐 **Deploy en VPS/EC2 con Docker**

### **Paso 1: Conectar al servidor**
```bash
ssh usuario@tu-servidor.com
```

### **Paso 2: Instalar Docker (si no está instalado)**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### **Paso 3: Clonar repo**
```bash
git clone https://github.com/PinzaF1/ZAVIRA_SENA_FRONTEND.git
cd ZAVIRA_SENA_FRONTEND
```

### **Paso 4: Deploy**
```bash
# Con docker-compose
docker-compose -f docker-compose.prod.yml up -d

# O manual
docker build -t eduexce/frontend:latest .
docker run -d -p 80:80 --restart always --name eduexce-frontend eduexce/frontend:latest
```

### **Paso 5: Verificar**
```bash
curl http://localhost:80/health
# Respuesta: healthy
```

---

## 🔄 **Actualizar Frontend (Deploy nuevo)**

```bash
# 1. Pull cambios
git pull origin develop

# 2. Rebuild y restart
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Limpiar imágenes antiguas (opcional)
docker system prune -a
```

---

## 📊 **Comparación: Docker vs S3**

| Característica | Docker (VPS) | S3 + CloudFront |
|----------------|--------------|-----------------|
| **Costo inicial** | $5-10/mes | $0 (12 meses) |
| **Setup** | 5 min | 15 min |
| **Mantenimiento** | Medio | Bajo |
| **Escalabilidad** | Manual | Automática |
| **Performance** | Bueno | Excelente |
| **SSL** | Manual | Gratis |
| **Deploy** | `docker-compose up` | `aws s3 sync` |

### **Recomendación:**
- **Testing/Staging:** Docker 🐳
- **Producción:** S3 + CloudFront ☁️ (más barato y escalable)

---

## 🎯 **¿Cuándo usar cada uno?**

### **Usa Docker si:**
- ✅ Tienes un VPS/EC2 disponible
- ✅ Quieres control total del servidor
- ✅ Necesitas hacer testing rápido
- ✅ Vas a tener backend y frontend en el mismo servidor

### **Usa S3 + CloudFront si:**
- ✅ Quieres **GRATIS** por 12 meses
- ✅ Necesitas CDN global (mejor performance)
- ✅ Quieres escalabilidad automática
- ✅ No quieres mantener un servidor

---

## 📁 **Archivos Docker Creados**

```
✅ Dockerfile              → Producción (multi-stage)
✅ Dockerfile.dev          → Desarrollo (hot-reload)
✅ docker-compose.yml      → Orquestación dev + prod
✅ docker-compose.prod.yml → Solo producción
✅ nginx.conf              → Config Nginx (SPA routing)
✅ docker-entrypoint.sh    → Script de inicio
✅ .dockerignore           → Excluir archivos
✅ DOCKER_GUIDE.md         → Guía completa
```

---

## 🚀 **Deploy Recomendado para Producción**

### **Plan A: Docker en EC2 (Simple)** 🐳
```bash
# 1. EC2 t2.micro (Free Tier)
# 2. Instalar Docker
# 3. docker-compose up
# 4. Configurar SSL con Let's Encrypt
```
**Costo:** $0 (Free Tier) o $5-10/mes después

### **Plan B: S3 + CloudFront (Escalable)** ☁️
```powershell
# 1. aws s3 mb s3://eduexce-frontend-prod
# 2. Configurar CloudFront
# 3. npm run deploy:full
```
**Costo:** $0 (Free Tier por 12 meses)

---

## 📞 **Ayuda Rápida**

### **Error: Port already in use**
```powershell
# Cambiar puerto en docker-compose.yml
ports:
  - "8081:80"
```

### **Error: Cannot connect to Docker daemon**
```powershell
# Iniciar Docker Desktop en Windows
# O en Linux: sudo systemctl start docker
```

### **Ver logs si algo falla**
```powershell
docker logs -f eduexce-frontend-prod
```

### **Reconstruir desde cero**
```powershell
docker-compose down
docker system prune -a
docker-compose up --build frontend-prod
```

---

## ✅ **RESUMEN EJECUTIVO**

### **Tu frontend AHORA tiene:**
1. ✅ **Docker completo** para dev y prod
2. ✅ **Nginx optimizado** con SPA routing
3. ✅ **Scripts npm** para deploy fácil
4. ✅ **Multi-stage build** (imagen de 30MB)
5. ✅ **Hot-reload** en desarrollo
6. ✅ **Health checks** automáticos
7. ✅ **Compresión gzip** habilitada
8. ✅ **Cache optimizado** para CloudFront/Nginx

### **Próximo paso:**
Elige tu estrategia:
- **Docker:** `npm run docker:prod` → Listo en 2 minutos
- **S3:** Sigue `DEPLOY_GUIDE.md` → Listo en 15 minutos

---

**¡Ahora dockerizar el frontend es más fácil que nunca! 🐳🚀**
