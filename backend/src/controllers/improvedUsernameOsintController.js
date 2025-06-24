import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Controlador mejorado para búsqueda de nombres de usuario con detección robusta
 */
export class ImprovedUsernameOsintController {
  
  /**
   * Carga la configuración mejorada de sitios
   */
  static async loadImprovedUsernameConfig() {
    try {
      const configPath = path.join(__dirname, '../data/improved_username_sites.json')
      const configData = await fs.readFile(configPath, 'utf8')
      return JSON.parse(configData)
    } catch (error) {
      console.error('Error cargando configuración mejorada:', error)
      // Fallback a configuración original
      try {
        return await this.loadUsernameConfig()
      } catch (fallbackError) {
        console.error('Error cargando configuración fallback:', fallbackError)
        throw new Error('No se pudo cargar ninguna configuración de sitios')
      }
    }
  }

  /**
   * Fallback a configuración original
   */
  static async loadUsernameConfig() {
    try {
      const configPath = path.join(__dirname, '../data/username_sites.json')
      const configData = await fs.readFile(configPath, 'utf8')
      return JSON.parse(configData)
    } catch (error) {
      throw new Error('No se pudo cargar ninguna configuración de sitios')
    }
  }

  /**
   * Analiza el contenido de una respuesta para determinar si el perfil existe
   */
  static analyzeContent(responseText, site, username) {
    let confidence = 0
    let reasons = []
    let indicators_found = []
    let failures_found = []

    // Verificar indicadores de éxito
    if (site.success_indicators) {
      for (const indicator of site.success_indicators) {
        const searchTerm = indicator.replace('{}', username)
        if (responseText.toLowerCase().includes(searchTerm.toLowerCase())) {
          confidence += 0.3
          indicators_found.push(indicator)
          reasons.push(`Encontrado indicador de éxito: ${indicator}`)
        }
      }
    }

    // Verificar indicadores de fallo
    if (site.failure_indicators) {
      for (const indicator of site.failure_indicators) {
        if (responseText.toLowerCase().includes(indicator.toLowerCase())) {
          confidence -= 0.5
          failures_found.push(indicator)
          reasons.push(`Encontrado indicador de fallo: ${indicator}`)
        }
      }
    }

    // Verificar datos mínimos del perfil
    if (site.minimum_profile_data) {
      for (const dataField of site.minimum_profile_data) {
        if (responseText.toLowerCase().includes(dataField.toLowerCase())) {
          confidence += 0.2
          reasons.push(`Encontrado campo de perfil: ${dataField}`)
        }
      }
    }

    return {
      confidence: Math.max(0, Math.min(1, confidence)),
      reasons,
      indicators_found,
      failures_found
    }
  }

  /**
   * Valida respuesta de API estructurada
   */
  static validateApiResponse(responseText, site) {
    try {
      const data = JSON.parse(responseText)
      let confidence = 0
      let reasons = []

      if (site.api_validation?.required_fields) {
        for (const field of site.api_validation.required_fields) {
          if (data[field] !== undefined) {
            confidence += 0.3
            reasons.push(`Campo requerido encontrado: ${field}`)
          } else {
            confidence -= 0.2
            reasons.push(`Campo requerido faltante: ${field}`)
          }
        }
      }

      if (site.api_validation?.valid_types && data.type) {
        if (site.api_validation.valid_types.includes(data.type)) {
          confidence += 0.2
          reasons.push(`Tipo válido: ${data.type}`)
        }
      }

      if (site.api_validation?.valid_indicators) {
        for (const indicator of site.api_validation.valid_indicators) {
          if (data[indicator] !== undefined) {
            confidence += 0.1
            reasons.push(`Indicador válido encontrado: ${indicator}`)
          }
        }
      }

      return {
        confidence: Math.max(0, Math.min(1, confidence)),
        reasons,
        parsed_data: data
      }
    } catch (error) {
      return {
        confidence: 0,
        reasons: ['Error parsing JSON response'],
        parsed_data: null
      }
    }
  }

  /**
   * Verifica URL de redirección
   */
  static validateUrlRedirection(finalUrl, expectedUrl, site) {
    let confidence = 0.5
    let reasons = []

    // Si hay validación de URL específica
    if (site.url_validation?.should_not_redirect_to) {
      for (const badUrl of site.url_validation.should_not_redirect_to) {
        if (finalUrl.startsWith(badUrl)) {
          confidence = 0
          reasons.push(`Redirigido a URL de fallo: ${badUrl}`)
          return { confidence, reasons }
        }
      }
    }

    // Si la URL final es muy diferente a la esperada
    if (finalUrl !== expectedUrl) {
      const expectedDomain = new URL(expectedUrl).hostname
      const finalDomain = new URL(finalUrl).hostname
      
      if (expectedDomain !== finalDomain) {
        confidence -= 0.3
        reasons.push(`Redirigido a dominio diferente: ${finalDomain}`)
      } else {
        confidence += 0.2
        reasons.push('Permaneció en el dominio correcto')
      }
    } else {
      confidence += 0.3
      reasons.push('URL exacta mantenida')
    }

    return { confidence, reasons }
  }

  /**
   * Realiza verificación mejorada de un sitio específico
   */
  static async checkSiteForUsernameImproved(site, username) {
    try {
      const url = site.check_url.replace('{}', username)
      
      const requestOptions = {
        method: 'GET',
        headers: site.headers || {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000,
        redirect: 'follow'
      }

      const response = await fetch(url, requestOptions)
      const responseText = await response.text()
      const finalUrl = response.url

      let overallConfidence = 0
      let allReasons = []
      let detection_details = {
        method: site.detection_method,
        status_code: response.status,
        final_url: finalUrl,
        response_size: responseText.length,
        checks_performed: []
      }

      // Aplicar método de detección específico
      switch (site.detection_method) {
        case 'content_analysis':
          const contentAnalysis = this.analyzeContent(responseText, site, username)
          overallConfidence = contentAnalysis.confidence
          allReasons = contentAnalysis.reasons
          detection_details.content_analysis = {
            indicators_found: contentAnalysis.indicators_found,
            failures_found: contentAnalysis.failures_found
          }
          detection_details.checks_performed.push('content_analysis')
          break

        case 'api_response':
          const apiValidation = this.validateApiResponse(responseText, site)
          overallConfidence = apiValidation.confidence
          allReasons = apiValidation.reasons
          detection_details.api_data = apiValidation.parsed_data
          detection_details.checks_performed.push('api_validation')
          
          // Fallback a análisis de contenido si la API falla
          if (overallConfidence < 0.3 && site.fallback_detection === 'content_analysis') {
            const fallbackAnalysis = this.analyzeContent(responseText, site, username)
            overallConfidence = Math.max(overallConfidence, fallbackAnalysis.confidence)
            allReasons = [...allReasons, ...fallbackAnalysis.reasons]
            detection_details.checks_performed.push('fallback_content_analysis')
          }
          break

        case 'response_url_and_content':
          const urlValidation = this.validateUrlRedirection(finalUrl, url, site)
          const contentAnalysis2 = this.analyzeContent(responseText, site, username)
          
          overallConfidence = (urlValidation.confidence * 0.4) + (contentAnalysis2.confidence * 0.6)
          allReasons = [...urlValidation.reasons, ...contentAnalysis2.reasons]
          detection_details.url_validation = urlValidation
          detection_details.content_analysis = contentAnalysis2
          detection_details.checks_performed.push('url_validation', 'content_analysis')
          break

        case 'status_code':
        default:
          // Método básico como fallback
          if (site.success_codes && site.success_codes.includes(response.status)) {
            overallConfidence = 0.6
            allReasons.push(`Código de éxito: ${response.status}`)
          } else if (site.failure_codes && site.failure_codes.includes(response.status)) {
            overallConfidence = 0
            allReasons.push(`Código de fallo: ${response.status}`)
          } else {
            overallConfidence = response.ok ? 0.5 : 0
            allReasons.push(`Código básico: ${response.status}`)
          }
          detection_details.checks_performed.push('status_code')
          break
      }

      // Aplicar umbral de confianza si está definido
      const threshold = site.confidence_threshold || 0.5
      const found = overallConfidence >= threshold

      return {
        site: site.name,
        category: site.category,
        found,
        confidence: overallConfidence,
        threshold,
        url,
        profile_url: found ? (site.alternative_url ? site.alternative_url.replace('{}', username) : url) : null,
        alternative_url: site.alternative_url ? site.alternative_url.replace('{}', username) : url,
        logo: site.logo,
        tags: site.tags,
        detection_info: detection_details,
        confidence_reasons: allReasons,
        checked_at: new Date().toISOString()
      }

    } catch (error) {
      console.error(`Error verificando ${site.name} para ${username}:`, error.message)
      return {
        site: site.name,
        category: site.category,
        found: false,
        confidence: 0,
        threshold: site.confidence_threshold || 0.5,
        url: site.check_url.replace('{}', username),
        profile_url: null,
        alternative_url: site.alternative_url ? site.alternative_url.replace('{}', username) : null,
        logo: site.logo,
        tags: site.tags,
        detection_info: {
          method: site.detection_method,
          error: error.message,
          checks_performed: ['error']
        },
        confidence_reasons: [`Error: ${error.message}`],
        checked_at: new Date().toISOString()
      }
    }
  }

  /**
   * Búsqueda completa de username con detección mejorada
   */
  static async improvedUsernameLookup(req, res) {
    try {
      const { username } = req.body

      if (!username || typeof username !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un nombre de usuario válido'
        })
      }

      if (username.length < 1 || username.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'El nombre de usuario debe tener entre 1 y 50 caracteres'
        })
      }

      const config = await this.loadImprovedUsernameConfig()
      const startTime = Date.now()

      // Realizar búsquedas en paralelo
      const searchPromises = config.sites.map(site => 
        this.checkSiteForUsernameImproved(site, username)
      )

      const results = await Promise.all(searchPromises)
      const endTime = Date.now()

      // Agrupar resultados por categoría
      const resultsByCategory = {}
      const foundProfiles = []
      let totalFound = 0
      const categoriesFound = new Set()

      for (const result of results) {
        if (!resultsByCategory[result.category]) {
          resultsByCategory[result.category] = {
            category_info: {
              name: this.getCategoryDisplayName(result.category),
              description: this.getCategoryDescription(result.category),
              color: this.getCategoryColor(result.category)
            },
            sites: []
          }
        }

        resultsByCategory[result.category].sites.push(result)

        if (result.found) {
          foundProfiles.push({
            site: result.site,
            category: result.category,
            url: result.profile_url || result.url,
            logo: result.logo,
            tags: result.tags,
            confidence: result.confidence
          })
          totalFound++
          categoriesFound.add(result.category)
        }
      }

      // Estadísticas mejoradas
      const highConfidenceResults = results.filter(r => r.confidence >= 0.8)
      const mediumConfidenceResults = results.filter(r => r.confidence >= 0.6 && r.confidence < 0.8)
      const lowConfidenceResults = results.filter(r => r.confidence >= 0.4 && r.confidence < 0.6)

      res.json({
        success: true,
        username,
        search_timestamp: new Date().toISOString(),
        execution_time_ms: endTime - startTime,
        statistics: {
          total_sites_checked: config.sites.length,
          sites_found: totalFound,
          categories_found: Array.from(categoriesFound),
          success_rate: `${((totalFound / config.sites.length) * 100).toFixed(2)}%`,
          confidence_breakdown: {
            high_confidence: highConfidenceResults.length,
            medium_confidence: mediumConfidenceResults.length,
            low_confidence: lowConfidenceResults.length,
            no_confidence: results.filter(r => r.confidence < 0.4).length
          }
        },
        results_by_category: resultsByCategory,
        found_profiles: foundProfiles.sort((a, b) => b.confidence - a.confidence), // Ordenar por confianza
        summary: {
          found_on_sites: totalFound > 0,
          total_found: totalFound,
          most_common_categories: Array.from(categoriesFound).slice(0, 3),
          highest_confidence_sites: foundProfiles
            .filter(p => p.confidence >= 0.8)
            .map(p => p.site)
            .slice(0, 5)
        }
      })

    } catch (error) {
      console.error('Error en búsqueda mejorada de username:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor durante la búsqueda'
      })
    }
  }

  /**
   * Obtiene nombre de categoría para mostrar
   */
  static getCategoryDisplayName(category) {
    const names = {
      'social_media': 'Redes Sociales',
      'development': 'Desarrollo',
      'video': 'Video',
      'professional': 'Profesional',
      'streaming': 'Streaming',
      'music': 'Música',
      'art': 'Arte',
      'photography': 'Fotografía',
      'blogging': 'Blogging',
      'crowdfunding': 'Crowdfunding',
      'messaging': 'Mensajería',
      'gaming': 'Gaming'
    }
    return names[category] || category
  }

  /**
   * Obtiene descripción de categoría
   */
  static getCategoryDescription(category) {
    const descriptions = {
      'social_media': 'Plataformas de redes sociales y comunicación',
      'development': 'Plataformas de desarrollo y programación',
      'video': 'Plataformas de video y streaming',
      'professional': 'Redes profesionales y de carrera',
      'streaming': 'Plataformas de transmisión en vivo',
      'music': 'Plataformas de música y audio',
      'art': 'Plataformas de arte y creatividad',
      'photography': 'Plataformas de fotografía e imágenes',
      'blogging': 'Plataformas de blogs y escritura',
      'crowdfunding': 'Plataformas de financiación colectiva',
      'messaging': 'Plataformas de mensajería y comunicación',
      'gaming': 'Plataformas de videojuegos y gaming'
    }
    return descriptions[category] || 'Categoría general'
  }

  /**
   * Obtiene color de categoría
   */
  static getCategoryColor(category) {
    const colors = {
      'social_media': '#3b82f6',
      'development': '#7c3aed',
      'video': '#dc2626',
      'professional': '#059669',
      'streaming': '#7c2d12',
      'music': '#be185d',
      'art': '#9333ea',
      'photography': '#0891b2',
      'blogging': '#ea580c',
      'crowdfunding': '#16a34a',
      'messaging': '#0d9488',
      'gaming': '#7c3aed'
    }
    return colors[category] || '#6b7280'
  }

  /**
   * Obtener sitios disponibles con información de confianza
   */
  static async getAvailableSitesImproved(req, res) {
    try {
      const config = await this.loadImprovedUsernameConfig()
      
      const sitesWithConfidenceInfo = config.sites.map(site => ({
        name: site.name,
        category: site.category,
        main_domain: site.main_domain,
        logo: site.logo,
        tags: site.tags,
        detection_method: site.detection_method,
        confidence_threshold: site.confidence_threshold || 0.5,
        confidence_level: site.confidence_threshold >= 0.8 ? 'high' : 
                         site.confidence_threshold >= 0.6 ? 'medium' : 'low'
      }))

      res.json({
        success: true,
        total_sites: config.sites.length,
        detection_methods: config.detection_methods,
        confidence_levels: config.confidence_levels,
        sites: sitesWithConfidenceInfo
      })

    } catch (error) {
      console.error('Error obteniendo sitios disponibles:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }
}