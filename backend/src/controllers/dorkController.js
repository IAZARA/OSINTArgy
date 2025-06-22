import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Controlador para la generación de dorks
 */
class DorkController {
  
  /**
   * Lee las plantillas de dorks desde un archivo
   * @param {string} filePath - Ruta del archivo de plantillas
   * @returns {Array} Array de plantillas de dorks
   */
  static readDorkTemplates(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', filePath)
      if (!fs.existsSync(fullPath)) {
        console.warn(`Archivo de plantillas no encontrado: ${fullPath}`)
        return []
      }
      
      const content = fs.readFileSync(fullPath, 'utf-8')
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'))
    } catch (error) {
      console.error(`Error leyendo plantillas de ${filePath}:`, error)
      return []
    }
  }

  /**
   * Genera URLs de búsqueda basadas en las plantillas y parámetros
   * @param {string} searchEngine - Motor de búsqueda (google o yandex)
   * @param {string} targetType - Tipo de objetivo (usernames, emails, websites)
   * @param {string} query - Término de búsqueda principal
   * @param {Object} options - Opciones adicionales
   * @returns {Array} Array de URLs de búsqueda generadas
   */
  static generateDorkUrls(searchEngine, targetType, query, options = {}) {
    const templates = this.readDorkTemplates(`dorks/${searchEngine}/${targetType}.txt`)
    const urls = []
    
    // URLs base para los motores de búsqueda
    const baseUrls = {
      google: 'https://www.google.com/search?q=',
      yandex: 'https://yandex.com/search/?text='
    }
    
    const baseUrl = baseUrls[searchEngine]
    if (!baseUrl) {
      throw new Error(`Motor de búsqueda no soportado: ${searchEngine}`)
    }

    templates.forEach(template => {
      let dorkQuery = template.replace(/%QUERY%/g, query)
      
      // Aplicar filtros adicionales si existen
      if (options.includeTerms && options.includeTerms.length > 0) {
        const includeStr = options.includeTerms.map(term => `"${term}"`).join(' ')
        dorkQuery += ` ${includeStr}`
      }
      
      if (options.excludeTerms && options.excludeTerms.length > 0) {
        const excludeStr = options.excludeTerms.map(term => `-"${term}"`).join(' ')
        dorkQuery += ` ${excludeStr}`
      }
      
      if (options.dateAfter) {
        if (searchEngine === 'google') {
          dorkQuery += ` after:${options.dateAfter}`
        }
      }
      
      if (options.dateBefore) {
        if (searchEngine === 'google') {
          dorkQuery += ` before:${options.dateBefore}`
        }
      }
      
      // Codificar la consulta para URL
      const encodedQuery = encodeURIComponent(dorkQuery)
      urls.push({
        query: dorkQuery,
        url: baseUrl + encodedQuery,
        engine: searchEngine,
        template: template
      })
    })
    
    return urls
  }

  /**
   * Endpoint principal para generar dorks
   * POST /api/dorks/generate
   */
  static async generateDorks(req, res) {
    try {
      const {
        query,
        targetType = 'usernames',
        engines = ['google', 'yandex'],
        options = {}
      } = req.body

      // Validaciones
      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          error: 'El parámetro "query" es requerido y no puede estar vacío'
        })
      }

      const validTargetTypes = ['usernames', 'emails', 'websites']
      if (!validTargetTypes.includes(targetType)) {
        return res.status(400).json({
          error: `Tipo de objetivo no válido. Debe ser uno de: ${validTargetTypes.join(', ')}`
        })
      }

      const validEngines = ['google', 'yandex']
      const invalidEngines = engines.filter(engine => !validEngines.includes(engine))
      if (invalidEngines.length > 0) {
        return res.status(400).json({
          error: `Motores de búsqueda no válidos: ${invalidEngines.join(', ')}. Válidos: ${validEngines.join(', ')}`
        })
      }

      // Generar dorks para cada motor de búsqueda
      const results = {}
      let totalUrls = 0

      for (const engine of engines) {
        const urls = this.generateDorkUrls(engine, targetType, query.trim(), options)
        results[engine] = urls
        totalUrls += urls.length
      }

      // Respuesta exitosa
      res.json({
        success: true,
        query: query.trim(),
        targetType,
        engines,
        totalUrls,
        results,
        generatedAt: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error generando dorks:', error)
      res.status(500).json({
        error: 'Error interno del servidor al generar dorks',
        message: error.message
      })
    }
  }

  /**
   * Endpoint para obtener los tipos de objetivo disponibles
   * GET /api/dorks/target-types
   */
  static async getTargetTypes(req, res) {
    try {
      const targetTypes = [
        {
          id: 'usernames',
          name: 'Nombres de Usuario',
          description: 'Búsqueda de perfiles y cuentas de usuario en redes sociales'
        },
        {
          id: 'emails',
          name: 'Correos Electrónicos',
          description: 'Búsqueda de direcciones de correo electrónico en documentos y sitios web'
        },
        {
          id: 'websites',
          name: 'Sitios Web',
          description: 'Análisis de sitios web, dominios y archivos relacionados'
        }
      ]

      res.json({
        success: true,
        targetTypes
      })
    } catch (error) {
      console.error('Error obteniendo tipos de objetivo:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Endpoint para obtener los motores de búsqueda disponibles
   * GET /api/dorks/search-engines
   */
  static async getSearchEngines(req, res) {
    try {
      const searchEngines = [
        {
          id: 'google',
          name: 'Google',
          description: 'Motor de búsqueda de Google con operadores avanzados'
        },
        {
          id: 'yandex',
          name: 'Yandex',
          description: 'Motor de búsqueda ruso con operadores específicos'
        }
      ]

      res.json({
        success: true,
        searchEngines
      })
    } catch (error) {
      console.error('Error obteniendo motores de búsqueda:', error)
      res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}

export default DorkController