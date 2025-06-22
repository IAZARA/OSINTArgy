# OSINTArgy - Framework OSINT en Español Argentino

## 📋 Descripción

OSINTArgy es una versión mejorada y localizada de osintframework.com, diseñada específicamente para la comunidad de habla hispana, con énfasis en Argentina y Latinoamérica. Ofrece una interfaz dual innovadora (vista árbol D3.js + vista cards), contenido 100% en español argentino, y herramientas especializadas para la región.

## ✨ Características Principales

- **🌳 Vista Árbol Interactiva**: Navegación visual con D3.js
- **🃏 Vista Cards Moderna**: Interfaz de tarjetas responsive
- **🇦🇷 Localización Completa**: 100% en español argentino
- **🛠️ +500 Herramientas**: Más herramientas que el framework original
- **🌎 Herramientas Locales**: Sección específica Argentina/LATAM
- **👤 Sistema de Usuario**: Favoritos, historial, notas y ratings
- **🔧 Backend Completo**: API REST con autenticación y base de datos

## 🏗️ Arquitectura

### Frontend
- **React 18** con Hooks y Context API
- **D3.js v7** para visualización de árbol interactivo
- **CSS Variables** para theming consistente
- **React Router v6** para navegación
- **Axios** para comunicación con API
- **Lucide React** para iconografía

### Backend
- **Node.js 18+** con Express.js
- **MongoDB** con Mongoose ODM
- **JWT** para autenticación
- **Joi** para validación de datos
- **Winston** para logging
- **Rate Limiting** para seguridad

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
- **Email**: admin@osintargy.com
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

## 👥 Equipo

- **Kilo Code** - Desarrollo principal
- **Comunidad OSINT Argentina** - Feedback y testing

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/OSINTArgy/issues)
- **Email**: soporte@osintargy.com
- **Telegram**: @OSINTArgy

## 🙏 Agradecimientos

- Inspirado en [osintframework.com](https://osintframework.com)
- Comunidad OSINT internacional
- Desarrolladores de herramientas OSINT
- Beta testers y colaboradores

---

**OSINTArgy** - Democratizando el OSINT en español 🇦🇷