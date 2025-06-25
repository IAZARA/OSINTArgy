#!/bin/bash

echo "====================================================="
echo "OSINTArgy - Diagnóstico de Despliegue"
echo "====================================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "1. Verificando estado de Docker..."
echo "-----------------------------------"
docker --version
docker-compose --version
echo ""

echo "2. Estado de los contenedores..."
echo "-----------------------------------"
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "3. Logs del backend (últimas 50 líneas)..."
echo "-----------------------------------"
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
echo ""

echo "4. Verificando el problema de permisos..."
echo "-----------------------------------"
echo "Buscando archivo app.js en el backend:"
docker-compose -f docker-compose.prod.yml exec backend find /app -name "app.js" -type f 2>/dev/null || echo "No se pudo acceder al contenedor"
echo ""

echo "5. Verificando estructura de directorios en el contenedor..."
echo "-----------------------------------"
docker-compose -f docker-compose.prod.yml exec backend ls -la /app/ 2>/dev/null || echo "No se pudo acceder al contenedor"
echo ""

echo "6. Verificando usuario que ejecuta el proceso..."
echo "-----------------------------------"
docker-compose -f docker-compose.prod.yml exec backend whoami 2>/dev/null || echo "No se pudo acceder al contenedor"
echo ""

echo "7. Verificando conectividad entre servicios..."
echo "-----------------------------------"
# Verificar si el backend puede conectarse a MongoDB
docker-compose -f docker-compose.prod.yml exec backend ping -c 2 mongodb 2>/dev/null || echo "No se pudo hacer ping a MongoDB"
echo ""

echo "8. Estado de la red Docker..."
echo "-----------------------------------"
docker network ls | grep osintargy
echo ""

echo "9. Verificando puertos expuestos..."
echo "-----------------------------------"
netstat -tlnp 2>/dev/null | grep -E ':(8080|3000|27017)' || ss -tlnp | grep -E ':(8080|3000|27017)'
echo ""

echo "====================================================="
echo "Diagnóstico completado"
echo "====================================================="
echo ""
echo "RESUMEN DEL PROBLEMA DETECTADO:"
echo "--------------------------------"
echo "El backend está intentando crear un directorio '/logs' en la raíz del"
echo "sistema de archivos, pero no tiene permisos porque se ejecuta como"
echo "usuario 'node'. La solución es modificar el código para usar '/app/logs'"
echo "o configurar un volumen Docker para los logs."
echo ""
echo "SOLUCIÓN RÁPIDA:"
echo "----------------"
echo "1. Editar backend/src/app.js y cambiar la ruta de logs"
echo "2. O crear un volumen en docker-compose.prod.yml para /logs"
echo "3. Reconstruir y redesplegar con ./scripts/deploy_production.sh"
echo ""