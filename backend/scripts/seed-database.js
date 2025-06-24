import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Tool from '../src/models/Tool.js'
import Category from '../src/models/Category.js'
import User from '../src/models/User.js'

// Cargar variables de entorno
dotenv.config()

// Datos de categorías
const categories = [
  {
    id: "buscadores-generales",
    name: "Buscadores Generales y Avanzados",
    description: "Motores de búsqueda especializados y técnicas avanzadas de búsqueda",
    icon: "🔍",
    color: "#4CAF50",
    order: 1,
    subcategories: [
      {
        id: "motores-busqueda",
        name: "Motores de Búsqueda",
        description: "Buscadores tradicionales con operadores avanzados",
        order: 1
      },
      {
        id: "metabuscadores",
        name: "Metabuscadores",
        description: "Buscadores que consultan múltiples fuentes",
        order: 2
      },
      {
        id: "busquedas-especializadas",
        name: "Búsquedas Especializadas",
        description: "Motores para contenido específico",
        order: 3
      }
    ]
  },
  {
    id: "redes-sociales",
    name: "Redes Sociales y Perfiles",
    description: "Herramientas para investigar perfiles y actividad en redes sociales",
    icon: "👥",
    color: "#2196F3",
    order: 2,
    subcategories: [
      {
        id: "plataformas-principales",
        name: "Plataformas Principales",
        description: "Facebook, Twitter, Instagram, LinkedIn",
        order: 1
      }
    ]
  },
  {
    id: "argentina-latam",
    name: "🇦🇷 Argentina / LATAM",
    description: "Herramientas específicas para Argentina y Latinoamérica",
    icon: "🇦🇷",
    color: "#FF9800",
    order: 12,
    subcategories: [
      {
        id: "registros-publicos-ar",
        name: "Registros Públicos Argentina",
        description: "AFIP, ANSES, Registro de Personas",
        order: 1
      }
    ]
  }
]

// Datos de herramientas
const tools = [
  {
    id: "google-advanced",
    name: "Google Búsqueda Avanzada",
    description: "Motor de búsqueda más utilizado del mundo con operadores avanzados.",
    utility: "Permite búsquedas precisas usando operadores como site:, filetype:, intitle:, etc.",
    url: "https://www.google.com/advanced_search",
    category: "buscadores-generales",
    subcategory: "motores-busqueda",
    tags: ["búsqueda", "google", "operadores"],
    type: "web",
    indicators: ["D"],
    region: "internacional",
    language: "es",
    rating: 4.8,
    usage_count: 15420,
    last_updated: new Date("2025-06-19"),
    status: "active",
    requires_registration: false,
    is_free: true,
    difficulty_level: "beginner"
  },
  {
    id: "afip-cuit",
    name: "AFIP - Consulta CUIT",
    description: "Consulta oficial de CUIT/CUIL en la base de datos de AFIP.",
    utility: "Verifica la validez y obtiene datos básicos de contribuyentes argentinos.",
    url: "https://www.afip.gob.ar/sitio/externos/default.asp",
    category: "argentina-latam",
    subcategory: "registros-publicos-ar",
    tags: ["cuit", "afip", "argentina", "contribuyentes"],
    type: "web",
    indicators: ["R"],
    region: "argentina",
    language: "es",
    rating: 4.5,
    usage_count: 8920,
    last_updated: new Date("2025-06-19"),
    status: "active",
    requires_registration: true,
    is_free: true,
    difficulty_level: "beginner"
  },
  {
    id: "shodan",
    name: "Shodan",
    description: "Motor de búsqueda para dispositivos conectados a Internet.",
    utility: "Encuentra cámaras, servidores, routers y otros dispositivos IoT expuestos.",
    url: "https://www.shodan.io",
    category: "buscadores-generales",
    subcategory: "busquedas-especializadas",
    tags: ["iot", "dispositivos", "vulnerabilidades", "ciberseguridad"],
    type: "web",
    indicators: ["D", "A"],
    region: "internacional",
    language: "en",
    rating: 4.6,
    usage_count: 12350,
    last_updated: new Date("2025-06-18"),
    status: "active",
    requires_registration: true,
    is_free: false,
    difficulty_level: "intermediate"
  },
  {
    id: "facebook-search",
    name: "Facebook Graph Search",
    description: "Herramienta de búsqueda avanzada dentro de Facebook.",
    utility: "Busca personas, publicaciones, fotos y conexiones en Facebook.",
    url: "https://www.facebook.com/search",
    category: "redes-sociales",
    subcategory: "plataformas-principales",
    tags: ["facebook", "redes sociales", "personas", "publicaciones"],
    type: "web",
    indicators: ["P"],
    region: "internacional",
    language: "es",
    rating: 4.2,
    usage_count: 9870,
    last_updated: new Date("2025-06-17"),
    status: "active",
    requires_registration: true,
    is_free: true,
    difficulty_level: "beginner"
  }
]

// Usuario administrador de ejemplo
const adminUser = {
  username: "admin",
  email: "admin@osintargy.online",
  password: "admin123",
  profile: {
    firstName: "Administrador",
    lastName: "OSINTArgy"
  },
  role: "admin",
  isActive: true,
  isVerified: true
}

// Función principal de seeding
const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seeding de la base de datos...')

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/osintargy')
    console.log('✅ Conectado a MongoDB')

    // Limpiar colecciones existentes
    console.log('🧹 Limpiando colecciones existentes...')
    await Tool.deleteMany({})
    await Category.deleteMany({})
    await User.deleteMany({})

    // Insertar categorías
    console.log('📂 Insertando categorías...')
    for (const categoryData of categories) {
      const category = new Category(categoryData)
      await category.save()
      console.log(`  ✅ Categoría creada: ${category.name}`)
    }

    // Insertar herramientas
    console.log('🔧 Insertando herramientas...')
    for (const toolData of tools) {
      const tool = new Tool(toolData)
      await tool.save()
      console.log(`  ✅ Herramienta creada: ${tool.name}`)
    }

    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...')
    const admin = new User(adminUser)
    await admin.save()
    console.log(`  ✅ Usuario admin creado: ${admin.email}`)

    // Actualizar contadores de herramientas en categorías
    console.log('📊 Actualizando estadísticas de categorías...')
    const categoriesFromDB = await Category.find()
    for (const category of categoriesFromDB) {
      await category.updateToolsCount()
      console.log(`  ✅ Estadísticas actualizadas para: ${category.name}`)
    }

    console.log('🎉 Seeding completado exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`  - Categorías: ${await Category.countDocuments()}`)
    console.log(`  - Herramientas: ${await Tool.countDocuments()}`)
    console.log(`  - Usuarios: ${await User.countDocuments()}`)
    console.log('\n🔐 Credenciales de administrador:')
    console.log(`  Email: ${adminUser.email}`)
    console.log(`  Password: ${adminUser.password}`)

  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de MongoDB')
    process.exit(0)
  }
}

// Ejecutar seeding si el script se ejecuta directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase()
}

export default seedDatabase