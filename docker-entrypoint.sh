#!/bin/sh
set -e

echo "Iniciando contenedor de EDUEXCE Frontend..."

# Iniciar Nginx en primer plano
exec "$@"
