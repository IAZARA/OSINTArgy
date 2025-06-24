#!/bin/bash

# Script de deployment para osintargy.online
set -e

echo "🚀 Iniciando deployment de OSINTArgy..."

# Variables
DOMAIN="osintargy.online"
SERVER_IP="67.205.156.229"
USER="root"

echo "📦 Subiendo archivos al servidor..."
rsync -avz --exclude node_modules --exclude .git . $USER@$SERVER_IP:/var/www/osintargy/

echo "🔧 Configurando servidor..."
ssh $USER@$SERVER_IP << 'EOF'
cd /var/www/osintargy

# Generar passwords seguros si no existen
if [ ! -f .env ]; then
    echo "Generando archivo .env..."
    MONGO_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    
    cat > .env << ENVEOF
MONGO_PASSWORD=$MONGO_PASSWORD
JWT_SECRET=$JWT_SECRET
ENVEOF
fi

# Construir y levantar contenedores
echo "🐳 Construyendo contenedores..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Esperar a que los servicios estén listos
echo "⏳ Esperando servicios..."
sleep 30

echo "✅ Deployment completado!"
EOF

echo "🌐 Configurando Nginx y SSL..."
ssh $USER@$SERVER_IP << 'EOF'
# Configurar Nginx
cat > /etc/nginx/sites-available/osintargy << 'NGINXEOF'
server {
    listen 80;
    server_name osintargy.online www.osintargy.online;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/osintargy /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Obtener certificado SSL
certbot --nginx -d osintargy.online -d www.osintargy.online --non-interactive --agree-tos --email admin@osintargy.online

echo "🎉 ¡Deployment completado! Tu sitio está disponible en https://osintargy.online"
EOF