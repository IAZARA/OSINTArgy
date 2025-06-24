# OSINTArgy - Plataforma OSINT Integral

🌐 **[ACCEDER A LA PLATAFORMA](https://osintargy.online)** - ¡Disponible online!

## 📋 Descripción

OSINTArgy es una plataforma OSINT integral de código abierto diseñada para democratizar el acceso a herramientas de inteligencia de fuentes abiertas (OSINT) en Argentina y Latinoamérica. Combina una interfaz innovadora tipo galaxia con herramientas especializadas y una base de datos de 200+ recursos OSINT categorizados.

### ¿Qué es OSINTArgy?

Este proyecto personal de **Ivan Agustin Zarate** busca crear una plataforma transparente y educativa para la comunidad OSINT hispanohablante, proporcionando tanto herramientas automatizadas como acceso a recursos especializados, todo en una interfaz cohesiva y visualmente atractiva.

## ✨ Características Principales

- **🌌 Interfaz Galaxy**: Navegación innovadora tipo galaxia con constelaciones (categorías) y estrellas (herramientas)
- **🎯 Generador de Dorks Avanzado**: Creación automática de 400+ Google Dorks especializados
- **📧 OSINT de Emails**: Investigación y verificación de correos electrónicos
- **📄 Análisis de Archivos**: Extracción de metadatos de imágenes y documentos
- **👤 Búsqueda de Usernames**: Localización de perfiles en múltiples plataformas
- **🛡️ Scanner de Infraestructura**: Análisis defensivo de superficie de ataque
- **🇦🇷 Base de Datos Local**: 200+ herramientas categorizadas con enfoque en LATAM
- **🔧 API REST Completa**: Backend robusto con autenticación y gestión de datos

## 🏗️ Arquitectura del Sistema

### Frontend (React + Vite)
- **React 18** con Hooks modernos y Context API
- **Canvas HTML5** para animaciones de galaxia interactiva
- **React Router v6** para navegación SPA
- **CSS Variables** para theming oscuro consistente
- **Lucide React** para iconografía profesional
- **Toast Notifications** para feedback del usuario

### Backend (Node.js + Express)
- **Node.js 18+** con Express.js y arquitectura RESTful
- **MongoDB** con Mongoose ODM para persistencia
- **JWT** para autenticación segura
- **Winston** para logging estructurado
- **Rate Limiting** y CORS para seguridad
- **Helmet.js** para headers de seguridad

## 🧩 Módulos y Funcionamiento

### 🌌 Vista Galaxy (Componente Principal)
La interfaz principal simula una galaxia interactiva donde:
- **Constelaciones**: Representan las 15 categorías OSINT principales
- **Estrellas**: Cada herramienta con brillo basado en su rating
- **Navegación Orbital**: Zoom, rotación y exploración fluida
- **Efectos Visuales**: Nebulosas, partículas y animaciones suaves
- **Modal de Preview**: Vista previa completa antes de abrir herramientas

### 🎯 Generador de Dorks Avanzado
Herramienta estrella que automatiza la creación de Google Dorks:

**Tipos de Búsqueda Disponibles:**
- **Usernames** (10 plantillas): Facebook, Twitter, Instagram, LinkedIn, GitHub, Reddit, YouTube
- **Emails** (8 plantillas): Gmail, Hotmail, Pastebin, HaveIBeenPwned, listas de correos
- **Websites** (8 plantillas): site:, inurl:, intitle:, related:, cache:, link:
- **Documentos** (8 plantillas): PDF, DOC, XLS, PPT por filetype y extensión
- **Imágenes** (20 plantillas): Formatos, tamaños, plataformas como Imgur, Flickr
- **Videos** (21 plantillas): Formatos multimedia, YouTube, Vimeo, Twitch
- **Redes Sociales** (8 plantillas): Principales plataformas sociales
- **Multimedia** (18 plantillas): Plataformas creativas y repositorios

**Funcionalidades:**
- Generación automática de hasta 400+ dorks especializados
- Soporte para 4 motores: Google, Yandex, Bing, DuckDuckGo
- URLs directas para cada búsqueda
- Descarga masiva en formato TXT estructurado
- Apertura en pestañas del navegador
- Filtros avanzados (fechas, términos, exclusiones)

### 📧 Módulo OSINT de Emails
Sistema de investigación de correos electrónicos:
- **Validación de formato** y sintaxis
- **Verificación de existencia** en servidores
- **Búsqueda en múltiples fuentes** y bases de datos
- **Análisis de dominios** asociados
- **Detección de filtraciones** en brechas conocidas

### 📄 Análisis de Archivos
Extractor de metadatos especializado:
- **Imágenes**: EXIF, geolocalización, cámara, fecha
- **Documentos**: Autor, fechas de creación/modificación, software
- **Archivos multimedia**: Duración, resolución, códecs
- **Análisis forense**: Hash, firmas digitales

### 👤 Búsqueda de Usernames
Localizador de perfiles en plataformas:
- **Redes sociales principales**: Facebook, Twitter, Instagram, LinkedIn
- **Plataformas técnicas**: GitHub, GitLab, Stack Overflow
- **Foros y comunidades**: Reddit, Discord, Telegram
- **Sitios especializados**: según región y temática

### 🛡️ Scanner de Infraestructura
Herramienta de análisis defensivo:
- **Escaneo de puertos** y servicios
- **Detección de tecnologías** web
- **Análisis de superficie** de ataque
- **Verificación de configuraciones** de seguridad
- **Reportes estructurados** de hallazgos

### 🗃️ Base de Datos de Herramientas
Sistema de catalogación con 200+ herramientas:

**15 Categorías Principales:**
1. **Buscadores** y motores especializados
2. **Redes Sociales** y análisis de perfiles
3. **Email** y comunicaciones
4. **Teléfonos** y mensajería
5. **Geolocalización** y mapas
6. **Dominios** e infraestructura IP
7. **Imágenes** y análisis visual
8. **Archivos** y documentos
9. **Darkweb** y amenazas
10. **Criptomonedas** y blockchain
11. **Argentina** y LATAM específico
12. **Infraestructura** y sistemas
13. **Análisis** y visualización
14. **Utilidades** generales
15. **Nuevas herramientas**

**Cada herramienta incluye:**
- URL directa y estado de funcionamiento
- Descripción detallada de funcionalidad
- Tags y categorización múltiple
- Rating comunitario y estadísticas de uso
- Información de acceso (gratuito/pago, registro requerido)
- Nivel de dificultad (principiante a experto)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ LTS
- MongoDB 5.0+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/OSINTArgy.git
cd OSINTArgy
```

### 2. Instalar dependencias
```bash
# Instalar todas las dependencias (frontend + backend)
npm run install:all

# O instalar por separado
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3. Configurar variables de entorno

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Editar `backend/.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/osintargy
JWT_SECRET=tu_jwt_secret_muy_seguro
FRONTEND_URL=http://localhost:5173
```

### 4. Inicializar la base de datos
```bash
cd backend
npm run seed
```

### 5. Ejecutar la aplicación

#### Desarrollo (Frontend + Backend)
```bash
npm run dev
```

#### Por separado
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📱 Uso

### Acceso a la Aplicación
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### Credenciales de Administrador
- **Email**: admin@osintargy.online
- **Password**: admin123

### Funcionalidades Principales

#### 🌳 Vista Árbol
- Navegación visual interactiva con D3.js
- Zoom y pan para explorar categorías
- Nodos clickeables para seleccionar categorías
- Información contextual en tiempo real

#### 🃏 Vista Cards
- Interfaz moderna de tarjetas
- Filtros avanzados (región, dificultad, tipo, precio)
- Ordenamiento múltiple
- Vista lista y cuadrícula

#### 👤 Sistema de Usuario
- **Favoritos**: Guarda herramientas para acceso rápido
- **Historial**: Rastrea herramientas visitadas
- **Notas**: Crea notas personales sobre investigaciones
- **Configuración**: Personaliza preferencias

## 🛠️ Desarrollo

### Estructura del Proyecto
```
OSINTArgy/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios API
│   │   ├── styles/         # Estilos globales
│   │   ├── data/           # Datos estáticos
│   │   └── utils/          # Utilidades
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos MongoDB
│   │   ├── routes/         # Rutas API
│   │   ├── middleware/     # Middleware
│   │   └── config/         # Configuración
│   └── scripts/            # Scripts de utilidad
└── docs/                   # Documentación
```

### Scripts Disponibles

#### Raíz del proyecto
```bash
npm run dev              # Ejecutar frontend + backend
npm run build           # Build del frontend
npm run install:all     # Instalar todas las dependencias
npm run test           # Ejecutar tests
```

#### Frontend
```bash
npm run dev            # Servidor de desarrollo
npm run build          # Build para producción
npm run preview        # Preview del build
npm run lint           # Linting
```

#### Backend
```bash
npm run dev            # Servidor con nodemon
npm start              # Servidor de producción
npm run seed           # Inicializar base de datos
npm test               # Tests
```

### Agregar Nuevas Herramientas

#### 1. Formato JSON
```json
{
  "id": "herramienta-unica",
  "name": "Nombre de la Herramienta",
  "description": "Descripción breve",
  "utility": "Para qué sirve específicamente",
  "url": "https://ejemplo.com",
  "category": "categoria-id",
  "subcategory": "subcategoria-id",
  "tags": ["tag1", "tag2"],
  "type": "web|desktop|mobile|api|browser-extension",
  "indicators": ["D", "R", "F", "P", "A"],
  "region": "argentina|latam|internacional",
  "language": "es|en|multi",
  "difficulty_level": "beginner|intermediate|advanced|expert",
  "is_free": true,
  "requires_registration": false
}
```

#### 2. Indicadores OSINT
- **D**: Datos generales
- **R**: Registros oficiales
- **F**: Análisis forense
- **P**: Personas
- **A**: Análisis avanzado

### API Endpoints

#### Herramientas
```
GET    /api/tools              # Listar herramientas
GET    /api/tools/:id          # Obtener herramienta
GET    /api/tools/search       # Buscar herramientas
GET    /api/tools/popular      # Herramientas populares
POST   /api/tools/:id/use      # Registrar uso
```

#### Autenticación
```
POST   /api/auth/register      # Registro
POST   /api/auth/login         # Login
GET    /api/auth/me            # Perfil actual
PUT    /api/auth/profile       # Actualizar perfil
```

#### Usuarios
```
GET    /api/users/favorites    # Favoritos
POST   /api/users/favorites/:toolId  # Agregar favorito
DELETE /api/users/favorites/:toolId  # Remover favorito
GET    /api/users/history      # Historial
POST   /api/users/notes        # Crear nota
```

## 🎨 Personalización

### Temas y Colores
Los colores se definen en `frontend/src/styles/variables.css`:

```css
:root {
  --primary-blue: #1976D2;
  --accent-orange: #FF9800;
  --cat-argentina: #FF9800;
  /* ... más variables */
}
```

### Agregar Categorías
1. Actualizar `frontend/src/data/categories.json`
2. Agregar color en variables CSS
3. Ejecutar seed para actualizar BD

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy a Vercel
```

### Backend (Railway/Heroku)
```bash
cd backend
# Configurar variables de entorno
# Deploy según plataforma
```

### Docker
```bash
docker-compose up -d
```

## 🧪 Testing

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test

# E2E (futuro)
npm run test:e2e
```

## 📊 Estado del Proyecto

### ✅ Fase 1: Fundación (Completada)
- Configuración del entorno
- Setup de repositorio
- Docker y CI/CD
- Autenticación básica

### ✅ Fase 2: Core Features (Completada)
- Vista árbol D3.js interactiva
- Vista cards responsive
- API REST completa
- Sistema de navegación
- Base de datos con herramientas

### 🔄 Fase 3: Funcionalidades Avanzadas (En progreso)
- Sistema de ratings y comentarios
- Búsqueda avanzada con filtros
- Recomendaciones personalizadas
- Notificaciones

### 📋 Fase 4: Contenido y Localización (Pendiente)
- Expansión a +500 herramientas
- Herramientas específicas Argentina/LATAM
- Traducciones y localización
- Contenido educativo

### 🚀 Fase 5: Deploy y Optimización (Pendiente)
- Optimización de performance
- SEO y accesibilidad
- Monitoreo y analytics
- Deploy a producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución
- Seguir convenciones de código existentes
- Agregar tests para nuevas funcionalidades
- Actualizar documentación
- Usar commits descriptivos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autor

**Ivan Agustin Zarate** - Desarrollo principal y mantenimiento

- 📧 Email: [osintargy@gmail.com](mailto:osintargy@gmail.com)
- 💼 LinkedIn: [ivan-agustin-zarate](https://www.linkedin.com/in/ivan-agustin-zarate/)
- 🐙 GitHub: [IAZARA](https://github.com/IAZARA)

## 📞 Soporte y Colaboración

- **Issues**: [GitHub Issues](https://github.com/IAZARA/OSINTArgy/issues)
- **Email**: [osintargy@gmail.com](mailto:osintargy@gmail.com)
- **Contribuciones**: ¡Los comentarios o sugerencias de nuevas herramientas son extremadamente bienvenidos!

### Transparencia del Proyecto

Este es un proyecto personal de código abierto creado para la comunidad OSINT de Argentina y Latinoamérica. Todo el código fuente está disponible para:
- **Auditoría de seguridad**: Verificar que no hay código malicioso
- **Mejoras comunitarias**: Contribuir con nuevas funcionalidades
- **Aprendizaje**: Estudiar implementaciones de herramientas OSINT
- **Transparencia**: Entender exactamente cómo funcionan las herramientas

## 🙏 Agradecimientos

- Inspirado en [osintframework.com](https://osintframework.com)

---

**OSINTArgy** - Democratizando el OSINT en español 🇦🇷