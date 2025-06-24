// Script de prueba para verificar la carga de herramientas
import fs from 'fs';
import path from 'path';

const toolsPath = '/Users/macbook/Documents/OSINTArgy/frontend/src/data/tools';

// Función para leer archivos JSON
function readToolsFile(filename) {
  try {
    const fullPath = path.join(toolsPath, filename);
    const content = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(content);
    return data.tools || [];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return [];
  }
}

// Lista de archivos que se están importando en useTools.js
const importedFiles = [
  'buscadores-generales.json',
  'redes-sociales.json',
  'email.json',
  'dominios-ips.json',
  'geolocalizacion.json',
  'imagenes-videos.json',
  'documentos-metadatos.json', // Este DEBE estar importado pero no está
  'darkweb-amenazas.json',
  'argentina-latam.json',
  'telefonos.json',
  'archivos.json',
  'criptomonedas.json',
  'utilidades-varios.json',
  'analisis-visualizacion.json',
  'nuevas-herramientas.json',
  'sistema-infraestructura.json'
];

// Lista de archivos que REALMENTE se están importando en useTools.js (líneas 9-24)
const actuallyImportedFiles = [
  'buscadores-generales.json',
  'redes-sociales.json',
  'email.json',
  'dominios-ips.json',
  'geolocalizacion.json',
  'imagenes-videos.json',
  // 'documentos-metadatos.json', // FALTA ESTA LÍNEA EN useTools.js
  'darkweb-amenazas.json',
  'argentina-latam.json',
  'telefonos.json',
  'archivos.json',
  'criptomonedas.json',
  'utilidades-varios.json',
  'analisis-visualizacion.json',
  'nuevas-herramientas.json',
  'sistema-infraestructura.json'
];

console.log('=== ANÁLISIS DE CARGA DE HERRAMIENTAS ===\n');

let totalTools = 0;
let totalActuallyLoaded = 0;

// Analizar todos los archivos
console.log('📂 ARCHIVOS DISPONIBLES:');
importedFiles.forEach(filename => {
  const tools = readToolsFile(filename);
  const isActuallyImported = actuallyImportedFiles.includes(filename);
  totalTools += tools.length;
  
  if (isActuallyImported) {
    totalActuallyLoaded += tools.length;
  }
  
  console.log(`${isActuallyImported ? '✅' : '❌'} ${filename}: ${tools.length} herramientas`);
  
  // Buscar específicamente GeoSpy.AI
  if (filename === 'geolocalizacion.json') {
    const geospy = tools.find(tool => tool.id === 'geospy-ai');
    if (geospy) {
      console.log(`   🎯 GeoSpy.AI encontrado: ${geospy.name} - ${geospy.category}`);
    } else {
      console.log('   ❌ GeoSpy.AI NO encontrado en geolocalizacion.json');
    }
  }
});

console.log('\n=== RESUMEN ===');
console.log(`📊 Total de herramientas disponibles: ${totalTools}`);
console.log(`📦 Total de herramientas cargadas en frontend: ${totalActuallyLoaded}`);
console.log(`⚠️  Herramientas perdidas: ${totalTools - totalActuallyLoaded}`);

console.log('\n=== ARCHIVOS NO IMPORTADOS ===');
importedFiles.forEach(filename => {
  if (!actuallyImportedFiles.includes(filename)) {
    const tools = readToolsFile(filename);
    console.log(`❌ ${filename}: ${tools.length} herramientas NO CARGADAS`);
  }
});

// Verificar específicamente la categoría de geolocalización
console.log('\n=== ANÁLISIS DE GEOLOCALIZACION ===');
const geoTools = readToolsFile('geolocalizacion.json');
console.log(`📍 Total de herramientas de geolocalización: ${geoTools.length}`);

const geospy = geoTools.find(tool => tool.id === 'geospy-ai');
if (geospy) {
  console.log('✅ GeoSpy.AI ENCONTRADO:');
  console.log(`   - ID: ${geospy.id}`);
  console.log(`   - Nombre: ${geospy.name}`);
  console.log(`   - Categoría: ${geospy.category}`);
  console.log(`   - Subcategoría: ${geospy.subcategory}`);
  console.log(`   - URL: ${geospy.url}`);
} else {
  console.log('❌ GeoSpy.AI NO ENCONTRADO en geolocalizacion.json');
}