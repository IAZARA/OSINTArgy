import React, { useState, useEffect } from 'react'
import { 
  User, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Download,
  Copy,
  RefreshCw,
  Zap,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import './UsernameOSINT.css'

const UsernameOSINT = () => {
  const [username, setUsername] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [availableSites, setAvailableSites] = useState(null)
  const [error, setError] = useState(null)
  const [searchType, setSearchType] = useState('quick') // 'quick' o 'full'
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showOnlyFound, setShowOnlyFound] = useState(false)

  // Cargar sitios disponibles al montar el componente
  useEffect(() => {
    loadAvailableSites()
  }, [])

  const loadAvailableSites = async () => {
    try {
      const response = await fetch('/api/osint/username-sites')
      const data = await response.json()
      
      if (data.success) {
        setAvailableSites(data)
      }
    } catch (error) {
      console.error('Error cargando sitios disponibles:', error)
    }
  }

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9._-]+$/
    return usernameRegex.test(username) && username.length >= 1 && username.length <= 50
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      toast.error('Por favor ingresa un nombre de usuario')
      return
    }

    if (!validateUsername(username)) {
      toast.error('Nombre de usuario inválido. Use solo letras, números, puntos, guiones y guiones bajos.')
      return
    }

    setIsSearching(true)
    setError(null)
    setResults(null)

    try {
      const endpoint = searchType === 'quick' ? 'username-quick' : 'username-lookup'
      const response = await fetch(`/api/osint/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResults(data)
        const foundCount = searchType === 'quick' ? data.summary.found : data.statistics.sites_found
        toast.success(`Búsqueda completada. Encontrado en ${foundCount} sitios`)
      } else {
        setError(data.error || 'Error en la búsqueda')
        toast.error(data.error || 'Error en la búsqueda')
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setError('Error de conexión')
      toast.error('Error de conexión')
    } finally {
      setIsSearching(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const downloadResults = () => {
    if (!results) return

    const reportLines = [
      '='.repeat(60),
      '         REPORTE DE BÚSQUEDA DE NOMBRES DE USUARIO',
      '                    OSINTArgy v1.0',
      '='.repeat(60),
      '',
      `👤 NOMBRE DE USUARIO: ${results.username}`,
      `📅 FECHA DE BÚSQUEDA: ${new Date(results.search_timestamp).toLocaleString('es-AR')}`,
      `🔍 TIPO DE BÚSQUEDA: ${searchType === 'quick' ? 'Rápida' : 'Completa'}`,
      ''
    ]

    if (searchType === 'quick') {
      reportLines.push('📊 ESTADÍSTICAS (BÚSQUEDA RÁPIDA)')
      reportLines.push('-'.repeat(30))
      reportLines.push(`• Total de sitios verificados: ${results.summary.total_checked}`)
      reportLines.push(`• Sitios donde se encontró: ${results.summary.found}`)
      reportLines.push(`• Sitios encontrados: ${results.summary.found_sites.join(', ')}`)
      reportLines.push('')

      reportLines.push('🎯 RESULTADOS DETALLADOS')
      reportLines.push('-'.repeat(30))
      results.results.forEach((site, index) => {
        const status = site.found ? '✅ ENCONTRADO' : site.error ? '❌ ERROR' : '❌ NO ENCONTRADO'
        reportLines.push(`${index + 1}. ${site.site}`)
        reportLines.push(`   Estado: ${status}`)
        reportLines.push(`   Categoría: ${site.category}`)
        if (site.found && site.profile_url) {
          reportLines.push(`   URL: ${site.profile_url}`)
        }
        if (site.error) {
          reportLines.push(`   Error: ${site.error}`)
        }
        reportLines.push('')
      })
    } else {
      reportLines.push('📊 ESTADÍSTICAS COMPLETAS')
      reportLines.push('-'.repeat(30))
      reportLines.push(`• Total de sitios verificados: ${results.statistics.total_sites_checked}`)
      reportLines.push(`• Sitios donde se encontró: ${results.statistics.sites_found}`)
      reportLines.push(`• Tasa de éxito: ${results.statistics.success_rate}`)
      reportLines.push(`• Categorías encontradas: ${results.statistics.categories_found.join(', ')}`)
      reportLines.push('')

      if (results.statistics.top_tags && results.statistics.top_tags.length > 0) {
        reportLines.push('🏷️ TAGS MÁS COMUNES')
        reportLines.push('-'.repeat(20))
        results.statistics.top_tags.forEach(tag => {
          reportLines.push(`• ${tag.tag}: ${tag.count} sitios`)
        })
        reportLines.push('')
      }

      reportLines.push('📂 RESULTADOS POR CATEGORÍA')
      reportLines.push('-'.repeat(30))
      Object.entries(results.results_by_category).forEach(([categoryKey, categoryData]) => {
        reportLines.push(`\n${categoryData.category_info.name.toUpperCase()}`)
        reportLines.push('-'.repeat(categoryData.category_info.name.length))
        
        categoryData.sites.forEach(site => {
          const status = site.found ? '✅' : site.error ? '❌' : '❌'
          reportLines.push(`${status} ${site.site}${site.found ? ` - ${site.profile_url}` : ''}`)
        })
      })
    }

    if (results.found_profiles && results.found_profiles.length > 0) {
      reportLines.push('')
      reportLines.push('🔗 PERFILES ENCONTRADOS')
      reportLines.push('-'.repeat(30))
      results.found_profiles.forEach((profile, index) => {
        reportLines.push(`${index + 1}. ${profile.site}: ${profile.url}`)
      })
    }

    reportLines.push('')
    reportLines.push('='.repeat(60))
    reportLines.push('Reporte generado por OSINTArgy')
    reportLines.push('https://github.com/osintargy')
    reportLines.push('='.repeat(60))

    const reportText = reportLines.join('\n')
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `username-osint-${results.username}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Reporte TXT descargado')
  }

  const openAllFoundProfiles = () => {
    if (!results) return

    let profiles = []
    if (searchType === 'quick') {
      profiles = results.results.filter(site => site.found && site.profile_url)
    } else {
      profiles = results.found_profiles || []
    }

    profiles.forEach(profile => {
      const url = profile.profile_url || profile.url
      if (url) {
        window.open(url, '_blank')
      }
    })
    
    toast.success(`Abriendo ${profiles.length} perfiles en nuevas pestañas`)
  }

  const getSiteIcon = (site) => {
    if (site.found) {
      return <CheckCircle className="site-icon site-icon--found" size={20} />
    } else if (site.error) {
      return <AlertTriangle className="site-icon site-icon--error" size={20} />
    } else {
      return <XCircle className="site-icon site-icon--not-found" size={20} />
    }
  }

  const getCategoryColor = (category) => {
    if (availableSites?.categories?.[category]) {
      return availableSites.categories[category].color
    }
    return '#6b7280'
  }

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const getFilteredResults = () => {
    if (!results) return null

    if (searchType === 'quick') {
      let filtered = results.results
      if (showOnlyFound) {
        filtered = filtered.filter(site => site.found)
      }
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(site => selectedCategories.includes(site.category))
      }
      return filtered
    } else {
      // Para búsqueda completa, filtrar por categorías
      const filtered = {}
      Object.entries(results.results_by_category).forEach(([categoryKey, categoryData]) => {
        if (selectedCategories.length === 0 || selectedCategories.includes(categoryKey)) {
          let sites = categoryData.sites
          if (showOnlyFound) {
            sites = sites.filter(site => site.found)
          }
          if (sites.length > 0) {
            filtered[categoryKey] = { ...categoryData, sites }
          }
        }
      })
      return filtered
    }
  }

  return (
    <div className="username-osint">
      <div className="username-osint__container">
        {/* Header */}
        <div className="username-osint__header">
          <div className="username-osint__title">
            <User className="username-osint__icon" size={32} />
            <div>
              <h1>Búsqueda de Nombres de Usuario</h1>
              <p>Encuentra perfiles de usuario en múltiples plataformas sociales y sitios web</p>
            </div>
          </div>
        </div>

        {/* Formulario de búsqueda */}
        <div className="username-osint__search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <User className="search-input-icon" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nombre_usuario"
                className="search-input"
                disabled={isSearching}
                pattern="[a-zA-Z0-9._-]+"
                title="Solo letras, números, puntos, guiones y guiones bajos"
              />
              <div className="search-type-toggle">
                <button
                  type="button"
                  className={`search-type-btn ${searchType === 'quick' ? 'active' : ''}`}
                  onClick={() => setSearchType('quick')}
                  disabled={isSearching}
                >
                  <Zap size={16} />
                  Rápida
                </button>
                <button
                  type="button"
                  className={`search-type-btn ${searchType === 'full' ? 'active' : ''}`}
                  onClick={() => setSearchType('full')}
                  disabled={isSearching}
                >
                  <Search size={16} />
                  Completa
                </button>
              </div>
              <button
                type="submit"
                className="search-button"
                disabled={isSearching}
              >
                {isSearching ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Search size={20} />
                )}
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>

          <div className="search-info">
            <p>
              <strong>Búsqueda Rápida:</strong> Verifica 6 sitios principales (Instagram, GitHub, YouTube, Twitter, LinkedIn, Reddit)
            </p>
            <p>
              <strong>Búsqueda Completa:</strong> Verifica {availableSites?.total_sites || 20}+ sitios web organizados por categorías
            </p>
          </div>
        </div>

        {/* Información de sitios disponibles */}
        {availableSites && !results && (
          <div className="available-sites">
            <h3>Sitios Disponibles</h3>
            <div className="categories-overview">
              {Object.entries(availableSites.categories).map(([key, category]) => (
                <div key={key} className="category-overview" style={{ borderColor: category.color }}>
                  <div className="category-name" style={{ color: category.color }}>
                    {category.name}
                  </div>
                  <div className="category-count">{category.count} sitios</div>
                  <div className="category-description">{category.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isSearching && (
          <div className="username-osint__loading">
            <div className="loading-spinner">
              <RefreshCw className="animate-spin" size={32} />
            </div>
            <p>
              {searchType === 'quick' 
                ? 'Verificando nombre de usuario en sitios principales...' 
                : 'Verificando nombre de usuario en múltiples plataformas...'
              }
            </p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {results && (
          <div className="username-osint__results">
            {/* Estadísticas */}
            <div className="results-stats">
              <div className="stats-grid">
                {searchType === 'quick' ? (
                  <>
                    <div className="stat-card">
                      <div className="stat-value">{results.summary.found}</div>
                      <div className="stat-label">Perfiles encontrados</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{results.summary.total_checked}</div>
                      <div className="stat-label">Sitios verificados</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {((results.summary.found / results.summary.total_checked) * 100).toFixed(0)}%
                      </div>
                      <div className="stat-label">Tasa de éxito</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat-card">
                      <div className="stat-value">{results.statistics.sites_found}</div>
                      <div className="stat-label">Perfiles encontrados</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{results.statistics.total_sites_checked}</div>
                      <div className="stat-label">Sitios verificados</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{results.statistics.success_rate}</div>
                      <div className="stat-label">Tasa de éxito</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{results.statistics.categories_found.length}</div>
                      <div className="stat-label">Categorías encontradas</div>
                    </div>
                  </>
                )}
              </div>

              {/* Acciones */}
              <div className="results-actions">
                <button
                  onClick={openAllFoundProfiles}
                  className="action-button action-button--primary"
                  disabled={
                    searchType === 'quick' 
                      ? results.summary.found === 0
                      : results.statistics.sites_found === 0
                  }
                >
                  <ExternalLink size={16} />
                  Abrir todos los perfiles
                </button>
                <button
                  onClick={downloadResults}
                  className="action-button action-button--secondary"
                >
                  <Download size={16} />
                  Descargar reporte
                </button>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                  className="action-button action-button--secondary"
                >
                  <Copy size={16} />
                  Copiar resultados
                </button>
              </div>
            </div>

            {/* Filtros */}
            {searchType === 'full' && availableSites && (
              <div className="results-filters">
                <div className="filter-section">
                  <h4>
                    <Filter size={16} />
                    Filtros
                  </h4>
                  <div className="filter-controls">
                    <button
                      onClick={() => setShowOnlyFound(!showOnlyFound)}
                      className={`filter-toggle ${showOnlyFound ? 'active' : ''}`}
                    >
                      {showOnlyFound ? <Eye size={16} /> : <EyeOff size={16} />}
                      {showOnlyFound ? 'Mostrar todos' : 'Solo encontrados'}
                    </button>
                  </div>
                </div>
                
                <div className="category-filters">
                  <h5>Categorías:</h5>
                  <div className="category-buttons">
                    {Object.entries(availableSites.categories).map(([key, category]) => (
                      <button
                        key={key}
                        onClick={() => toggleCategory(key)}
                        className={`category-filter ${selectedCategories.includes(key) ? 'active' : ''}`}
                        style={{ 
                          borderColor: category.color,
                          backgroundColor: selectedCategories.includes(key) ? category.color : 'transparent',
                          color: selectedCategories.includes(key) ? 'white' : category.color
                        }}
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Resultados por sitio/categoría */}
            <div className="sites-results">
              {searchType === 'quick' ? (
                <>
                  <h3>Resultados de Búsqueda Rápida</h3>
                  <div className="sites-grid">
                    {getFilteredResults()?.map((site, index) => (
                      <div
                        key={index}
                        className={`site-card ${site.found ? 'site-card--found' : ''}`}
                      >
                        <div className="site-card__header">
                          <div className="site-info">
                            {site.logo && (
                              <img
                                src={site.logo}
                                alt={site.site}
                                className="site-logo"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            )}
                            <div className="site-details">
                              <div className="site-name">{site.site}</div>
                              <div 
                                className="site-category"
                                style={{ color: getCategoryColor(site.category) }}
                              >
                                {site.category}
                              </div>
                            </div>
                          </div>
                          {getSiteIcon(site)}
                        </div>

                        {site.found && site.profile_url && (
                          <div className="site-card__actions">
                            <a
                              href={site.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="site-link"
                            >
                              <ExternalLink size={14} />
                              Ver perfil
                            </a>
                          </div>
                        )}

                        {site.error && (
                          <div className="site-error">
                            <AlertTriangle size={14} />
                            {site.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3>Resultados por Categoría</h3>
                  {Object.entries(getFilteredResults() || {}).map(([categoryKey, categoryData]) => (
                    <div key={categoryKey} className="category-section">
                      <div className="category-header">
                        <h4 style={{ color: categoryData.category_info.color }}>
                          {categoryData.category_info.name}
                        </h4>
                        <span className="category-count">
                          {categoryData.sites.filter(s => s.found).length} de {categoryData.sites.length} encontrados
                        </span>
                      </div>
                      <div className="sites-grid">
                        {categoryData.sites.map((site, index) => (
                          <div
                            key={index}
                            className={`site-card ${site.found ? 'site-card--found' : ''}`}
                          >
                            <div className="site-card__header">
                              <div className="site-info">
                                {site.logo && (
                                  <img
                                    src={site.logo}
                                    alt={site.site}
                                    className="site-logo"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                )}
                                <div className="site-details">
                                  <div className="site-name">{site.site}</div>
                                  {site.tags && (
                                    <div className="site-tags">
                                      {site.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="site-tag">{tag}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {getSiteIcon(site)}
                            </div>

                            {site.found && site.profile_url && (
                              <div className="site-card__actions">
                                <a
                                  href={site.profile_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="site-link"
                                >
                                  <ExternalLink size={14} />
                                  Ver perfil
                                </a>
                              </div>
                            )}

                            {site.error && (
                              <div className="site-error">
                                <AlertTriangle size={14} />
                                {site.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="username-osint__error">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsernameOSINT
