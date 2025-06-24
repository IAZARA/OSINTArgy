import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Controlador para búsqueda de nombres de usuario
 */
export class UsernameOsintController {
  
  /**
   * Carga la configuración de sitios desde el archivo JSON
   */
  static async loadUsernameConfig() {
    try {
      const configPath = path.join(__dirname, '../data/username_sites.json')
      const configData = await fs.readFile(configPath, 'utf8')
      return JSON.parse(configData)
    } catch (error) {
      console.error('Error cargando configuración de sitios de username:', error)
      throw new Error('No se pudo cargar la configuración de sitios')
    }
  }

  /**
   * Valida el formato del nombre de usuario
   */
  static validateUsername(username) {
    // Validaciones básicas para nombres de usuario
    if (!username || typeof username !== 'string') return false
    if (username.length < 1 || username.length > 50) return false
    if (username.includes(' ')) return false // La mayoría de sitios no permiten espacios
    
    // Caracteres básicos permitidos (letras, números, guiones, puntos)
    const usernameRegex = /^[a-zA-Z0-9._-]+$/
    return usernameRegex.test(username)
  }

  /**
   * Realiza una búsqueda en un sitio específico usando diferentes métodos de detección
   */
  static async checkSiteForUsername(site, username) {
    try {
      const url = site.check_url.replace('{}', username)
      
      // Configurar opciones de la petición
      const requestOptions = {
        method: 'GET',
        headers: site.headers || {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000, // 10 segundos de timeout
        redirect: 'follow'
      }

      const response = await fetch(url, requestOptions)
      const responseText = await response.text()
      const finalUrl = response.url

      let found = false
      let detection_info = {
        method: site.detection_method,
        status_code: response.status,
        final_url: finalUrl,
        response_size: responseText.length
      }

      // Aplicar método de detección específico
      switch (site.detection_method) {
        case 'status_code':
          if (site.success_codes && site.success_codes.includes(response.status)) {
            found = true
          } else if (site.failure_codes && !site.failure_codes.includes(response.status)) {
            found = response.ok
          } else {
            found = response.ok
          }
          break

        case 'message':
          if (site.failure_messages) {
            const hasFailureMessage = site.failure_messages.some(msg => 
              responseText.toLowerCase().includes(msg.toLowerCase())
            )
            found = !hasFailureMessage && response.ok
          } else {
            found = response.ok
          }
          detection_info.checked_messages = site.failure_messages
          break

        case 'response_url':
          if (site.failure_redirect) {
            found = finalUrl !== site.failure_redirect && response.ok
          } else {
            found = finalUrl === url && response.ok
          }
          detection_info.expected_url = url
          break

        default:
          // Método por defecto: status code
          found = response.ok
          break
      }

      // Calcular nivel de confianza basado en el método de detección
      let confidence = 0
      let confidence_notes = []

      if (found) {
        switch (site.detection_method) {
          case 'status_code':
            confidence = 0.6 // Confianza media - solo código de estado
            confidence_notes.push('Detección basada solo en código HTTP')
            break
          case 'message':
            if (site.failure_messages && site.failure_messages.length > 0) {
              confidence = 0.8 // Alta confianza - verifica contenido específico
              confidence_notes.push('Detección basada en análisis de contenido')
            } else {
              confidence = 0.5
              confidence_notes.push('Detección básica de mensaje')
            }
            break
          case 'response_url':
            confidence = 0.7 // Buena confianza - verifica redirecciones
            confidence_notes.push('Detección basada en URL de respuesta')
            break
          default:
            confidence = 0.5
            confidence_notes.push('Método de detección estándar')
        }

        // Reducir confianza para sitios conocidos por falsos positivos
        if (site.name === 'Instagram' || site.name === 'Facebook') {
          confidence *= 0.8
          confidence_notes.push('Confianza reducida - sitio propenso a falsos positivos')
        }

        // Aumentar confianza si el código de estado es exactamente el esperado
        if (site.success_codes && site.success_codes.includes(response.status)) {
          confidence = Math.min(confidence + 0.1, 1.0)
          confidence_notes.push('Código de estado coincide con esperado')
        }
      }

      return {
        site: site.name,
        category: site.category,
        found,
        confidence: Math.round(confidence * 100) / 100, // Redondear a 2 decimales
        confidence_level: confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low',
        confidence_notes,
        url,
        profile_url: found ? url : null,
        alternative_url: site.alternative_url ? site.alternative_url.replace('{}', username) : null,
        logo: site.logo,
        tags: site.tags,
        detection_info,
        checked_at: new Date().toISOString(),
        verification_recommended: confidence < 0.7 ? true : false
      }

    } catch (error) {
      console.error(`Error checking ${site.name} for username ${username}:`, error)
      return {
        site: site.name,
        category: site.category,
        found: false,
        url: site.check_url.replace('{}', username),
        error: error.message,
        logo: site.logo,
        tags: site.tags,
        checked_at: new Date().toISOString()
      }
    }
  }

  /**
   * Endpoint principal para búsqueda de nombres de usuario
   * POST /api/osint/username-lookup
   */
  static async usernameLookup(req, res) {
    try {
      const { username } = req.body

      // Validaciones
      if (!username) {
        return res.status(400).json({
          success: false,
          error: 'El parámetro username es requerido'
        })
      }

      if (!UsernameOsintController.validateUsername(username)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de nombre de usuario inválido. Use solo letras, números, puntos, guiones y guiones bajos.'
        })
      }

      // Cargar configuración de sitios
      const config = await UsernameOsintController.loadUsernameConfig()
      
      // Realizar búsquedas en paralelo con límite de concurrencia
      const batchSize = 10 // Procesar 10 sitios a la vez para evitar sobrecarga
      const results = []
      
      for (let i = 0; i < config.sites.length; i += batchSize) {
        const batch = config.sites.slice(i, i + batchSize)
        const batchPromises = batch.map(site => 
          UsernameOsintController.checkSiteForUsername(site, username)
        )
        
        const batchResults = await Promise.allSettled(batchPromises)
        
        // Procesar resultados del batch
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            results.push({
              error: result.reason.message,
              found: false,
              checked_at: new Date().toISOString()
            })
          }
        })
      }

      // Calcular estadísticas
      const foundSites = results.filter(result => result.found)
      const totalSites = results.length
      const categoriesFound = [...new Set(foundSites.map(result => result.category))]
      const tagCounts = {}
      
      foundSites.forEach(result => {
        if (result.tags) {
          result.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })

      // Agrupar resultados por categoría
      const resultsByCategory = {}
      results.forEach(result => {
        if (result.category) {
          if (!resultsByCategory[result.category]) {
            resultsByCategory[result.category] = {
              category_info: config.categories[result.category] || {
                name: result.category,
                description: '',
                color: '#6b7280'
              },
              sites: []
            }
          }
          resultsByCategory[result.category].sites.push(result)
        }
      })

      // Respuesta
      res.json({
        success: true,
        username,
        search_timestamp: new Date().toISOString(),
        statistics: {
          total_sites_checked: totalSites,
          sites_found: foundSites.length,
          categories_found: categoriesFound,
          success_rate: ((foundSites.length / totalSites) * 100).toFixed(2) + '%',
          top_tags: Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count }))
        },
        results_by_category: resultsByCategory,
        found_profiles: foundSites
          .map(result => ({
            site: result.site,
            category: result.category,
            url: result.profile_url,
            logo: result.logo,
            tags: result.tags,
            confidence: result.confidence,
            confidence_level: result.confidence_level,
            verification_recommended: result.verification_recommended
          }))
          .sort((a, b) => b.confidence - a.confidence), // Ordenar por confianza
        confidence_statistics: {
          high_confidence: foundSites.filter(r => r.confidence >= 0.8).length,
          medium_confidence: foundSites.filter(r => r.confidence >= 0.6 && r.confidence < 0.8).length,
          low_confidence: foundSites.filter(r => r.confidence < 0.6).length,
          average_confidence: foundSites.length > 0 ? 
            Math.round((foundSites.reduce((sum, r) => sum + r.confidence, 0) / foundSites.length) * 100) / 100 : 0,
          verification_recommended_count: foundSites.filter(r => r.verification_recommended).length
        },
        summary: {
          found_on_sites: foundSites.length > 0,
          total_found: foundSites.length,
          most_common_categories: categoriesFound.slice(0, 3),
          most_reliable_sites: foundSites
            .filter(r => r.confidence >= 0.7)
            .map(r => r.site)
            .slice(0, 5),
          sites_needing_verification: foundSites
            .filter(r => r.verification_recommended)
            .map(r => r.site)
        }
      })

    } catch (error) {
      console.error('Error en username lookup:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      })
    }
  }

  /**
   * Obtener información de sitios disponibles y categorías
   * GET /api/osint/username-sites
   */
  static async getAvailableSites(req, res) {
    try {
      const config = await UsernameOsintController.loadUsernameConfig()
      
      const sitesSummary = config.sites.map(site => ({
        name: site.name,
        category: site.category,
        main_domain: site.main_domain,
        logo: site.logo,
        tags: site.tags,
        detection_method: site.detection_method
      }))

      const categoriesWithCounts = {}
      config.sites.forEach(site => {
        if (!categoriesWithCounts[site.category]) {
          categoriesWithCounts[site.category] = {
            ...config.categories[site.category],
            count: 0
          }
        }
        categoriesWithCounts[site.category].count++
      })

      res.json({
        success: true,
        total_sites: config.sites.length,
        categories: categoriesWithCounts,
        sites: sitesSummary,
        detection_methods: {
          status_code: 'Verificación por código de estado HTTP',
          message: 'Verificación por contenido de mensaje',
          response_url: 'Verificación por URL de respuesta'
        }
      })
    } catch (error) {
      console.error('Error obteniendo sitios disponibles:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  /**
   * Búsqueda rápida en sitios principales
   * POST /api/osint/username-quick
   */
  static async quickUsernameLookup(req, res) {
    try {
      const { username } = req.body

      if (!username || !UsernameOsintController.validateUsername(username)) {
        return res.status(400).json({
          success: false,
          error: 'Nombre de usuario inválido'
        })
      }

      const config = await UsernameOsintController.loadUsernameConfig()
      
      // Sitios principales para búsqueda rápida
      const mainSites = ['Instagram', 'GitHub', 'YouTube', 'Twitter/X', 'LinkedIn', 'Reddit']
      const selectedSites = config.sites.filter(site => mainSites.includes(site.name))

      const results = await Promise.allSettled(
        selectedSites.map(site => 
          UsernameOsintController.checkSiteForUsername(site, username)
        )
      )

      const processedResults = results.map(result => 
        result.status === 'fulfilled' ? result.value : { found: false, error: result.reason.message }
      )

      const foundSites = processedResults.filter(result => result.found)

      res.json({
        success: true,
        username,
        search_type: 'quick',
        search_timestamp: new Date().toISOString(),
        results: processedResults,
        summary: {
          total_checked: selectedSites.length,
          found: foundSites.length,
          found_sites: foundSites.map(site => site.site)
        }
      })

    } catch (error) {
      console.error('Error en quick username lookup:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }
}
