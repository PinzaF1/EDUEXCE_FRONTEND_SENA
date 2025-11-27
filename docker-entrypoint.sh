#!/bin/sh
# ============================================
# Docker Entrypoint para Frontend
# ============================================
# Permite configurar variables de entorno en runtime
# Útil para cambiar VITE_API_URL sin rebuild
# ============================================

set -e

echo "🚀 Iniciando Frontend EDUEXCE..."

# Variables de entorno con valores por defecto
VITE_API_URL=${VITE_API_URL:-http://52.20.236.109:3333}
VITE_ENV=${VITE_ENV:-production}

echo "📡 Backend API URL: $VITE_API_URL"
echo "🌍 Environment: $VITE_ENV"

# Reemplazar variables de entorno en archivos JS (si es necesario)
# Esto permite cambiar VITE_API_URL sin reconstruir la imagen
if [ -n "$VITE_API_URL_OVERRIDE" ]; then
    echo "⚙️  Aplicando override de API URL..."
    find /usr/share/nginx/html/assets -name '*.js' -type f -exec sed -i "s|http://52.20.236.109:3333|$VITE_API_URL_OVERRIDE|g" {} \;
fi

echo "✅ Frontend listo para servir en puerto 80"

# Ejecutar comando original (nginx)
exec "$@"
