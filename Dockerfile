# ============================================
# DOCKERFILE MULTI-STAGE PARA REACT + VITE
# ============================================
# Stage 1: Build (Node.js para compilar)
# Stage 2: Production (Nginx para servir)
# ============================================

# ============================================
# STAGE 1: BUILD
# ============================================
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="EDUEXCE Team"
LABEL description="Frontend React + Vite para EDUEXCE"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar TODAS las dependencias (necesarias para el build)
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Variables de entorno de build (se pueden sobrescribir)
ARG VITE_API_URL=http://52.20.236.109:3333
ARG VITE_ENV=production

# Establecer variables de entorno
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

# Build de producción optimizado
RUN npm run build

# ============================================
# STAGE 2: PRODUCTION (Nginx)
# ============================================
FROM nginx:1.25-alpine AS production

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Agregar script de inicio para reemplazar variables de entorno en runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Comando de inicio
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
