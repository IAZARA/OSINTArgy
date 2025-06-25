# Plan de Despliegue de Producción para OSINTArgy

Este documento detalla el plan de acción para estandarizar y automatizar el despliegue de la aplicación OSINTArgy en un entorno de producción.

## Fase 1: Diagnóstico de la Arquitectura Actual

El análisis de la configuración del proyecto (`docker-compose.prod.yml`, `.env.production`) confirma que la aplicación está diseñada para funcionar con un **proxy inverso** (como Nginx o Apache) en el servidor de producción.

### Flujo de Tráfico Esperado

1.  **Usuario Final**: Accede a la aplicación a través de un dominio público (ej: `https://osintargy.online`).
2.  **Proxy Inverso**: Recibe todas las peticiones.
    *   Si la ruta solicitada es la raíz (`/`) o cualquier otra ruta de la interfaz, el proxy reenvía la petición al contenedor del **frontend** (expuesto en `127.0.0.1:8080`).
    *   Si la ruta solicitada comienza con `/api/`, el proxy reenvía la petición al contenedor del **backend** (expuesto en `127.0.0.1:3000`).
3.  **Contenedores Docker**:
    *   **Frontend**: Sirve la aplicación de React. Está configurado con `VITE_API_URL=/api` para hacer llamadas a la API a través del proxy.
    *   **Backend**: Procesa la lógica de negocio. Está configurado con `CORS_ORIGIN` para aceptar peticiones únicamente desde el dominio público, garantizando la seguridad.
    *   **MongoDB**: Almacena los datos de la aplicación.

### Conclusión del Diagnóstico

La arquitectura es sólida y sigue las mejores prácticas de despliegue. Los problemas de funcionamiento previos probablemente se debieron a una configuración incorrecta del proxy inverso en el servidor o a inconsistencias en los archivos locales, problemas que este plan resolverá.

---

## Fase 2: Plan de Implementación

### 1. Limpieza y Creación del Nuevo Script de Despliegue

Se eliminarán todos los scripts de la carpeta `scripts/` y se reemplazarán por un único script llamado `deploy_production.sh`.

**Acciones del script `deploy_production.sh`:**

1.  **Detener y Eliminar Entorno Anterior**: Ejecuta `docker-compose -f docker-compose.prod.yml down -v` para detener y eliminar todos los contenedores, redes y volúmenes asociados a la aplicación. Esto asegura una limpieza total, incluida la base de datos.
2.  **Limpiar Repositorio Local**: Ejecuta `git clean -fdX` para eliminar todos los archivos y directorios no rastreados por Git, y `git reset --hard origin/main` para deshacer cualquier cambio local. Esto garantiza que el código base sea idéntico al del repositorio.
3.  **Actualizar Repositorio**: Ejecuta `git pull origin main` para descargar la última versión del código.
4.  **Crear Archivo de Entorno (`.env`)**: Verifica si el archivo `.env` existe. Si no, lo crea a partir de `.env.example` y solicita al usuario que ingrese los valores para `MONGO_PASSWORD` y `JWT_SECRET`.
5.  **Construir y Lanzar**: Ejecuta `docker-compose -f docker-compose.prod.yml up --build -d` para construir las imágenes de Docker desde cero y lanzar la aplicación en modo de producción.

### 2. Configuración Requerida en el Servidor (Proxy Inverso)

El script preparará la aplicación, pero el servidor anfitrión necesita un proxy inverso configurado para exponerla al mundo.

**Ejemplo de Configuración para Nginx:**

```nginx
# /etc/nginx/sites-available/osintargy.online

server {
    listen 80;
    server_name osintargy.online;

    # Redirigir todo el tráfico HTTP a HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name osintargy.online;

    # Configuración de SSL (ejemplo con Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/osintargy.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/osintargy.online/privkey.pem;

    # Servir el frontend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Redirigir las llamadas a la API al backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Fase 3: Diagrama del Flujo de Despliegue

Este diagrama visualiza el proceso que ejecutará el script `deploy_production.sh`.

```mermaid
graph TD
    A[Usuario ejecuta ./deploy_production.sh] --> B{¿Existe .env?};
    B -- No --> C[Solicitar secretos y crear .env];
    B -- Sí --> D[Leer .env existente];
    C --> D;
    D --> E[Limpieza Profunda: docker-compose down -v];
    E --> F[Limpieza de Archivos: git clean -fdX & git reset];
    F --> G[Actualizar Código: git pull origin main];
    G --> H[Construir y Lanzar: docker-compose up --build -d];
    H --> I((Aplicación Desplegada y Corriendo));