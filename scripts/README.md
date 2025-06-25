# Scripts de Despliegue - OSINTArgy

## deploy_production.sh

Script principal para el despliegue de producción de OSINTArgy.

### Funcionalidades

1. **Limpieza completa del entorno Docker**
   - Detiene todos los contenedores
   - Elimina volúmenes y redes
   - Garantiza un despliegue limpio

2. **Limpieza del repositorio Git**
   - Elimina archivos no rastreados
   - Revierte cambios locales
   - Actualiza con la última versión

3. **Gestión de configuración**
   - Verifica existencia de .env
   - Solicita credenciales si no existen
   - Protege información sensible

4. **Construcción y lanzamiento**
   - Construye imágenes desde cero
   - Lanza servicios en modo producción
   - Muestra información de estado

### Uso

```bash
cd /path/to/OSINTArgy
./scripts/deploy_production.sh
```

## nginx-example.conf

Configuración de ejemplo para Nginx como proxy inverso.

### Características

- Redirección HTTP → HTTPS
- Proxy para frontend (puerto 8080)
- Proxy para backend API (puerto 3000)
- Headers de proxy configurados correctamente

### Instalación en servidor

1. Copiar a `/etc/nginx/sites-available/osintargy.online`
2. Crear enlace simbólico: `ln -s /etc/nginx/sites-available/osintargy.online /etc/nginx/sites-enabled/`
3. Configurar certificados SSL
4. Reiniciar Nginx: `systemctl restart nginx`