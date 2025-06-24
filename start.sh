#!/bin/bash

# OSINTArgy - Script de inicio con gestión automática de puertos
# Este script verifica y libera puertos ocupados antes de iniciar frontend y backend

echo "🚀 Iniciando OSINTArgy..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Puertos por defecto
FRONTEND_PORT=5173
BACKEND_PORT=3001

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    lsof -ti:$port > /dev/null 2>&1
    return $?
}

# Función para liberar un puerto
kill_port() {
    local port=$1
    local service_name=$2
    
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Puerto $port ocupado por $service_name${NC}"
        local pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}🔄 Cerrando proceso en puerto $port (PID: $pid)${NC}"
            kill -9 $pid 2>/dev/null
            sleep 2
            
            # Verificar si el proceso se cerró
            if check_port $port; then
                echo -e "${RED}❌ No se pudo liberar el puerto $port${NC}"
                return 1
            else
                echo -e "${GREEN}✅ Puerto $port liberado${NC}"
                return 0
            fi
        fi
    else
        echo -e "${GREEN}✅ Puerto $port disponible${NC}"
        return 0
    fi
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias...${NC}"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js no está instalado${NC}"
        exit 1
    fi
    
    # Verificar NPM
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ NPM no está instalado${NC}"
        exit 1
    fi
    
    # Verificar MongoDB
    if ! pgrep -x "mongod" > /dev/null; then
        echo -e "${YELLOW}⚠️  MongoDB no está ejecutándose. Intentando iniciar...${NC}"
        # Intentar iniciar MongoDB (esto puede variar según la instalación)
        if command -v brew &> /dev/null; then
            brew services start mongodb-community 2>/dev/null || \
            brew services start mongodb/brew/mongodb-community 2>/dev/null || \
            echo -e "${YELLOW}⚠️  Por favor, inicia MongoDB manualmente${NC}"
        fi
    else
        echo -e "${GREEN}✅ MongoDB ejecutándose${NC}"
    fi
    
    echo -e "${GREEN}✅ Dependencias verificadas${NC}"
}

# Función para instalar dependencias si no existen
install_dependencies() {
    echo -e "${BLUE}📦 Verificando instalación de dependencias...${NC}"
    
    # Verificar node_modules en raíz
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependencias raíz...${NC}"
        npm install
    fi
    
    # Verificar node_modules en frontend
    if [ ! -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependencias frontend...${NC}"
        cd frontend && npm install && cd ..
    fi
    
    # Verificar node_modules en backend
    if [ ! -d "backend/node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependencias backend...${NC}"
        cd backend && npm install && cd ..
    fi
    
    echo -e "${GREEN}✅ Todas las dependencias instaladas${NC}"
}

# Función para limpiar procesos al salir
cleanup() {
    echo -e "\n${YELLOW}🛑 Cerrando aplicación...${NC}"
    
    # Matar procesos de frontend y backend
    pkill -f "vite" 2>/dev/null
    pkill -f "nodemon" 2>/dev/null
    pkill -f "node.*src/app.js" 2>/dev/null
    
    echo -e "${GREEN}✅ Aplicación cerrada correctamente${NC}"
    exit 0
}

# Capturar señales para cleanup
trap cleanup SIGINT SIGTERM

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde el directorio raíz de OSINTArgy${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Preparando entorno...${NC}"

# Verificar dependencias del sistema
check_dependencies

# Instalar dependencias si es necesario
install_dependencies

# Liberar puertos
echo -e "${BLUE}🔌 Verificando puertos...${NC}"
kill_port $FRONTEND_PORT "Frontend (Vite)"
kill_port $BACKEND_PORT "Backend (Node.js)"

# Esperar un momento para que los puertos se liberen completamente
sleep 2

# Verificar que los puertos estén realmente libres
if check_port $FRONTEND_PORT; then
    echo -e "${RED}❌ No se pudo liberar el puerto $FRONTEND_PORT${NC}"
    exit 1
fi

if check_port $BACKEND_PORT; then
    echo -e "${RED}❌ No se pudo liberar el puerto $BACKEND_PORT${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Puertos listos para usar${NC}"

# Configurar variables de entorno
export PORT=$BACKEND_PORT
export VITE_API_URL="http://localhost:$BACKEND_PORT/api"

# Mostrar información de inicio
echo -e "${BLUE}📋 Información de inicio:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:$BACKEND_PORT${NC}"
echo -e "   API:      ${GREEN}http://localhost:$BACKEND_PORT/api${NC}"
echo -e "${YELLOW}   Presiona Ctrl+C para detener la aplicación${NC}"
echo ""

# Iniciar aplicación usando concurrently
echo -e "${GREEN}🚀 Iniciando OSINTArgy...${NC}"
echo ""

# Usar concurrently para ejecutar frontend y backend
npx concurrently \
  --prefix "[{name}]" \
  --names "FRONTEND,BACKEND" \
  --prefix-colors "cyan,magenta" \
  "cd frontend && npm run dev -- --port $FRONTEND_PORT" \
  "cd backend && PORT=$BACKEND_PORT npm run dev"