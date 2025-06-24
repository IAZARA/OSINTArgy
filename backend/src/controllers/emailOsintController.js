import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Controlador para operaciones de OSINT de emails
 */
export class EmailOsintController {
  
  /**
   * Carga la configuración de sitios desde el archivo JSON
   */
  static async loadSitesConfig() {
    try {
      const sitesPath = path.join(__dirname, '../data/sites.json')
      const sitesData = await fs.readFile(sitesPath, 'utf8')
      return JSON.parse(sitesData)
    } catch (error) {
      console.error('Error cargando configuración de sitios:', error)
      throw new Error('No se pudo cargar la configuración de sitios')
    }
  }

  /**
   * Extrae el prefijo del email (parte antes del @)
   */
  static extractEmailPrefix(email) {
    return email.split('@')[0]
  }

  /**
   * Valida el formato del email
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Realiza una búsqueda en un sitio específico
   */
  static async checkSite(site, emailPrefix) {
    try {
      const url = site.check_url.replace('{email_prefix}', emailPrefix)
      
      const response = await fetch(url, {
        method: site.method,
        headers: site.headers || {},
        timeout: 10000 // 10 segundos de timeout
      })

      const responseText = await response.text()
      const responseData = {
        status: response.status,
        text: responseText,
        headers: Object.fromEntries(response.headers.entries())
      }

      // Verificar indicadores de éxito
      const hasSuccessIndicator = site.success_indicators.some(indicator => 
        responseText.toLowerCase().includes(indicator.toLowerCase())
      )

      // Verificar indicadores de fallo
      const hasFailureIndicator = site.failure_indicators.some(indicator => 
        responseText.toLowerCase().includes(indicator.toLowerCase())
      )

      let found = false
      if (response.ok && hasSuccessIndicator && !hasFailureIndicator) {
        found = true
      }

      return {
        site: site.name,
        found,
        url,
        status: response.status,
        category: site.category,
        logo: site.logo,
        response_size: responseText.length,
        checked_at: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error checking ${site.name}:`, error)
      return {
        site: site.name,
        found: false,
        url: site.check_url.replace('{email_prefix}', emailPrefix),
        error: error.message,
        category: site.category,
        logo: site.logo,
        checked_at: new Date().toISOString()
      }
    }
  }

  /**
   * Consulta la API de HaveIBeenPwned
   */
  static async checkHaveIBeenPwned(email) {
    try {
      const apiKey = process.env.HIBP_API_KEY
      if (!apiKey) {
        return {
          error: 'API key de HaveIBeenPwned no configurada',
          breaches: []
        }
      }

      const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
        headers: {
          'hibp-api-key': apiKey,
          'User-Agent': 'OSINTArgy-EmailChecker/1.0'
        },
        timeout: 15000
      })

      if (response.status === 404) {
        return {
          found: false,
          breaches: [],
          message: 'Email no encontrado en brechas conocidas'
        }
      }

      if (!response.ok) {
        throw new Error(`HIBP API error: ${response.status}`)
      }

      const breaches = await response.json()
      return {
        found: true,
        breaches: breaches.map(breach => ({
          name: breach.Name,
          title: breach.Title,
          domain: breach.Domain,
          breach_date: breach.BreachDate,
          added_date: breach.AddedDate,
          modified_date: breach.ModifiedDate,
          pwn_count: breach.PwnCount,
          description: breach.Description,
          data_classes: breach.DataClasses,
          is_verified: breach.IsVerified,
          is_fabricated: breach.IsFabricated,
          is_sensitive: breach.IsSensitive,
          is_retired: breach.IsRetired,
          is_spam_list: breach.IsSpamList,
          logo_path: breach.LogoPath
        })),
        total_breaches: breaches.length
      }
    } catch (error) {
      console.error('Error checking HaveIBeenPwned:', error)
      return {
        error: error.message,
        breaches: []
      }
    }
  }

  /**
   * Endpoint principal para lookup de email
   * POST /api/osint/email-lookup
   */
  static async emailLookup(req, res) {
    try {
      const { email } = req.body

      // Validaciones
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'El parámetro email es requerido'
        })
      }

      if (!EmailOsintController.validateEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de email inválido'
        })
      }

      const emailPrefix = EmailOsintController.extractEmailPrefix(email)
      
      // Cargar configuración de sitios
      const sitesConfig = await EmailOsintController.loadSitesConfig()
      
      // Realizar búsquedas en paralelo
      const siteChecks = sitesConfig.sites.map(site => 
        EmailOsintController.checkSite(site, emailPrefix)
      )
      
      // Consultar HaveIBeenPwned en paralelo
      const hibpCheck = EmailOsintController.checkHaveIBeenPwned(email)
      
      // Esperar a que todas las búsquedas terminen
      const [siteResults, hibpResult] = await Promise.all([
        Promise.allSettled(siteChecks),
        hibpCheck
      ])

      // Procesar resultados de sitios
      const processedSiteResults = siteResults.map(result => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            error: result.reason.message,
            found: false
          }
        }
      })

      // Estadísticas
      const foundSites = processedSiteResults.filter(result => result.found).length
      const totalSites = processedSiteResults.length
      const categoriesFound = [...new Set(
        processedSiteResults
          .filter(result => result.found)
          .map(result => result.category)
      )]

      // Respuesta
      res.json({
        success: true,
        email,
        email_prefix: emailPrefix,
        search_timestamp: new Date().toISOString(),
        statistics: {
          total_sites_checked: totalSites,
          sites_found: foundSites,
          categories_found: categoriesFound,
          success_rate: ((foundSites / totalSites) * 100).toFixed(2) + '%'
        },
        site_results: processedSiteResults,
        breach_data: hibpResult,
        summary: {
          found_on_sites: foundSites > 0,
          found_in_breaches: hibpResult.found || false,
          total_breaches: hibpResult.breaches?.length || 0
        }
      })

    } catch (error) {
      console.error('Error en email lookup:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      })
    }
  }

  /**
   * Obtener estadísticas de sitios disponibles
   * GET /api/osint/email-sites
   */
  static async getAvailableSites(req, res) {
    try {
      const sitesConfig = await EmailOsintController.loadSitesConfig()
      
      const sitesSummary = sitesConfig.sites.map(site => ({
        name: site.name,
        category: site.category,
        logo: site.logo
      }))

      const categories = [...new Set(sitesConfig.sites.map(site => site.category))]

      res.json({
        success: true,
        total_sites: sitesConfig.sites.length,
        categories,
        sites: sitesSummary
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
