// Constantes de la aplicación OSINTArgy

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'OSINTArgy'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

// Vistas disponibles
export const VIEWS = {
  TREE: 'tree',
  CARDS: 'cards'
}

// Tipos de herramientas
export const TOOL_TYPES = {
  WEB: 'web',
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  API: 'api',
  BROWSER_EXTENSION: 'browser_extension',
  EXTENSION: 'extension',
  TOOL: 'tool',
  DATASET: 'dataset'
}

// Indicadores de herramientas (basado en OSINT Framework original)
export const TOOL_INDICATORS = {
  T: {
    label: 'Tool',
    description: 'Herramienta que debe instalarse y ejecutarse localmente',
    color: 'var(--accent-purple)'
  },
  D: {
    label: 'Dork',
    description: 'Google Dork u operador de búsqueda avanzada',
    color: 'var(--accent-green)'
  },
  R: {
    label: 'Registration',
    description: 'Requiere registro para acceder',
    color: 'var(--accent-orange)'
  },
  M: {
    label: 'Manual',
    description: 'URL que debe editarse manualmente con términos de búsqueda',
    color: 'var(--accent-red)'
  },
  P: {
    label: 'Paid',
    description: 'Servicio de pago o con funciones premium',
    color: 'var(--primary-blue)'
  },
  A: {
    label: 'Archive',
    description: 'Archivo o base de datos histórica',
    color: 'var(--accent-cyan)'
  },
  S: {
    label: 'Security',
    description: 'Herramienta de seguridad o análisis de amenazas',
    color: 'var(--accent-red)'
  },
  G: {
    label: 'Geolocation',
    description: 'Herramienta de geolocalización o mapas',
    color: 'var(--accent-green)'
  }
}

// Regiones
export const REGIONS = {
  INTERNACIONAL: 'internacional',
  ARGENTINA: 'argentina',
  LATAM: 'latam',
  EUROPA: 'europa',
  NORTEAMERICA: 'norteamerica',
  ASIA: 'asia'
}

// Niveles de dificultad
export const DIFFICULTY_LEVELS = {
  BEGINNER: {
    value: 'beginner',
    label: 'Principiante',
    color: 'var(--accent-green)'
  },
  INTERMEDIATE: {
    value: 'intermediate',
    label: 'Intermedio',
    color: 'var(--accent-orange)'
  },
  ADVANCED: {
    value: 'advanced',
    label: 'Avanzado',
    color: 'var(--accent-red)'
  },
  EXPERT: {
    value: 'expert',
    label: 'Experto',
    color: 'var(--accent-purple)'
  }
}

// Categorías principales con colores
export const CATEGORIES = {
  BUSCADORES_GENERALES: {
    id: 'buscadores-generales',
    name: 'Buscadores Generales y Avanzados',
    icon: 'Search',
    color: 'var(--cat-buscadores)'
  },
  REDES_SOCIALES: {
    id: 'redes-sociales',
    name: 'Redes Sociales y Perfiles',
    icon: 'Users',
    color: 'var(--cat-redes-sociales)'
  },
  EMAIL: {
    id: 'email',
    name: 'Correo Electrónico',
    icon: 'Mail',
    color: 'var(--cat-email)'
  },
  DOMINIOS_IPS: {
    id: 'dominios-ips',
    name: 'Dominios e IPs',
    icon: 'Globe',
    color: 'var(--cat-dominios)'
  },
  GEOLOCALIZACION: {
    id: 'geolocalizacion',
    name: 'Geolocalización y Mapas',
    icon: 'MapPin',
    color: 'var(--cat-geolocalizacion)'
  },
  IMAGENES_VIDEOS: {
    id: 'imagenes-videos',
    name: 'Imágenes y Videos',
    icon: 'Image',
    color: 'var(--cat-imagenes)'
  },
  DOCUMENTOS: {
    id: 'documentos',
    name: 'Documentos y Metadatos',
    icon: 'FileText',
    color: 'var(--cat-documentos)'
  },
  REGISTROS_PUBLICOS: {
    id: 'registros-publicos',
    name: 'Registros Públicos y Financieros',
    icon: 'Building',
    color: 'var(--cat-registros)'
  },
  DARK_WEB: {
    id: 'dark-web',
    name: 'Dark Web y Amenazas',
    icon: 'Shield',
    color: 'var(--cat-darkweb)'
  },
  ANALISIS: {
    id: 'analisis',
    name: 'Herramientas de Análisis y Visualización',
    icon: 'BarChart3',
    color: 'var(--cat-analisis)'
  },
  UTILIDADES: {
    id: 'utilidades',
    name: 'Utilidades y Varios',
    icon: 'Wrench',
    color: 'var(--cat-utilidades)'
  },
  ARGENTINA_LATAM: {
    id: 'argentina-latam',
    name: '🇦🇷 Argentina / LATAM',
    icon: 'Flag',
    color: 'var(--cat-argentina)'
  },
  TELEFONOS: {
    id: 'telefonos',
    name: 'Teléfonos y Comunicaciones',
    icon: 'Phone',
    color: 'var(--cat-telefonos)'
  },
  ARCHIVOS: {
    id: 'archivos',
    name: 'Archivos y Documentos',
    icon: 'Folder',
    color: 'var(--cat-archivos)'
  },
  CRIPTOMONEDAS: {
    id: 'criptomonedas',
    name: 'Criptomonedas y Blockchain',
    icon: 'Bitcoin',
    color: 'var(--cat-criptomonedas)'
  }
}

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
}

// Configuración de búsqueda
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 100
}

// Configuración de localStorage
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'osintargy_user_preferences',
  FAVORITES: 'osintargy_favorites',
  SEARCH_HISTORY: 'osintargy_search_history',
  NOTES: 'osintargy_notes',
  LAST_VIEW: 'osintargy_last_view',
  THEME: 'osintargy_theme'
}

// Configuración de tema
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

// Configuración de notificaciones
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000
}

// URLs útiles
export const URLS = {
  GITHUB: 'https://github.com/osintargy/osintargy',
  TWITTER: 'https://twitter.com/osintargy',
  DISCORD: 'https://discord.gg/osintargy',
  DOCUMENTATION: 'https://docs.osintargy.com',
  FEEDBACK: 'https://github.com/osintargy/osintargy/issues'
}

// Configuración de D3.js para vista árbol
export const D3_CONFIG = {
  TREE: {
    WIDTH: 1280,
    HEIGHT: 800,
    MARGIN: { top: 20, right: 140, bottom: 20, left: 140 },
    NODE_RADIUS: 6,
    LINK_DISTANCE: 180,
    ANIMATION_DURATION: 750
  },
  COLORS: {
    NODE_DEFAULT: 'var(--gray-400)',
    NODE_CATEGORY: 'var(--primary-blue)',
    NODE_TOOL: 'var(--accent-green)',
    NODE_SELECTED: 'var(--accent-orange)',
    LINK_DEFAULT: 'var(--gray-300)',
    LINK_ACTIVE: 'var(--primary-blue)'
  }
}

// Configuración de validación
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL_REGEX: /^https?:\/\/.+/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_NOTE_LENGTH: 1000,
  MAX_SEARCH_HISTORY: 50
}

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente más tarde.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado.'
}

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  TOOL_FAVORITED: 'Herramienta agregada a favoritos',
  TOOL_UNFAVORITED: 'Herramienta removida de favoritos',
  NOTE_SAVED: 'Nota guardada correctamente',
  NOTE_DELETED: 'Nota eliminada correctamente',
  PROFILE_UPDATED: 'Perfil actualizado correctamente',
  LOGIN_SUCCESS: 'Sesión iniciada correctamente',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  REGISTER_SUCCESS: 'Cuenta creada correctamente'
}

// Configuración de analytics (si se implementa)
export const ANALYTICS = {
  EVENTS: {
    TOOL_CLICK: 'tool_click',
    CATEGORY_SELECT: 'category_select',
    SEARCH_PERFORM: 'search_perform',
    VIEW_CHANGE: 'view_change',
    TOOL_FAVORITE: 'tool_favorite',
    NOTE_CREATE: 'note_create'
  }
}

export default {
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  VIEWS,
  TOOL_TYPES,
  TOOL_INDICATORS,
  REGIONS,
  DIFFICULTY_LEVELS,
  CATEGORIES,
  PAGINATION,
  SEARCH,
  STORAGE_KEYS,
  THEMES,
  TOAST_DURATION,
  URLS,
  D3_CONFIG,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ANALYTICS
}