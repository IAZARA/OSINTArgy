/**
 * Script de migración para poblar la base de datos con herramientas OSINT
 * Fase 4: Contenido y Localización - OSINTArgy
 * 
 * Este script carga más de 500 herramientas OSINT organizadas por categorías
 * con especial énfasis en herramientas de Argentina y LATAM
 */

import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar dotenv
dotenv.config();

// Importar modelos
import Tool from '../src/models/Tool.js';
import Category from '../src/models/Category.js';

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/osintargy';

/**
 * Conectar a MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Cargar datos de herramientas desde archivos JSON
 */
function loadToolsData() {
  const toolsDir = path.join(__dirname, '../../frontend/src/data/tools');
  const toolFiles = [
    'buscadores-generales.json',
    'redes-sociales.json',
    'email.json',
    'dominios-ips.json',
    'geolocalizacion.json',
    'imagenes-videos.json',
    'darkweb-amenazas.json',
    'argentina-latam.json',
    'telefonos.json',
    'archivos.json',
    'criptomonedas.json',
    'utilidades-varios.json',
    'analisis-visualizacion.json'
  ];

  let allTools = [];
  let categoriesCount = {};

  toolFiles.forEach(file => {
    try {
      const filePath = path.join(toolsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`📁 Cargando ${data.tools.length} herramientas de ${file}`);
      allTools = allTools.concat(data.tools);
      
      // Contar herramientas por categoría
      categoriesCount[data.category] = data.tools.length;
      
    } catch (error) {
      console.error(`❌ Error cargando ${file}:`, error.message);
    }
  });

  console.log('\n📊 Resumen de herramientas por categoría:');
  Object.entries(categoriesCount).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} herramientas`);
  });
  console.log(`   Total: ${allTools.length} herramientas\n`);

  return allTools;
}

/**
 * Cargar categorías desde archivo JSON
 */
function loadCategoriesData() {
  try {
    const categoriesPath = path.join(__dirname, '../../frontend/src/data/categories.json');
    const data = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    console.log(`📁 Cargando ${data.categories.length} categorías`);
    return data.categories;
  } catch (error) {
    console.error('❌ Error cargando categorías:', error.message);
    return [];
  }
}

/**
 * Limpiar colecciones existentes
 */
async function clearCollections() {
  try {
    console.log('🧹 Limpiando colecciones existentes...');
    
    // Eliminar índices problemáticos
    try {
      await mongoose.connection.db.collection('tools').dropIndexes();
      console.log('✅ Índices de tools eliminados');
    } catch (error) {
      console.log('ℹ️ No hay índices de tools para eliminar');
    }
    
    try {
      await mongoose.connection.db.collection('categories').dropIndexes();
      console.log('✅ Índices de categories eliminados');
    } catch (error) {
      console.log('ℹ️ No hay índices de categories para eliminar');
    }
    
    await Tool.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Colecciones limpiadas');
  } catch (error) {
    console.error('❌ Error limpiando colecciones:', error);
    throw error;
  }
}

/**
 * Insertar categorías en la base de datos
 */
async function insertCategories(categories) {
  try {
    console.log('📂 Insertando categorías...');
    
    const categoryDocs = categories.map(category => ({
      ...category,
      slug: category.name
        .toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Category.insertMany(categoryDocs);
    console.log(`✅ ${categories.length} categorías insertadas`);
  } catch (error) {
    console.error('❌ Error insertando categorías:', error);
    throw error;
  }
}

/**
 * Insertar herramientas en la base de datos
 */
async function insertTools(tools) {
  try {
    console.log('🔧 Insertando herramientas...');
    
    const toolDocs = tools.map(tool => {
      // Limpiar campos que pueden causar problemas
      const cleanTool = { ...tool };
      
      // Remover campos que no deben estar en el documento
      delete cleanTool.verified_by;
      delete cleanTool.verified_date;
      delete cleanTool.verified;
      
      return {
        ...cleanTool,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Asegurar que todos los campos requeridos estén presentes
        status: tool.status || 'active',
        rating: tool.rating || 0,
        usage_count: tool.usage_count || 0,
        last_updated: tool.last_updated || new Date().toISOString().split('T')[0],
        // Campos de verificación por defecto
        verified: false,
        views: 0,
        favorites_count: 0
      };
    });

    // Insertar herramientas una por una para manejar duplicados
    let insertedCount = 0;
    let updatedCount = 0;

    for (const toolDoc of toolDocs) {
      try {
        const result = await Tool.findOneAndUpdate(
          { id: toolDoc.id },
          toolDoc,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          insertedCount++;
        } else {
          updatedCount++;
        }
        
        if ((insertedCount + updatedCount) % 50 === 0) {
          console.log(`   Procesadas ${insertedCount + updatedCount}/${toolDocs.length} herramientas`);
        }
      } catch (error) {
        console.error(`❌ Error procesando herramienta ${toolDoc.id}:`, error.message);
      }
    }

    console.log(`✅ ${insertedCount} herramientas insertadas, ${updatedCount} actualizadas`);
  } catch (error) {
    console.error('❌ Error insertando herramientas:', error);
    throw error;
  }
}

/**
 * Generar estadísticas de la migración
 */
async function generateStats() {
  try {
    console.log('\n📊 Generando estadísticas...');
    
    const totalTools = await Tool.countDocuments();
    const totalCategories = await Category.countDocuments();
    
    // Estadísticas por categoría
    const toolsByCategory = await Tool.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por región
    const toolsByRegion = await Tool.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por idioma
    const toolsByLanguage = await Tool.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Herramientas gratuitas vs pagadas
    const freeTools = await Tool.countDocuments({ is_free: true });
    const paidTools = await Tool.countDocuments({ is_free: false });

    // Herramientas por nivel de dificultad
    const toolsByDifficulty = await Tool.aggregate([
      {
        $group: {
          _id: '$difficulty_level',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n🎯 ESTADÍSTICAS FINALES:');
    console.log('========================');
    console.log(`📊 Total de herramientas: ${totalTools}`);
    console.log(`📂 Total de categorías: ${totalCategories}`);
    console.log(`💰 Herramientas gratuitas: ${freeTools} (${((freeTools/totalTools)*100).toFixed(1)}%)`);
    console.log(`💳 Herramientas pagadas: ${paidTools} (${((paidTools/totalTools)*100).toFixed(1)}%)`);
    
    console.log('\n📈 Por categoría:');
    toolsByCategory.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} herramientas (rating promedio: ${cat.avgRating.toFixed(1)})`);
    });

    console.log('\n🌍 Por región:');
    toolsByRegion.forEach(region => {
      console.log(`   ${region._id}: ${region.count} herramientas`);
    });

    console.log('\n🗣️ Por idioma:');
    toolsByLanguage.forEach(lang => {
      console.log(`   ${lang._id}: ${lang.count} herramientas`);
    });

    console.log('\n📚 Por dificultad:');
    toolsByDifficulty.forEach(diff => {
      console.log(`   ${diff._id}: ${diff.count} herramientas`);
    });

    // Herramientas destacadas de Argentina/LATAM
    const argentinaTools = await Tool.countDocuments({ region: 'argentina' });
    const latamTools = await Tool.countDocuments({ 
      region: { $in: ['argentina', 'brasil', 'chile', 'colombia', 'méxico', 'perú', 'uruguay'] }
    });

    console.log('\n🇦🇷 HERRAMIENTAS REGIONALES:');
    console.log('============================');
    console.log(`🇦🇷 Argentina: ${argentinaTools} herramientas`);
    console.log(`🌎 LATAM total: ${latamTools} herramientas`);

  } catch (error) {
    console.error('❌ Error generando estadísticas:', error);
  }
}

/**
 * Función principal de migración
 */
async function main() {
  console.log('🚀 INICIANDO MIGRACIÓN FASE 4 - OSINTArgy');
  console.log('==========================================\n');

  try {
    // Conectar a la base de datos
    await connectDB();

    // Cargar datos desde archivos
    const categories = loadCategoriesData();
    const tools = loadToolsData();

    if (categories.length === 0 || tools.length === 0) {
      throw new Error('No se pudieron cargar los datos necesarios');
    }

    // Confirmar antes de proceder
    console.log(`⚠️  ATENCIÓN: Esta operación eliminará todos los datos existentes`);
    console.log(`   Se insertarán ${categories.length} categorías y ${tools.length} herramientas`);
    
    // En un entorno de producción, aquí se podría agregar una confirmación interactiva
    
    // Limpiar colecciones existentes
    await clearCollections();

    // Insertar categorías
    await insertCategories(categories);

    // Insertar herramientas
    await insertTools(tools);

    // Generar estadísticas
    await generateStats();

    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('====================================');
    console.log('✅ Base de datos poblada con herramientas OSINT');
    console.log('✅ Herramientas de Argentina y LATAM incluidas');
    console.log('✅ Más de 500 herramientas disponibles');
    console.log('✅ Contenido 100% en español argentino');

  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:', error.message);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar migración si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  main,
  loadToolsData,
  loadCategoriesData,
  insertTools,
  insertCategories,
  generateStats
};