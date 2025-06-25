#!/bin/bash

set -e

echo "====================================================="
echo "OSINTArgy - Script de Despliegue de Producci�n"
echo "====================================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "1. Deteniendo y eliminando el entorno anterior..."
echo "   - Esto eliminar� todos los contenedores, redes y vol�menes"
docker-compose -f docker-compose.prod.yml down -v || true

echo ""
echo "2. Limpiando el repositorio local..."
echo "   - Eliminando archivos no rastreados por Git"
git clean -fdX
echo "   - Deshaciendo cambios locales"
git reset --hard origin/main

echo ""
echo "3. Actualizando el repositorio..."
git pull origin main

echo ""
echo "4. Configurando variables de entorno..."
if [ ! -f .env ]; then
    echo "   - No se encontr� archivo .env, creando uno nuevo..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "   - Archivo .env creado desde .env.example"
    else
        echo "   - Creando archivo .env b�sico..."
        cat > .env << EOF
NODE_ENV=production
MONGO_PASSWORD=
JWT_SECRET=
EOF
    fi
    
    echo ""
    echo "   IMPORTANTE: Se requiere configurar las siguientes variables:"
    echo ""
    
    read -sp "   Ingrese la contrase�a para MongoDB (MONGO_PASSWORD): " mongo_pass
    echo ""
    sed -i.bak "s/MONGO_PASSWORD=.*/MONGO_PASSWORD=$mongo_pass/" .env
    
    read -sp "   Ingrese el secreto JWT (JWT_SECRET): " jwt_secret
    echo ""
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$jwt_secret/" .env
    
    rm -f .env.bak
    
    echo ""
    echo "   - Variables de entorno configuradas correctamente"
else
    echo "   - Archivo .env encontrado, usando configuraci�n existente"
fi

echo ""
echo "5. Construyendo y lanzando la aplicaci�n..."
docker-compose -f docker-compose.prod.yml up --build -d

echo ""
echo "====================================================="
echo "�Despliegue completado!"
echo "====================================================="
echo ""
echo "La aplicaci�n est� corriendo en:"
echo "  - Frontend: http://127.0.0.1:8080"
echo "  - Backend: http://127.0.0.1:3000"
echo ""
echo "IMPORTANTE: Aseg�rese de que el proxy inverso (Nginx/Apache)"
echo "est� correctamente configurado para servir la aplicaci�n."
echo ""
echo "Para ver los logs de los contenedores:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Para detener la aplicaci�n:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""