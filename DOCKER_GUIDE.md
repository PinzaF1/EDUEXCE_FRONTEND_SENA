# 🐳 Guía Docker - EDUEXCE Frontend

## 📋 Archivos Docker Incluidos

```
.
├── Dockerfile              → Producción (multi-stage con Nginx)
├── Dockerfile.dev          → Desarrollo (hot-reload)
├── docker-compose.yml      → Orquestación dev + prod
├── docker-compose.prod.yml → Solo producción
├── nginx.conf              → Configuración Nginx (SPA routing)
├── docker-entrypoint.sh    → Script de inicio
└── .dockerignore           → Excluir archivos innecesarios
```

---

## 🚀 Uso Rápido

### **Desarrollo (Hot Reload)**

```powershell
# Levantar servidor de desarrollo
docker-compose up frontend-dev

# Acceder a:
http://localhost:5173
```

**Características:**
- ✅ Hot-reload automático al editar código
- ✅ Volumen montado (cambios en tiempo real)
- ✅ Puerto 5173 (Vite default)

---

### **Producción (Nginx)**

```powershell
# Build y levantar
docker-compose up frontend-prod

# Acceder a:
http://localhost:8080
```

**Características:**
- ✅ Build optimizado de Vite
- ✅ Servido con Nginx (alta performance)
- ✅ Compresión Gzip habilitada
- ✅ Cache headers optimizados
- ✅ SPA routing configurado

---

## 🛠️ Comandos Docker

### **1. Build de Imágenes**

```powershell
# Build producción
docker build -t eduexce/frontend:latest .

# Build desarrollo
docker build -f Dockerfile.dev -t eduexce/frontend:dev .

# Build con variables personalizadas
docker build \
  --build-arg VITE_API_URL=http://tu-backend.com:3333 \
  -t eduexce/frontend:latest .
```

---

### **2. Ejecutar Contenedores**

#### **Desarrollo**
```powershell
# Con docker-compose
docker-compose up frontend-dev

# Con docker run
docker run -d \
  -p 5173:5173 \
  -v ${PWD}:/app \
  -v /app/node_modules \
  --name frontend-dev \
  eduexce/frontend:dev
```

#### **Producción**
```powershell
# Con docker-compose
docker-compose up frontend-prod

# Con docker run
docker run -d \
  -p 8080:80 \
  -e VITE_API_URL=http://52.20.236.109:3333 \
  --name frontend-prod \
  eduexce/frontend:latest
```

---

### **3. Gestión de Contenedores**

```powershell
# Ver contenedores corriendo
docker ps

# Ver logs
docker logs -f eduexce-frontend-prod

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar
docker-compose restart frontend-prod

# Acceder al shell del contenedor
docker exec -it eduexce-frontend-prod sh
```

---

### **4. Limpieza**

```powershell
# Eliminar contenedores
docker-compose down

# Eliminar imágenes
docker rmi eduexce/frontend:latest

# Limpiar todo (imágenes, contenedores, volúmenes)
docker system prune -a --volumes
```

---

## 🌐 Deploy en Producción

### **Opción 1: Docker en VPS/EC2**

#### **1. Subir código al servidor**
```bash
# En tu servidor
git clone https://github.com/PinzaF1/ZAVIRA_SENA_FRONTEND.git
cd ZAVIRA_SENA_FRONTEND
```

#### **2. Build y ejecutar**
```bash
# Build la imagen
docker build -t eduexce/frontend:latest .

# Ejecutar en puerto 80
docker run -d \
  -p 80:80 \
  --restart always \
  --name eduexce-frontend \
  eduexce/frontend:latest
```

#### **3. Con Nginx Reverse Proxy (Recomendado)**
```nginx
# /etc/nginx/sites-available/frontend
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar y recargar Nginx
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### **Opción 2: Docker Hub**

#### **1. Subir imagen a Docker Hub**
```powershell
# Login
docker login

# Tag
docker tag eduexce/frontend:latest tu-usuario/eduexce-frontend:latest

# Push
docker push tu-usuario/eduexce-frontend:latest
```

#### **2. Descargar en servidor**
```bash
# En tu servidor
docker pull tu-usuario/eduexce-frontend:latest

docker run -d \
  -p 80:80 \
  --restart always \
  --name eduexce-frontend \
  tu-usuario/eduexce-frontend:latest
```

---

### **Opción 3: AWS ECS (Elastic Container Service)**

#### **1. Crear repositorio ECR**
```bash
aws ecr create-repository --repository-name eduexce-frontend --region us-east-1
```

#### **2. Push a ECR**
```bash
# Login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag
docker tag eduexce/frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/eduexce-frontend:latest

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/eduexce-frontend:latest
```

#### **3. Crear servicio ECS**
Usar AWS Console o CLI para crear:
- Task Definition
- ECS Service
- Load Balancer (opcional)

---

## 🔧 Configuración Avanzada

### **Variables de Entorno**

Crear archivo `.env.docker`:
```env
VITE_API_URL=http://52.20.236.109:3333
VITE_ENV=production
```

Usar con docker-compose:
```yaml
services:
  frontend-prod:
    env_file:
      - .env.docker
```

---

### **Multi-stage Build Explicado**

```dockerfile
# Stage 1: Build (Node.js)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production (Nginx)
FROM nginx:1.25-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Beneficios:**
- ✅ Imagen final más pequeña (~30 MB vs ~300 MB con Node)
- ✅ Solo incluye archivos estáticos + Nginx
- ✅ Más seguro (sin Node.js en producción)

---

### **Health Check**

Docker verifica automáticamente cada 30s:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1
```

Ver estado:
```powershell
docker ps
# HEALTH: healthy | unhealthy | starting
```

---

## 📊 Comparación: Docker vs S3+CloudFront

| Característica | Docker (VPS/EC2) | S3 + CloudFront |
|----------------|------------------|-----------------|
| **Costo** | ~$5-10/mes | $0 (Free Tier) |
| **Setup** | 5 minutos | 15 minutos |
| **Performance** | Bueno | Excelente (CDN) |
| **Escalabilidad** | Manual | Automática |
| **Mantenimiento** | Medio | Bajo |
| **SSL** | Manual (Let's Encrypt) | Gratis (CloudFront) |
| **Deploy** | `docker-compose up` | `aws s3 sync` |

**Recomendación:**
- **Desarrollo/Testing:** Docker 🐳
- **Producción:** S3 + CloudFront ☁️

---

## 🐛 Troubleshooting

### **Error: Port already in use**
```powershell
# Cambiar puerto en docker-compose.yml
ports:
  - "8081:80"  # En lugar de 8080
```

### **Error: Cannot connect to Docker daemon**
```powershell
# Iniciar Docker Desktop
# O en Linux:
sudo systemctl start docker
```

### **Build tarda mucho**
```powershell
# Usar cache de npm
docker build --build-arg BUILDKIT_INLINE_CACHE=1 .
```

### **Hot-reload no funciona**
```powershell
# Verificar volumen montado
docker-compose up frontend-dev

# Logs
docker logs -f eduexce-frontend-dev
```

---

## 📦 Tamaño de Imágenes

```
eduexce/frontend:dev    → ~500 MB (Node + dependencias)
eduexce/frontend:latest → ~30 MB  (Nginx + archivos estáticos)
```

---

## ✅ Checklist de Deploy con Docker

- [ ] Build imagen: `docker build -t eduexce/frontend:latest .`
- [ ] Probar localmente: `docker run -p 8080:80 eduexce/frontend:latest`
- [ ] Verificar en navegador: `http://localhost:8080`
- [ ] Verificar health: `http://localhost:8080/health`
- [ ] Push a registry (Docker Hub / ECR)
- [ ] Deploy en servidor
- [ ] Configurar reverse proxy (si aplica)
- [ ] Configurar SSL (Let's Encrypt)
- [ ] Monitorear logs: `docker logs -f container-name`

---

## 🎯 Comandos de Un Solo Paso

```powershell
# Desarrollo
docker-compose up frontend-dev

# Producción local
docker-compose up frontend-prod

# Build y ejecutar producción
docker-compose -f docker-compose.prod.yml up --build -d

# Ver logs
docker-compose logs -f frontend-prod

# Reiniciar
docker-compose restart frontend-prod

# Detener todo
docker-compose down
```

---

## 🚀 Deploy Rápido en VPS

```bash
# 1. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Clonar repo
git clone https://github.com/PinzaF1/ZAVIRA_SENA_FRONTEND.git
cd ZAVIRA_SENA_FRONTEND

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 4. Verificar
curl http://localhost:80/health
```

---

**¡Tu frontend ahora está dockerizado y listo para deployar en cualquier lugar! 🐳🚀**
