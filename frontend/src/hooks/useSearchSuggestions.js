import { useState, useEffect, useMemo, useCallback } from 'react'
import { storage } from '@utils/helpers'

export const useSearchSuggestions = (tools, categories) => {
  const [recentSearches, setRecentSearches] = useState([])
  const [popularQueries, setPopularQueries] = useState([])

  // Cargar búsquedas recientes al inicializar
  useEffect(() => {
    const savedSearches = storage.get('recent_searches', [])
    setRecentSearches(savedSearches)
    
    const savedPopular = storage.get('popular_queries', [])
    setPopularQueries(savedPopular)
  }, [])

  // Pre-procesar datos para sugerencias
  const suggestionData = useMemo(() => {
    if (!tools || !categories) return null

    // Extraer todas las palabras clave únicas
    const allKeywords = new Set()
    const toolNames = new Set()
    const categoryNames = new Set()

    // Procesar herramientas
    tools.forEach(tool => {
      // Nombres de herramientas
      toolNames.add(tool.name.toLowerCase())
      
      // Tags
      if (tool.tags) {
        tool.tags.forEach(tag => allKeywords.add(tag.toLowerCase()))
      }
      
      // Palabras de descripción y utilidad
      if (tool.description) {
        tool.description.split(' ').forEach(word => {
          if (word.length > 3) allKeywords.add(word.toLowerCase())
        })
      }
      
      // Categorías y subcategorías
      if (tool.category) categoryNames.add(tool.category.toLowerCase())
      if (tool.subcategory) categoryNames.add(tool.subcategory.toLowerCase())
    })

    // Procesar categorías
    categories.forEach(category => {
      categoryNames.add(category.name.toLowerCase())
      if (category.subcategories) {
        category.subcategories.forEach(sub => {
          categoryNames.add(sub.name.toLowerCase())
        })
      }
    })

    // Herramientas populares (por rating y uso)
    const popularTools = tools
      .filter(tool => tool.rating && tool.usage_count)
      .sort((a, b) => (b.rating * b.usage_count) - (a.rating * a.usage_count))
      .slice(0, 15)
      .map(tool => tool.name.toLowerCase())

    // Sugerencias por categoría principales
    const mainCategories = [
      'redes sociales', 'email', 'dominios', 'geolocalización', 
      'imágenes', 'documentos', 'argentina', 'teléfonos', 
      'criptomonedas', 'osint', 'búsqueda'
    ]

    // Consultas predefinidas comunes
    const commonQueries = [
      'osint argentina', 'verificación email', 'análisis dominios',
      'redes sociales personas', 'criptomonedas bitcoin', 'google dorks',
      'metadatos imágenes', 'búsqueda inversa', 'whois', 'shodan',
      'herramientas gratuitas', 'sin registro', 'principiantes',
      'análisis forense', 'threat intelligence', 'maltego',
      'geolocalización ip', 'facebook osint', 'twitter'
    ]

    return {
      keywords: Array.from(allKeywords),
      toolNames: Array.from(toolNames),
      categoryNames: Array.from(categoryNames),
      popularTools,
      mainCategories,
      commonQueries
    }
  }, [tools, categories])

  // Generar sugerencias basadas en query
  const generateSuggestions = useCallback((query, maxResults = 8) => {
    if (!suggestionData) return []
    
    const suggestions = new Set()
    const queryLower = query.toLowerCase().trim()

    if (!queryLower) {
      // Si no hay query, mostrar sugerencias populares y recientes
      recentSearches.slice(0, 3).forEach(search => suggestions.add(search))
      suggestionData.commonQueries.slice(0, 5).forEach(query => suggestions.add(query))
      return Array.from(suggestions).slice(0, maxResults)
    }

    // 1. Coincidencias exactas en nombres de herramientas (máxima prioridad)
    suggestionData.toolNames.forEach(name => {
      if (name.includes(queryLower)) {
        suggestions.add(name)
      }
    })

    // 2. Coincidencias en categorías
    suggestionData.categoryNames.forEach(category => {
      if (category.includes(queryLower)) {
        suggestions.add(category)
      }
    })

    // 3. Coincidencias en keywords/tags
    suggestionData.keywords.forEach(keyword => {
      if (keyword.includes(queryLower) && keyword.length > 2) {
        suggestions.add(keyword)
      }
    })

    // 4. Herramientas populares que coincidan
    suggestionData.popularTools.forEach(tool => {
      if (tool.includes(queryLower)) {
        suggestions.add(tool)
      }
    })

    // 5. Consultas comunes que coincidan
    suggestionData.commonQueries.forEach(commonQuery => {
      if (commonQuery.includes(queryLower)) {
        suggestions.add(commonQuery)
      }
    })

    // 6. Búsquedas recientes similares
    recentSearches.forEach(recent => {
      if (recent.toLowerCase().includes(queryLower)) {
        suggestions.add(recent)
      }
    })

    // Convertir a array, filtrar duplicados y limitar resultados
    return Array.from(suggestions)
      .filter(suggestion => suggestion !== queryLower)
      .slice(0, maxResults)
  }, [suggestionData, recentSearches])

  // Agregar búsqueda al historial
  const addToRecentSearches = useCallback((query) => {
    if (!query || query.trim().length < 2) return

    const normalizedQuery = query.trim()
    const newRecentSearches = [
      normalizedQuery,
      ...recentSearches.filter(search => search !== normalizedQuery)
    ].slice(0, 10) // Mantener solo las últimas 10

    setRecentSearches(newRecentSearches)
    storage.set('recent_searches', newRecentSearches)

    // Actualizar conteo de consultas populares
    const currentPopular = storage.get('query_counts', {})
    currentPopular[normalizedQuery] = (currentPopular[normalizedQuery] || 0) + 1
    storage.set('query_counts', currentPopular)

    // Actualizar lista de populares
    const sortedPopular = Object.entries(currentPopular)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([query]) => query)
    
    setPopularQueries(sortedPopular)
    storage.set('popular_queries', sortedPopular)
  }, [recentSearches])

  // Limpiar historial de búsquedas
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    storage.set('recent_searches', [])
  }, [])

  // Obtener sugerencias por categoría
  const getSuggestionsByCategory = useCallback((category) => {
    if (!suggestionData || !tools) return []

    const categoryTools = tools.filter(tool => 
      tool.category?.toLowerCase().includes(category.toLowerCase()) ||
      tool.subcategory?.toLowerCase().includes(category.toLowerCase())
    )

    return categoryTools
      .slice(0, 8)
      .map(tool => tool.name)
  }, [tools, suggestionData])

  // Obtener sugerencias trending (más buscadas recientemente)
  const getTrendingSuggestions = useCallback(() => {
    return popularQueries.slice(0, 6)
  }, [popularQueries])

  return {
    generateSuggestions,
    addToRecentSearches,
    clearRecentSearches,
    getSuggestionsByCategory,
    getTrendingSuggestions,
    recentSearches,
    popularQueries,
    isReady: !!suggestionData
  }
}

export default useSearchSuggestions