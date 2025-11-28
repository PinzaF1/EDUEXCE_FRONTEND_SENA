# ----------------------------------------------------
# 1. Construcción del frontend (React + TypeScript)
# ----------------------------------------------------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# ----------------------------------------------------
# 2. Imagen final: NGINX para producción
# ----------------------------------------------------
FROM nginx:stable-alpine

# borrar la versión del server para seguridad
RUN sed -i 's/server_tokens on;/server_tokens off;/g' /etc/nginx/nginx.conf || true

# eliminar configuración por defecto
RUN rm -rf /usr/share/nginx/html/*

# copiar build
COPY --from=build /app/dist /usr/share/nginx/html

# copiar configuración custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
