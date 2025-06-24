import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Tool from '../src/models/Tool.js'
import Category from '../src/models/Category.js'

// Cargar variables de entorno
dotenv.config()

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Rutas a los archivos JSON del frontend
const frontendToolsPath = path.join(__dirname, '../../frontend/src/data/tools')
const frontendCategoriesPath = path.join(__dirname, '../../frontend/src/data/categories.json')

// Función para leer archivos JSON
const readJSONFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error leyendo archivo ${filePath}:`, error.message)
    return null
  }
}

// Función para obtener todas las herramientas desde los archivos del frontend
const getAllToolsFromFrontend = () => {
  const toolFiles = [
    'buscadores-generales.json',
    'redes-sociales.json',
    'email.json',
    'dominios-ips.json',
    'geolocalizacion.json',
    'imagenes-videos.json',
    'documentos-metadatos.json',
    'darkweb-amenazas.json',
    'argentina-latam.json',
    'telefonos.json',
    'archivos.json',
    'criptomonedas.json',
    'utilidades-varios.json',
    'analisis-visualizacion.json',
    'nuevas-herramientas.json',
    'sistema-infraestructura.json'
  ]

  const allTools = []
  
  for (const fileName of toolFiles) {
    const filePath = path.join(frontendToolsPath, fileName)
    
    if (fs.existsSync(filePath)) {
      console.log(`📖 Leyendo: ${fileName}`)
      const data = readJSONFile(filePath)
      
      if (data && data.tools && Array.isArray(data.tools)) {
        console.log(`  ✅ ${data.tools.length} herramientas encontradas`)
        allTools.push(...data.tools)
      } else {
        console.log(`  ⚠️  Formato inválido o sin herramientas`)
      }
    } else {
      console.log(`  ❌ Archivo no encontrado: ${fileName}`)
    }
  }

  return allTools
}

// Función para obtener categorías desde el frontend
const getCategoriesFromFrontend = () => {
  console.log('📖 Leyendo categorías desde frontend...')
  const data = readJSONFile(frontendCategoriesPath)
  
  if (data && data.categories && Array.isArray(data.categories)) {
    console.log(`  ✅ ${data.categories.length} categorías encontradas`)
    return data.categories
  } else {
    console.log(`  ⚠️  Formato inválido o sin categorías`)
    return []
  }
}

// Función para convertir fecha string a Date object
const parseDate = (dateString) => {
  if (!dateString) return new Date()
  
  // Si ya es un Date object, devolverlo
  if (dateString instanceof Date) return dateString
  
  // Si es un string, intentar parsearlo
  if (typeof dateString === 'string') {
    const parsed = new Date(dateString)
    return isNaN(parsed.getTime()) ? new Date() : parsed
  }
  
  return new Date()
}

// Función para limpiar y validar datos de herramienta
const cleanToolData = (tool) => {
  return {
    ...tool,
    last_updated: parseDate(tool.last_updated),
    created_at: new Date(),
    rating: tool.rating || 0,
    usage_count: tool.usage_count || 0,
    view_count: tool.view_count || 0,
    status: tool.status || 'active',
    requires_registration: tool.requires_registration || false,
    is_free: tool.is_free !== false, // Default a true si no se especifica
    tags: Array.isArray(tool.tags) ? tool.tags : [],
    indicators: Array.isArray(tool.indicators) ? tool.indicators : []
  }
}

// Función principal de importación
const importTools = async () => {
  try {
    console.log('🚀 Iniciando importación de herramientas desde frontend...')
    console.log('='.repeat(50))

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/osintargy')
    console.log('✅ Conectado a MongoDB')

    // Obtener datos del frontend
    const frontendCategories = getCategoriesFromFrontend()
    const frontendTools = getAllToolsFromFrontend()

    console.log('\n📊 Resumen de datos del frontend:')
    console.log(`  - Categorías: ${frontendCategories.length}`)
    console.log(`  - Herramientas: ${frontendTools.length}`)

    // Importar categorías
    console.log('\n📂 Sincronizando categorías...')
    for (const categoryData of frontendCategories) {
      try {
        await Category.findOneAndUpdate(
          { id: categoryData.id },
          {
            ...categoryData,
            updated_at: new Date()
          },
          { 
            upsert: true, 
            new: true,
            runValidators: true
          }
        )
        console.log(`  ✅ Categoría sincronizada: ${categoryData.name}`)
      } catch (error) {
        console.log(`  ❌ Error con categoría ${categoryData.name}:`, error.message)
      }
    }

    // Importar herramientas
    console.log('\n🔧 Sincronizando herramientas...')
    let importedCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (const toolData of frontendTools) {
      try {
        const cleanTool = cleanToolData(toolData)
        
        const existingTool = await Tool.findOne({ id: toolData.id })
        
        if (existingTool) {
          // Actualizar herramienta existente
          await Tool.findOneAndUpdate(
            { id: toolData.id },
            {
              ...cleanTool,
              updated_at: new Date()
            },
            { 
              new: true,
              runValidators: true
            }
          )
          console.log(`  🔄 Herramienta actualizada: ${toolData.name}`)
          updatedCount++
        } else {
          // Crear nueva herramienta
          const tool = new Tool(cleanTool)
          await tool.save()
          console.log(`  ✅ Herramienta importada: ${toolData.name}`)
          importedCount++
        }
      } catch (error) {
        console.log(`  ❌ Error con herramienta ${toolData.name}:`, error.message)
        errorCount++
      }
    }

    // Actualizar contadores de herramientas en categorías
    console.log('\n📊 Actualizando estadísticas de categorías...')
    const categoriesFromDB = await Category.find()
    for (const category of categoriesFromDB) {
      await category.updateToolsCount()
      console.log(`  ✅ Estadísticas actualizadas para: ${category.name}`)
    }

    console.log('\n🎉 Importación completada!')
    console.log('='.repeat(50))
    console.log('📊 Resumen final:')
    console.log(`  - Categorías en BD: ${await Category.countDocuments()}`)
    console.log(`  - Herramientas en BD: ${await Tool.countDocuments()}`)
    console.log(`  - Herramientas importadas: ${importedCount}`)
    console.log(`  - Herramientas actualizadas: ${updatedCount}`)
    console.log(`  - Errores: ${errorCount}`)

    // Verificar que GeoSpy.AI se importó
    const geospyTool = await Tool.findOne({ id: 'geospy-ai' })
    if (geospyTool) {
      console.log('\n🎯 ¡GeoSpy.AI se importó correctamente!')
      console.log(`   - Nombre: ${geospyTool.name}`)
      console.log(`   - Categoría: ${geospyTool.category}`)
      console.log(`   - URL: ${geospyTool.url}`)
    } else {
      console.log('\n⚠️  GeoSpy.AI no se encontró en la base de datos')
    }

  } catch (error) {
    console.error('❌ Error durante la importación:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Desconectado de MongoDB')
    process.exit(0)
  }
}

// Ejecutar importación si el script se ejecuta directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  importTools()
}

export default importTools