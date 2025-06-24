import React, { useState, useEffect } from 'react'
import { 
  Mail, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield,
  ExternalLink,
  Download,
  Copy,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import './EmailOSINT.css'

const EmailOSINT = () => {
  const [email, setEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [availableSites, setAvailableSites] = useState([])
  const [error, setError] = useState(null)

  // Cargar sitios disponibles al montar el componente
  useEffect(() => {
    loadAvailableSites()
  }, [])

  const loadAvailableSites = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/osint/email-sites')
      const data = await response.json()

      if (data.success) {
        setAvailableSites(data.sites)
      }
    } catch (error) {
      console.error('Error cargando sitios disponibles:', error)
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Por favor ingresa un email')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Por favor ingresa un email válido')
      return
    }

    setIsSearching(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('http://localhost:3001/api/osint/email-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResults(data)
        toast.success(`Búsqueda completada. Encontrado en ${data.statistics.sites_found} sitios`)
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

    // Generar reporte en formato TXT
    const reportLines = [
      '='.repeat(60),
      '           REPORTE DE OSINT PARA CORREOS ELECTRÓNICOS',
      '                        OSINTArgy v1.0',
      '='.repeat(60),
      '',
      `📧 EMAIL ANALIZADO: ${results.email}`,
      `📅 FECHA DE BÚSQUEDA: ${new Date(results.search_timestamp).toLocaleString('es-AR')}`,
      `🔍 PREFIJO UTILIZADO: ${results.email_prefix}`,
      '',
      '📊 ESTADÍSTICAS GENERALES',
      '-'.repeat(30),
      `• Total de sitios verificados: ${results.statistics.total_sites_checked}`,
      `• Sitios donde se encontró: ${results.statistics.sites_found}`,
      `• Tasa de éxito: ${results.statistics.success_rate}`,
      `• Categorías encontradas: ${results.statistics.categories_found.join(', ')}`,
      '',
      '🎯 RESULTADOS POR SITIO',
      '-'.repeat(30)
    ]

    // Agregar resultados de cada sitio
    results.site_results.forEach((site, index) => {
      const status = site.found ? '✅ ENCONTRADO' : site.error ? '❌ ERROR' : '❌ NO ENCONTRADO'
      reportLines.push(`${index + 1}. ${site.site}`)
      reportLines.push(`   Estado: ${status}`)
      reportLines.push(`   Categoría: ${site.category}`)
      if (site.found && site.url) {
        reportLines.push(`   URL: ${site.url}`)
      }
      if (site.error) {
        reportLines.push(`   Error: ${site.error}`)
      }
      reportLines.push(`   Verificado: ${new Date(site.checked_at).toLocaleString('es-AR')}`)
      reportLines.push('')
    })

    // Agregar información de brechas de datos
    reportLines.push('🛡️ ANÁLISIS DE BRECHAS DE DATOS')
    reportLines.push('-'.repeat(30))

    if (results.breach_data.error) {
      reportLines.push(`❌ Error: ${results.breach_data.error}`)
    } else if (results.breach_data.found && results.breach_data.breaches.length > 0) {
      reportLines.push(`⚠️  ATENCIÓN: Email encontrado en ${results.breach_data.breaches.length} brecha(s) de datos`)
      reportLines.push('')

      results.breach_data.breaches.forEach((breach, index) => {
        reportLines.push(`${index + 1}. ${breach.title}`)
        reportLines.push(`   Fecha de la brecha: ${breach.breach_date}`)
        reportLines.push(`   Dominio: ${breach.domain}`)
        reportLines.push(`   Cuentas afectadas: ${breach.pwn_count?.toLocaleString() || 'N/A'}`)
        reportLines.push(`   Datos comprometidos: ${breach.data_classes?.join(', ') || 'N/A'}`)
        reportLines.push(`   Verificada: ${breach.is_verified ? 'Sí' : 'No'}`)
        reportLines.push(`   Descripción: ${breach.description}`)
        reportLines.push('')
      })
    } else {
      reportLines.push('✅ Buenas noticias: Email no encontrado en brechas de datos conocidas')
    }

    // Agregar resumen final
    reportLines.push('')
    reportLines.push('📋 RESUMEN EJECUTIVO')
    reportLines.push('-'.repeat(30))
    reportLines.push(`• Presencia en sitios web: ${results.summary.found_on_sites ? 'SÍ' : 'NO'}`)
    reportLines.push(`• Expuesto en brechas: ${results.summary.found_in_breaches ? 'SÍ' : 'NO'}`)
    reportLines.push(`• Total de brechas: ${results.summary.total_breaches}`)

    if (results.statistics.sites_found > 0) {
      reportLines.push('')
      reportLines.push('🔗 ENLACES ENCONTRADOS')
      reportLines.push('-'.repeat(30))
      results.site_results
        .filter(site => site.found && site.url)
        .forEach((site, index) => {
          reportLines.push(`${index + 1}. ${site.site}: ${site.url}`)
        })
    }

    reportLines.push('')
    reportLines.push('='.repeat(60))
    reportLines.push('Reporte generado por OSINTArgy')
    reportLines.push('https://github.com/osintargy')
    reportLines.push('='.repeat(60))

    // Crear y descargar archivo TXT
    const reportText = reportLines.join('\n')
    const blob = new Blob([reportText], {
      type: 'text/plain;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-osint-${results.email}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Reporte TXT descargado')
  }

  const openAllFoundSites = () => {
    if (!results) return

    const foundSites = results.site_results.filter(site => site.found && site.url)
    foundSites.forEach(site => {
      window.open(site.url, '_blank')
    })
    
    toast.success(`Abriendo ${foundSites.length} sitios en nuevas pestañas`)
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
    const colors = {
      social_media: '#3b82f6',
      professional: '#059669',
      development: '#7c3aed',
      messaging: '#dc2626',
      default: '#6b7280'
    }
    return colors[category] || colors.default
  }

  return (
    <div className="email-osint">
      <div className="email-osint__container">
        {/* Header */}
        <div className="email-osint__header">
          <div className="email-osint__title">
            <Mail className="email-osint__icon" size={32} />
            <div>
              <h1>OSINT para Correos Electrónicos</h1>
              <p>Verifica la presencia de un email en múltiples plataformas y brechas de datos</p>
            </div>
          </div>
        </div>

        {/* Formulario de búsqueda */}
        <div className="email-osint__search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <Mail className="search-input-icon" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="search-input"
                disabled={isSearching}
              />
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

          {availableSites.length > 0 && (
            <div className="search-info">
              <p>Se verificarán {availableSites.length} sitios web y bases de datos de brechas</p>
            </div>
          )}
        </div>

        {/* Resultados */}
        {results && (
          <div className="email-osint__results">
            {/* Estadísticas */}
            <div className="results-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{results.statistics.sites_found}</div>
                  <div className="stat-label">Sitios encontrados</div>
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
                  <div className="stat-value">{results.summary.total_breaches}</div>
                  <div className="stat-label">Brechas encontradas</div>
                </div>
              </div>

              {/* Acciones */}
              <div className="results-actions">
                <button
                  onClick={openAllFoundSites}
                  className="action-button action-button--primary"
                  disabled={results.statistics.sites_found === 0}
                >
                  <ExternalLink size={16} />
                  Abrir todos los sitios
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

            {/* Resultados de sitios */}
            <div className="sites-results">
              <h3>Resultados por sitio</h3>
              <div className="sites-grid">
                {results.site_results.map((site, index) => (
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

                    {site.found && site.url && (
                      <div className="site-card__actions">
                        <a
                          href={site.url}
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

            {/* Resultados de brechas */}
            {results.breach_data && (
              <div className="breach-results">
                <h3>
                  <Shield size={20} />
                  Brechas de datos
                </h3>
                
                {results.breach_data.found ? (
                  <div className="breach-found">
                    <div className="breach-alert">
                      <AlertTriangle className="breach-alert__icon" size={24} />
                      <div>
                        <strong>¡Atención!</strong> Este email fue encontrado en {results.breach_data.total_breaches} brecha(s) de datos.
                      </div>
                    </div>

                    <div className="breaches-list">
                      {results.breach_data.breaches.map((breach, index) => (
                        <div key={index} className="breach-card">
                          <div className="breach-header">
                            <h4>{breach.title}</h4>
                            <span className="breach-date">{breach.breach_date}</span>
                          </div>
                          <p className="breach-description">{breach.description}</p>
                          <div className="breach-details">
                            <div className="breach-stat">
                              <strong>Afectados:</strong> {breach.pwn_count?.toLocaleString()}
                            </div>
                            <div className="breach-stat">
                              <strong>Datos comprometidos:</strong> {breach.data_classes?.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="breach-safe">
                    <CheckCircle className="breach-safe__icon" size={24} />
                    <div>
                      <strong>¡Buenas noticias!</strong> Este email no fue encontrado en brechas de datos conocidas.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="email-osint__error">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {isSearching && (
          <div className="email-osint__loading">
            <div className="loading-spinner">
              <RefreshCw className="animate-spin" size={32} />
            </div>
            <p>Verificando email en múltiples plataformas...</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailOSINT
