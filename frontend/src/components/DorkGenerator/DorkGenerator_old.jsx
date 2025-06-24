import React, { useState, useEffect } from 'react'
import DorkService from '../../services/dorkService.js'
import './DorkGenerator.css'

const DorkGenerator = () => {
  // Estados principales
  const [query, setQuery] = useState('')
  const [targetType, setTargetType] = useState('usernames')
  const [selectedEngines, setSelectedEngines] = useState(['google', 'yandex'])
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Estados para opciones avanzadas
  const [includeTerms, setIncludeTerms] = useState([])
  const [excludeTerms, setExcludeTerms] = useState([])
  const [includeInput, setIncludeInput] = useState('')
  const [excludeInput, setExcludeInput] = useState('')
  const [dateAfter, setDateAfter] = useState('')
  const [dateBefore, setDateBefore] = useState('')
  
  // Estados de la aplicación
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [targetTypes, setTargetTypes] = useState([])
  const [searchEngines, setSearchEngines] = useState([])
  const [copiedItems, setCopiedItems] = useState(new Set())

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [targetTypesData, searchEnginesData] = await Promise.all([
        DorkService.getTargetTypes(),
        DorkService.getSearchEngines()
      ])
      
      setTargetTypes(targetTypesData.targetTypes || [])
      setSearchEngines(searchEnginesData.searchEngines || [])
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
      setError('Error cargando la configuración inicial')
    }
  }

  // Manejar cambios en los motores de búsqueda
  const handleEngineChange = (engineId) => {
    setSelectedEngines(prev => {
      if (prev.includes(engineId)) {
        return prev.filter(id => id !== engineId)
      } else {
        return [...prev, engineId]
      }
    })
  }

  // Añadir término a incluir
  const addIncludeTerm = () => {
    if (includeInput.trim() && !includeTerms.includes(includeInput.trim())) {
      setIncludeTerms(prev => [...prev, includeInput.trim()])
      setIncludeInput('')
    }
  }

  // Añadir término a excluir
  const addExcludeTerm = () => {
    if (excludeInput.trim() && !excludeTerms.includes(excludeInput.trim())) {
      setExcludeTerms(prev => [...prev, excludeInput.trim()])
      setExcludeInput('')
    }
  }

  // Remover término
  const removeTerm = (term, type) => {
    if (type === 'include') {
      setIncludeTerms(prev => prev.filter(t => t !== term))
    } else {
      setExcludeTerms(prev => prev.filter(t => t !== term))
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setError('Por favor ingresa un término de búsqueda')
      return
    }

    if (selectedEngines.length === 0) {
      setError('Por favor selecciona al menos un motor de búsqueda')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const params = {
        query: query.trim(),
        targetType,
        engines: selectedEngines,
        options: {
          includeTerms: includeTerms.length > 0 ? includeTerms : undefined,
          excludeTerms: excludeTerms.length > 0 ? excludeTerms : undefined,
          dateAfter: dateAfter || undefined,
          dateBefore: dateBefore || undefined
        }
      }

      // Validar parámetros
      const validation = DorkService.validateParams(params)
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
        return
      }

      const response = await DorkService.generateDorks(params)
      setResults(response)
    } catch (error) {
      setError(error.message || 'Error generando los dorks')
    } finally {
      setLoading(false)
    }
  }

  // Abrir URL
  const openUrl = (url) => {
    DorkService.openUrl(url)
  }

  // Copiar al portapapeles
  const copyToClipboard = async (text, itemId) => {
    try {
      const success = await DorkService.copyToClipboard(text)
      if (success) {
        setCopiedItems(prev => new Set([...prev, itemId]))
        setTimeout(() => {
          setCopiedItems(prev => {
            const newSet = new Set(prev)
            newSet.delete(itemId)
            return newSet
          })
        }, 2000)
      }
    } catch (error) {
      console.error('Error copiando:', error)
    }
  }

  // Copiar todas las URLs
  const copyAllUrls = async () => {
    if (!results) return
    
    let allUrls = []
    Object.values(results.results).forEach(engineResults => {
      engineResults.forEach(item => {
        allUrls.push(item.url)
      })
    })
    
    const text = allUrls.join('\n')
    await copyToClipboard(text, 'all-urls')
  }

  // Exportar resultados
  const exportResults = () => {
    if (!results) return
    
    try {
      DorkService.exportResults(results.results, results.query)
    } catch (error) {
      setError('Error exportando los resultados')
    }
  }

  // Limpiar formulario
  const clearForm = () => {
    setQuery('')
    setIncludeTerms([])
    setExcludeTerms([])
    setIncludeInput('')
    setExcludeInput('')
    setDateAfter('')
    setDateBefore('')
    setResults(null)
    setError('')
  }

  return (
    <div className="dork-generator">
      <div className="dork-generator__header">
        <h1 className="dork-generator__title">🔍 Generador de Dorks</h1>
        <p className="dork-generator__subtitle">
          Genera consultas avanzadas para Google y Yandex basadas en tu término de búsqueda
        </p>
      </div>

      <form className="dork-generator__form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="query">Término de búsqueda *</label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: john.doe, ejemplo@email.com, sitio.com"
            maxLength={200}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="targetType">Tipo de objetivo</label>
            <select
              id="targetType"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
            >
              {targetTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="engines-group">
            <label>Motores de búsqueda *</label>
            <div className="engines-checkboxes">
              {searchEngines.map(engine => (
                <div key={engine.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={engine.id}
                    checked={selectedEngines.includes(engine.id)}
                    onChange={() => handleEngineChange(engine.id)}
                  />
                  <label htmlFor={engine.id}>{engine.name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="advanced-options">
          <div 
            className="advanced-options__header"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? '▼' : '▶'}</span>
            <h3 className="advanced-options__title">Opciones Avanzadas</h3>
          </div>

          {showAdvanced && (
            <div className="advanced-options__content">
              <div className="form-group">
                <label>Términos a incluir</label>
                <div className="terms-input">
                  <input
                    type="text"
                    value={includeInput}
                    onChange={(e) => setIncludeInput(e.target.value)}
                    placeholder="Término adicional a incluir"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludeTerm())}
                  />
                  <button type="button" className="btn-add-term" onClick={addIncludeTerm}>
                    Añadir
                  </button>
                </div>
                {includeTerms.length > 0 && (
                  <div className="terms-list">
                    {includeTerms.map(term => (
                      <div key={term} className="term-tag">
                        <span>{term}</span>
                        <button type="button" onClick={() => removeTerm(term, 'include')}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Términos a excluir</label>
                <div className="terms-input">
                  <input
                    type="text"
                    value={excludeInput}
                    onChange={(e) => setExcludeInput(e.target.value)}
                    placeholder="Término a excluir de los resultados"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludeTerm())}
                  />
                  <button type="button" className="btn-add-term" onClick={addExcludeTerm}>
                    Añadir
                  </button>
                </div>
                {excludeTerms.length > 0 && (
                  <div className="terms-list">
                    {excludeTerms.map(term => (
                      <div key={term} className="term-tag">
                        <span>{term}</span>
                        <button type="button" onClick={() => removeTerm(term, 'exclude')}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateAfter">Fecha después de</label>
                  <input
                    type="date"
                    id="dateAfter"
                    value={dateAfter}
                    onChange={(e) => setDateAfter(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateBefore">Fecha antes de</label>
                  <input
                    type="date"
                    id="dateBefore"
                    value={dateBefore}
                    onChange={(e) => setDateBefore(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            type="submit"
            className="btn-generate"
            disabled={loading || !query.trim() || selectedEngines.length === 0}
          >
            {loading ? 'Generando...' : 'Generar Dorks'}
          </button>
          
          <button
            type="button"
            className="btn-generate"
            onClick={clearForm}
            style={{ background: 'var(--text-secondary)' }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Generando dorks...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="results">
          <div className="results__header">
            <div>
              <h2 className="results__title">Resultados</h2>
              <div className="results__stats">
                {results.totalUrls} dorks generados para "{results.query}"
              </div>
            </div>
            <div className="results__actions">
              <button className="btn-copy-all" onClick={copyAllUrls}>
                {copiedItems.has('all-urls') ? '✓ Copiado' : 'Copiar Todas'}
              </button>
              <button className="btn-export" onClick={exportResults}>
                📥 Exportar
              </button>
            </div>
          </div>

          {Object.entries(results.results).map(([engine, urls]) => (
            <div key={engine} className="engine-results">
              <div className="engine-results__header">
                <h3 className="engine-results__title">{engine}</h3>
                <span className="engine-results__count">{urls.length} dorks</span>
              </div>

              <div className="dork-list">
                {urls.map((item, index) => {
                  const itemId = `${engine}-${index}`
                  return (
                    <div key={index} className="dork-item">
                      <div className="dork-item__query">{item.query}</div>
                      <div className="dork-item__actions">
                        <button
                          className="btn-open"
                          onClick={() => openUrl(item.url)}
                        >
                          🔗 Abrir
                        </button>
                        <button
                          className={`btn-copy ${copiedItems.has(itemId) ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(item.url, itemId)}
                        >
                          {copiedItems.has(itemId) ? '✓ Copiado' : '📋 Copiar'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!results && !loading && !error && (
        <div className="empty-state">
          <div className="empty-state__icon">🎯</div>
          <h3 className="empty-state__title">¡Comienza tu búsqueda OSINT!</h3>
          <p className="empty-state__description">
            Ingresa un término de búsqueda y genera dorks personalizados para tus investigaciones
          </p>
        </div>
      )}
    </div>
  )
}

export default DorkGenerator