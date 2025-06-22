import React, { useState, useMemo } from 'react'
import { Search, Filter, Grid, List, Star, ExternalLink, Eye, Users } from 'lucide-react'
import CategoryCard from './CategoryCard'
import ToolCard from './ToolCard'
import './CardsView.css'

const CardsView = ({ 
  tools = [], 
  categories = [], 
  onCategorySelect, 
  selectedCategory, 
  searchQuery 
}) => {
  const [viewMode, setViewMode] = useState('grid') // 'grid' o 'list'
  const [sortBy, setSortBy] = useState('rating') // 'rating', 'name', 'usage', 'recent'
  const [filterBy, setFilterBy] = useState({
    region: 'all',
    difficulty: 'all',
    type: 'all',
    isFree: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Filtrar y ordenar herramientas
  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools

    // Aplicar filtros
    if (filterBy.region !== 'all') {
      filtered = filtered.filter(tool => tool.region === filterBy.region)
    }
    if (filterBy.difficulty !== 'all') {
      filtered = filtered.filter(tool => tool.difficulty_level === filterBy.difficulty)
    }
    if (filterBy.type !== 'all') {
      filtered = filtered.filter(tool => tool.type === filterBy.type)
    }
    if (filterBy.isFree !== 'all') {
      filtered = filtered.filter(tool => tool.is_free === (filterBy.isFree === 'true'))
    }

    // Aplicar búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'usage':
          return (b.usage_count || 0) - (a.usage_count || 0)
        case 'recent':
          return new Date(b.last_updated || 0) - new Date(a.last_updated || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [tools, filterBy, searchQuery, sortBy])

  // Filtrar categorías basado en búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories

    const query = searchQuery.toLowerCase()
    return categories.filter(category =>
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      tools.some(tool => 
        tool.category === category.id && (
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
        )
      )
    )
  }, [categories, searchQuery, tools])

  const handleFilterChange = (key, value) => {
    setFilterBy(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilterBy({
      region: 'all',
      difficulty: 'all',
      type: 'all',
      isFree: 'all'
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filterBy).filter(value => value !== 'all').length
  }

  return (
    <div className="cards-view">
      {/* Header con controles */}
      <div className="cards-header">
        <div className="cards-title">
          <h2>
            {selectedCategory ? selectedCategory.name : 'Todas las Categorías'}
          </h2>
          <span className="results-count">
            {selectedCategory 
              ? `${filteredAndSortedTools.length} herramientas`
              : `${filteredCategories.length} categorías`
            }
          </span>
        </div>

        <div className="cards-controls">
          {/* Toggle de vista */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista en cuadrícula"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista en lista"
            >
              <List size={18} />
            </button>
          </div>

          {/* Filtros */}
          <button
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros"
          >
            <Filter size={18} />
            {getActiveFiltersCount() > 0 && (
              <span className="filter-count">{getActiveFiltersCount()}</span>
            )}
          </button>

          {/* Ordenamiento */}
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Mejor valoradas</option>
            <option value="name">Nombre A-Z</option>
            <option value="usage">Más usadas</option>
            <option value="recent">Más recientes</option>
          </select>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Región</label>
              <select
                value={filterBy.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="internacional">Internacional</option>
                <option value="argentina">Argentina</option>
                <option value="latam">LATAM</option>
                <option value="europa">Europa</option>
                <option value="norteamerica">Norteamérica</option>
                <option value="asia">Asia</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Dificultad</label>
              <select
                value={filterBy.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
                <option value="expert">Experto</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tipo</label>
              <select
                value={filterBy.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="web">Web</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="api">API</option>
                <option value="browser-extension">Extensión</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Precio</label>
              <select
                value={filterBy.isFree}
                onChange={(e) => handleFilterChange('isFree', e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="true">Gratuitas</option>
                <option value="false">De pago</option>
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="cards-content">
        {!selectedCategory ? (
          // Vista de categorías
          <div className={`categories-grid ${viewMode}`}>
            {filteredCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                toolsCount={tools.filter(tool => tool.category === category.id).length}
                onClick={() => onCategorySelect?.(category)}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          // Vista de herramientas
          <div className={`tools-grid ${viewMode}`}>
            {filteredAndSortedTools.length > 0 ? (
              filteredAndSortedTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  viewMode={viewMode}
                />
              ))
            ) : (
              <div className="no-results">
                <Search size={48} />
                <h3>No se encontraron herramientas</h3>
                <p>
                  {searchQuery 
                    ? `No hay herramientas que coincidan con "${searchQuery}"`
                    : 'No hay herramientas que coincidan con los filtros seleccionados'
                  }
                </p>
                {getActiveFiltersCount() > 0 && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón para volver a categorías */}
      {selectedCategory && (
        <button
          className="back-to-categories"
          onClick={() => onCategorySelect?.(null)}
        >
          ← Volver a categorías
        </button>
      )}
    </div>
  )
}

export default CardsView