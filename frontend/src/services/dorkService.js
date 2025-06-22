import api from './api.js'

/**
 * Servicio para interactuar con la API de generación de dorks
 */
class DorkService {
  
  /**
   * Genera dorks basados en los parámetros proporcionados
   * @param {Object} params - Parámetros para la generación de dorks
   * @param {string} params.query - Término de búsqueda principal
   * @param {string} params.targetType - Tipo de objetivo (usernames, emails, websites)
   * @param {Array} params.engines - Motores de búsqueda a usar
   * @param {Object} params.options - Opciones adicionales
   * @returns {Promise} Respuesta de la API
   */
  static async generateDorks(params) {
    try {
      const response = await api.post('/dorks/generate', params)
      return response.data
    } catch (error) {
      console.error('Error generando dorks:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene los tipos de objetivo disponibles
   * @returns {Promise} Lista de tipos de objetivo
   */
  static async getTargetTypes() {
    try {
      const response = await api.get('/dorks/target-types')
      return response.data
    } catch (error) {
      console.error('Error obteniendo tipos de objetivo:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene los motores de búsqueda disponibles
   * @returns {Promise} Lista de motores de búsqueda
   */
  static async getSearchEngines() {
    try {
      const response = await api.get('/dorks/search-engines')
      return response.data
    } catch (error) {
      console.error('Error obteniendo motores de búsqueda:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Maneja los errores de la API
   * @param {Error} error - Error de la API
   * @returns {Error} Error procesado
   */
  static handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.error || 'Error del servidor'
      const details = error.response.data?.details || null
      return new Error(`${message}${details ? ': ' + JSON.stringify(details) : ''}`)
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.')
    } else {
      // Error de configuración
      return new Error('Error interno de la aplicación')
    }
  }

  /**
   * Valida los parámetros antes de enviar la solicitud
   * @param {Object} params - Parámetros a validar
   * @returns {Object} Resultado de la validación
   */
  static validateParams(params) {
    const errors = []

    if (!params.query || params.query.trim().length === 0) {
      errors.push('El término de búsqueda es requerido')
    }

    if (params.query && params.query.length > 200) {
      errors.push('El término de búsqueda no puede exceder 200 caracteres')
    }

    if (params.targetType && !['usernames', 'emails', 'websites'].includes(params.targetType)) {
      errors.push('Tipo de objetivo no válido')
    }

    if (params.engines && (!Array.isArray(params.engines) || params.engines.length === 0)) {
      errors.push('Debe seleccionar al menos un motor de búsqueda')
    }

    if (params.engines) {
      const invalidEngines = params.engines.filter(engine => !['google', 'yandex'].includes(engine))
      if (invalidEngines.length > 0) {
        errors.push(`Motores de búsqueda no válidos: ${invalidEngines.join(', ')}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Abre una URL en una nueva pestaña
   * @param {string} url - URL a abrir
   */
  static openUrl(url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  /**
   * Copia texto al portapapeles
   * @param {string} text - Texto a copiar
   * @returns {Promise<boolean>} True si se copió exitosamente
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Error copiando al portapapeles:', error)
      // Fallback para navegadores que no soportan clipboard API
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (fallbackError) {
        console.error('Error en fallback de copia:', fallbackError)
        return false
      }
    }
  }

  /**
   * Exporta los resultados a un archivo de texto
   * @param {Object} results - Resultados de la generación de dorks
   * @param {string} query - Término de búsqueda usado
   */
  static exportResults(results, query) {
    try {
      let content = `# Dorks generados para: ${query}\n`
      content += `# Generado el: ${new Date().toLocaleString()}\n\n`

      Object.entries(results).forEach(([engine, urls]) => {
        content += `## ${engine.toUpperCase()}\n\n`
        urls.forEach((item, index) => {
          content += `${index + 1}. ${item.query}\n`
          content += `   URL: ${item.url}\n\n`
        })
      })

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dorks_${query.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exportando resultados:', error)
      throw new Error('Error al exportar los resultados')
    }
  }
}

export default DorkService