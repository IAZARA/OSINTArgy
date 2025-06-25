#!/bin/bash

echo "====================================================="
echo "OSINTArgy - Solución de Problema de Logs"
echo "====================================================="
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "backend/src/app.js" ]; then
    echo "Error: No se encontró backend/src/app.js"
    echo "Ejecuta este script desde el directorio raíz del proyecto OSINTArgy"
    exit 1
fi

echo "1. Creando backup del archivo app.js..."
cp backend/src/app.js backend/src/app.js.backup
echo "   ✓ Backup creado: backend/src/app.js.backup"
echo ""

echo "2. Buscando y reemplazando rutas de logs..."
# Buscar la línea que contiene mkdir '/logs' y cambiarla por '/app/logs'
sed -i "s|'/logs'|'/app/logs'|g" backend/src/app.js
sed -i 's|"/logs"|"/app/logs"|g' backend/src/app.js
sed -i 's|/logs|/app/logs|g' backend/src/app.js

echo "   ✓ Rutas de logs actualizadas de '/logs' a '/app/logs'"
echo ""

echo "3. Verificando los cambios realizados..."
grep -n "logs" backend/src/app.js | head -10
echo ""

echo "4. Deteniendo contenedores actuales..."
docker-compose -f docker-compose.prod.yml down
echo ""

echo "5. Reconstruyendo y lanzando la aplicación..."
docker-compose -f docker-compose.prod.yml up --build -d
echo ""

echo "6. Esperando que los servicios se inicialicen..."
sleep 15
echo ""

echo "7. Verificando estado de los contenedores..."
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "8. Verificando logs del backend (últimas 10 líneas)..."
docker-compose -f docker-compose.prod.yml logs --tail=10 backend
echo ""

echo "====================================================="
echo "Solución aplicada!"
echo "====================================================="
echo ""
echo "Si el backend sigue fallando, ejecuta:"
echo "  docker-compose -f docker-compose.prod.yml logs backend"
echo ""
echo "Para verificar que la aplicación funciona:"
echo "  curl http://localhost:8080"
echo "  curl http://localhost:3000/api/health"
echo ""