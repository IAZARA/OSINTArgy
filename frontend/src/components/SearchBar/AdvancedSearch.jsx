import React, { useState, useEffect } from 'react'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { searchService } from '../../services/userService.js'
import './AdvancedSearch.css'

const AdvancedSearch = ({ onSearch, onClose, initialFilters = {} }) => {
  const [query, setQuery] = useState(initialFilters.q || '')
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    subcategory: initialFilters.subcategory || '',
    region: initialFilters.region || '',
    type: initialFilters.type || '',
    difficulty: initialFilters.difficulty || '',
    isFree: initialFilters.isFree || '',
    requiresRegistration: initialFilters.requiresRegistration || '',
    minRating: initialFilters.minRating || '',
    tags: initialFilters.tags || '',
    sortBy: initialFilters.sortBy || 'relevance'
  })
  const [availableFilters, setAvailableFilters] = useState({})
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    advanced: false,
    sorting: false
  })
  const [loading, setLoading] = useState(false)

  // Cargar filtros disponibles al montar el componente
  useEffect(() => {
    loadAvailableFilters()
  }, [])

  // Obtener sugerencias cuando cambia la query
  useEffect(() => {
    if (query.length >= 2) {
      getSuggestions(query)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const loadAvailableFilters = async () => {
    try {
      const response = await searchService.getFilters()
      if (response.success) {
        setAvailableFilters(response.data)
      }
    } catch (error) {
      console.error('Error cargando filtros:', error)
    }
  }

  const getSuggestions = async (searchQuery) => {
    try {
      const response = await searchService.getSuggestions(searchQuery)
      if (response.success) {
        setSuggestions(response.data)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = async () => {
    setLoading(true)
    const searchParams = {
      q: query,
      ...filters
    }

    // Remover filtros vacíos
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
        delete searchParams[key]
      }
    })

    try {
      await onSearch(searchParams)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setQuery('')
    setFilters({
      category: '',
      subcategory: '',
      region: '',
      type: '',
      difficulty: '',
      isFree: '',
      requiresRegistration: '',
      minRating: '',
      tags: '',
      sortBy: 'relevance'
    })
  }

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'tool') {
      setQuery(suggestion.value)
    } else if (suggestion.type === 'category') {
      setFilters(prev => ({ ...prev, category: suggestion.value }))
    } else if (suggestion.type === 'tag') {
      setFilters(prev => ({ ...prev, tags: suggestion.value }))
    }
    setShowSuggestions(false)
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '' && value !== 'relevance').length
  }

  return (
    <div className="advanced-search-overlay">
      <div className="advanced-search-modal">
        <div className="advanced-search-header">
          <h3>Búsqueda Avanzada</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="advanced-search-content">
          {/* Campo de búsqueda principal */}
          <div className="search-input-section">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar herramientas, categorías, tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="search-input"
              />
              {query && (
                <button
                  className="clear-query-btn"
                  onClick={() => setQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sugerencias */}
            {showSuggestions && suggestions && (
              <div className="suggestions-dropdown">
                {suggestions.tools?.map((suggestion, index) => (
                  <div
                    key={`tool-${index}`}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={14} />
                    <span>{suggestion.value}</span>
                    <span className="suggestion-category">{suggestion.category}</span>
                  </div>
                ))}
                {suggestions.categories?.map((suggestion, index) => (
                  <div
                    key={`category-${index}`}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Filter size={14} />
                    <span>{suggestion.value}</span>
                    <span className="suggestion-type">Categoría</span>
                  </div>
                ))}
                {suggestions.tags?.map((suggestion, index) => (
                  <div
                    key={`tag-${index}`}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="tag-icon">#</span>
                    <span>{suggestion.value}</span>
                    <span className="suggestion-count">({suggestion.count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filtros básicos */}
          <div className="filter-section">
            <div
              className="filter-section-header"
              onClick={() => toggleSection('basic')}
            >
              <h4>Filtros Básicos</h4>
              {expandedSections.basic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {expandedSections.basic && (
              <div className="filter-section-content">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Categoría</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">Todas las categorías</option>
                      {availableFilters.categories?.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Región</label>
                    <select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                    >
                      <option value="">Todas las regiones</option>
                      {availableFilters.regions?.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filter-row">
                  <div className="filter-group">
                    <label>Tipo</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <option value="">Todos los tipos</option>
                      {availableFilters.types?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Dificultad</label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    >
                      <option value="">Todas las dificultades</option>
                      {availableFilters.difficulties?.map(difficulty => (
                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filtros avanzados */}
          <div className="filter-section">
            <div
              className="filter-section-header"
              onClick={() => toggleSection('advanced')}
            >
              <h4>Filtros Avanzados</h4>
              {expandedSections.advanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {expandedSections.advanced && (
              <div className="filter-section-content">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>¿Es gratuita?</label>
                    <select
                      value={filters.isFree}
                      onChange={(e) => handleFilterChange('isFree', e.target.value)}
                    >
                      <option value="">Ambas</option>
                      <option value="true">Solo gratuitas</option>
                      <option value="false">Solo de pago</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>¿Requiere registro?</label>
                    <select
                      value={filters.requiresRegistration}
                      onChange={(e) => handleFilterChange('requiresRegistration', e.target.value)}
                    >
                      <option value="">Ambas</option>
                      <option value="false">Sin registro</option>
                      <option value="true">Con registro</option>
                    </select>
                  </div>
                </div>

                <div className="filter-row">
                  <div className="filter-group">
                    <label>Rating mínimo</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    >
                      <option value="">Cualquier rating</option>
                      <option value="4">4+ estrellas</option>
                      <option value="3">3+ estrellas</option>
                      <option value="2">2+ estrellas</option>
                      <option value="1">1+ estrellas</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      placeholder="Separar con comas"
                      value={filters.tags}
                      onChange={(e) => handleFilterChange('tags', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ordenamiento */}
          <div className="filter-section">
            <div
              className="filter-section-header"
              onClick={() => toggleSection('sorting')}
            >
              <h4>Ordenamiento</h4>
              {expandedSections.sorting ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {expandedSections.sorting && (
              <div className="filter-section-content">
                <div className="filter-group">
                  <label>Ordenar por</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="relevance">Relevancia</option>
                    <option value="name">Nombre</option>
                    <option value="rating">Rating</option>
                    <option value="popularity">Popularidad</option>
                    <option value="recent">Más recientes</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="advanced-search-footer">
          <div className="filter-summary">
            {getActiveFiltersCount() > 0 && (
              <span>{getActiveFiltersCount()} filtros activos</span>
            )}
          </div>
          
          <div className="search-actions">
            <button
              className="clear-filters-btn"
              onClick={handleClearFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              Limpiar filtros
            </button>
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedSearch