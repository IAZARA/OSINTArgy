import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Globe,
  Server,
  Lock,
  Eye,
  Download,
  RefreshCw,
  ExternalLink,
  Activity,
  Database,
  Cloud,
  GitBranch,
  Zap,
  TrendingUp,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import './InfrastructureScanner.css'

const InfrastructureScanner = () => {
  const [domain, setDomain] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const validateDomain = (domain) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  const handleScan = async (e) => {
    e.preventDefault()
    
    if (!domain.trim()) {
      toast.error('Por favor ingresa un dominio')
      return
    }

    if (!validateDomain(domain.trim())) {
      toast.error('Por favor ingresa un dominio válido (ej: ejemplo.com)')
      return
    }

    setIsScanning(true)
    setError(null)
    setScanResult(null)

    try {
      const response = await fetch('/api/infrastructure-scanner/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setScanResult(data)
        toast.success('Escaneo de infraestructura completado')
      } else {
        setError(data.error || 'Error en el escaneo')
        toast.error(data.error || 'Error en el escaneo')
      }
    } catch (error) {
      console.error('Error en escaneo:', error)
      setError('Error de conexión')
      toast.error('Error de conexión con el servidor')
    } finally {
      setIsScanning(false)
    }
  }

  const downloadReport = () => {
    if (!scanResult) return

    const reportLines = [
      '='.repeat(80),
      '           REPORTE DE ESCANEO DE INFRAESTRUCTURA OSINT',
      '                        OSINTArgy v1.0',
      '='.repeat(80),
      '',
      `🎯 DOMINIO ESCANEADO: ${scanResult.domain}`,
      `📅 FECHA DE ESCANEO: ${new Date(scanResult.timestamp).toLocaleString('es-AR')}`,
      `🔒 PUNTUACIÓN DE RIESGO: ${scanResult.risk_score}/100`,
      `⚠️  ALERTAS GENERADAS: ${scanResult.alerts.length}`,
      '',
      '📊 RESUMEN EJECUTIVO',
      '-'.repeat(40),
      `• Subdominios encontrados: ${scanResult.discovery.subdomains?.length || 0}`,
      `• Tecnologías detectadas: ${scanResult.analysis.technologies?.length || 0}`,
      `• Score de seguridad SSL: ${scanResult.analysis.ssl_analysis?.score || 0}/100`,
      `• Score headers seguridad: ${scanResult.analysis.security_headers?.score || 0}/100`,
      `• Exposiciones detectadas: ${scanResult.analysis.data_exposures?.length || 0}`,
      '',
      '🔍 DESCUBRIMIENTO DE ASSETS',
      '-'.repeat(40)
    ]

    // Subdominios
    if (scanResult.discovery.subdomains?.length > 0) {
      reportLines.push('📍 SUBDOMINIOS ENCONTRADOS:')
      scanResult.discovery.subdomains.forEach((sub, index) => {
        reportLines.push(`${index + 1}. ${sub.subdomain} (${sub.discovered_via})`)
      })
      reportLines.push('')
    }

    // Certificados
    if (scanResult.discovery.certificates?.length > 0) {
      reportLines.push('📜 CERTIFICADOS SSL ENCONTRADOS:')
      scanResult.discovery.certificates.slice(0, 5).forEach((cert, index) => {
        reportLines.push(`${index + 1}. Emisor: ${cert.issuer}`)
        reportLines.push(`   Válido hasta: ${cert.not_after}`)
        reportLines.push('')
      })
    }

    // Tecnologías
    reportLines.push('💻 ANÁLISIS TECNOLÓGICO')
    reportLines.push('-'.repeat(40))
    if (scanResult.analysis.technologies?.length > 0) {
      scanResult.analysis.technologies.forEach((tech, index) => {
        reportLines.push(`${index + 1}. ${tech.name} (${tech.category}) - Confianza: ${tech.confidence}`)
      })
    } else {
      reportLines.push('No se detectaron tecnologías específicas')
    }
    reportLines.push('')

    // Alertas
    reportLines.push('🚨 ALERTAS DE SEGURIDAD')
    reportLines.push('-'.repeat(40))
    if (scanResult.alerts.length > 0) {
      scanResult.alerts.forEach((alert, index) => {
        const levelEmoji = alert.level === 'critical' ? '🔴' : alert.level === 'warning' ? '🟡' : '🔵'
        reportLines.push(`${index + 1}. ${levelEmoji} ${alert.level.toUpperCase()}: ${alert.message}`)
        reportLines.push(`   Recomendación: ${alert.recommendation}`)
        reportLines.push('')
      })
    } else {
      reportLines.push('✅ No se encontraron alertas críticas')
    }

    // Exposiciones
    if (scanResult.analysis.data_exposures?.length > 0) {
      reportLines.push('⚠️  EXPOSICIONES DE DATOS')
      reportLines.push('-'.repeat(40))
      scanResult.analysis.data_exposures.forEach((exp, index) => {
        reportLines.push(`${index + 1}. ${exp.path} (${exp.severity})`)
      })
      reportLines.push('')
    }

    reportLines.push('')
    reportLines.push('='.repeat(80))
    reportLines.push('Reporte generado por OSINTArgy - Infrastructure Scanner')
    reportLines.push('https://github.com/osintargy')
    reportLines.push('='.repeat(80))

    // Crear y descargar archivo
    const reportText = reportLines.join('\n')
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `infrastructure-scan-${scanResult.domain}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Reporte descargado exitosamente')
  }

  const getRiskLevelColor = (score) => {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    if (score >= 20) return 'low'
    return 'minimal'
  }

  const getRiskLevelText = (score) => {
    if (score >= 80) return 'Crítico'
    if (score >= 60) return 'Alto'
    if (score >= 40) return 'Medio'
    if (score >= 20) return 'Bajo'
    return 'Mínimo'
  }

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return <XCircle className="alert-icon critical" size={20} />
      case 'warning':
        return <AlertTriangle className="alert-icon warning" size={20} />
      case 'info':
        return <Info className="alert-icon info" size={20} />
      default:
        return <CheckCircle className="alert-icon success" size={20} />
    }
  }

  return (
    <div className="infrastructure-scanner">
      <div className="infrastructure-scanner__container">
        {/* Header */}
        <div className="infrastructure-scanner__header">
          <div className="infrastructure-scanner__title">
            <Shield className="infrastructure-scanner__icon" size={32} />
            <div>
              <h1>Scanner de Infraestructura OSINT</h1>
              <p>Análisis defensivo de superficie de ataque - Mapea tu huella digital desde la perspectiva de un atacante</p>
            </div>
          </div>
        </div>

        {/* Formulario de escaneo */}
        <div className="infrastructure-scanner__search">
          <form onSubmit={handleScan} className="scan-form">
            <div className="scan-input-group">
              <Globe className="scan-input-icon" size={20} />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="ejemplo.com"
                className="scan-input"
                disabled={isScanning}
              />
              <button
                type="submit"
                className="scan-button"
                disabled={isScanning}
              >
                {isScanning ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Search size={20} />
                )}
                {isScanning ? 'Escaneando...' : 'Iniciar Escaneo'}
              </button>
            </div>
          </form>

          <div className="scan-info">
            <p>
              <strong>¿Qué hace este escaneo?</strong> Descubre subdominios, tecnologías, 
              configuraciones de seguridad y posibles exposiciones de tu infraestructura.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isScanning && (
          <div className="infrastructure-scanner__loading">
            <div className="loading-spinner">
              <RefreshCw className="animate-spin" size={32} />
            </div>
            <h3>Escaneando infraestructura...</h3>
            <div className="loading-steps">
              <div className="loading-step">
                <Server size={16} />
                <span>Descubriendo assets</span>
              </div>
              <div className="loading-step">
                <Lock size={16} />
                <span>Analizando seguridad</span>
              </div>
              <div className="loading-step">
                <Eye size={16} />
                <span>Detectando exposiciones</span>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {scanResult && (
          <div className="infrastructure-scanner__results">
            {/* Dashboard de riesgo */}
            <div className="risk-dashboard">
              <div className="risk-score">
                <div className={`risk-circle ${getRiskLevelColor(scanResult.risk_score)}`}>
                  <span className="risk-number">{scanResult.risk_score}</span>
                  <span className="risk-label">RIESGO</span>
                </div>
                <div className="risk-details">
                  <h3>Nivel de Riesgo: {getRiskLevelText(scanResult.risk_score)}</h3>
                  <p>Puntuación basada en configuración SSL, headers de seguridad, exposiciones y superficie de ataque</p>
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-item">
                  <Globe size={24} />
                  <div>
                    <span className="stat-value">{scanResult.discovery.subdomains?.length || 0}</span>
                    <span className="stat-label">Subdominios</span>
                  </div>
                </div>
                <div className="stat-item">
                  <Server size={24} />
                  <div>
                    <span className="stat-value">{scanResult.analysis.technologies?.length || 0}</span>
                    <span className="stat-label">Tecnologías</span>
                  </div>
                </div>
                <div className="stat-item">
                  <AlertTriangle size={24} />
                  <div>
                    <span className="stat-value">{scanResult.alerts.length}</span>
                    <span className="stat-label">Alertas</span>
                  </div>
                </div>
                <div className="stat-item">
                  <Lock size={24} />
                  <div>
                    <span className="stat-value">{scanResult.analysis.ssl_analysis?.score || 0}</span>
                    <span className="stat-label">Score SSL</span>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={downloadReport}
                  className="action-button primary"
                >
                  <Download size={16} />
                  Descargar Reporte
                </button>
              </div>
            </div>

            {/* Tabs de navegación */}
            <div className="results-tabs">
              <button
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Activity size={16} />
                Resumen
              </button>
              <button
                className={`tab-button ${activeTab === 'discovery' ? 'active' : ''}`}
                onClick={() => setActiveTab('discovery')}
              >
                <Search size={16} />
                Descubrimiento
              </button>
              <button
                className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('analysis')}
              >
                <Shield size={16} />
                Análisis
              </button>
              <button
                className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
                onClick={() => setActiveTab('monitoring')}
              >
                <TrendingUp size={16} />
                Monitoreo
              </button>
            </div>

            {/* Contenido de tabs */}
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-content">
                  {/* Alertas */}
                  <div className="alerts-section">
                    <h3>
                      <AlertTriangle size={20} />
                      Alertas de Seguridad ({scanResult.alerts.length})
                    </h3>
                    {scanResult.alerts.length > 0 ? (
                      <div className="alerts-list">
                        {scanResult.alerts.map((alert, index) => (
                          <div key={index} className={`alert-card ${alert.level}`}>
                            <div className="alert-header">
                              {getAlertIcon(alert.level)}
                              <span className="alert-title">{alert.message}</span>
                              <span className={`alert-level ${alert.level}`}>
                                {alert.level.toUpperCase()}
                              </span>
                            </div>
                            <p className="alert-recommendation">
                              <strong>Recomendación:</strong> {alert.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-alerts">
                        <CheckCircle className="success-icon" size={48} />
                        <p>¡Excelente! No se encontraron alertas críticas de seguridad.</p>
                      </div>
                    )}
                  </div>

                  {/* Scores de seguridad */}
                  <div className="security-scores">
                    <h3>Puntuaciones de Seguridad</h3>
                    <div className="scores-grid">
                      <div className="score-card">
                        <Lock size={24} />
                        <div className="score-info">
                          <span className="score-title">SSL/TLS</span>
                          <span className="score-value">{scanResult.analysis.ssl_analysis?.score || 0}/100</span>
                        </div>
                      </div>
                      <div className="score-card">
                        <Shield size={24} />
                        <div className="score-info">
                          <span className="score-title">Headers Seguridad</span>
                          <span className="score-value">{scanResult.analysis.security_headers?.score || 0}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'discovery' && (
                <div className="discovery-content">
                  {/* Subdominios */}
                  <div className="discovery-section">
                    <h3>
                      <Globe size={20} />
                      Subdominios Encontrados ({scanResult.discovery.subdomains?.length || 0})
                    </h3>
                    {scanResult.discovery.subdomains?.length > 0 ? (
                      <div className="subdomains-grid">
                        {scanResult.discovery.subdomains.map((sub, index) => (
                          <div key={index} className="subdomain-card">
                            <div className="subdomain-name">{sub.subdomain}</div>
                            <div className="subdomain-meta">
                              <span className="discovery-method">{sub.discovered_via}</span>
                              <span className={`status ${sub.status}`}>{sub.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No se encontraron subdominios adicionales.</p>
                    )}
                  </div>

                  {/* Certificados */}
                  <div className="discovery-section">
                    <h3>
                      <Lock size={20} />
                      Certificados SSL ({scanResult.discovery.certificates?.length || 0})
                    </h3>
                    {scanResult.discovery.certificates?.length > 0 ? (
                      <div className="certificates-list">
                        {scanResult.discovery.certificates.slice(0, 5).map((cert, index) => (
                          <div key={index} className="certificate-card">
                            <div className="cert-header">
                              <strong>Emisor:</strong> {cert.issuer}
                            </div>
                            <div className="cert-details">
                              <span><strong>Válido hasta:</strong> {new Date(cert.not_after).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No se encontraron certificados adicionales.</p>
                    )}
                  </div>

                  {/* Cloud Assets */}
                  {scanResult.discovery.cloud_assets?.length > 0 && (
                    <div className="discovery-section">
                      <h3>
                        <Cloud size={20} />
                        Assets en la Nube ({scanResult.discovery.cloud_assets.length})
                      </h3>
                      <div className="cloud-assets-list">
                        {scanResult.discovery.cloud_assets.map((asset, index) => (
                          <div key={index} className="cloud-asset-card">
                            <div className="asset-provider">{asset.provider}</div>
                            <div className="asset-url">{asset.url}</div>
                            <div className={`asset-status ${asset.accessible ? 'accessible' : 'restricted'}`}>
                              {asset.accessible ? 'Accesible' : 'Restringido'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="analysis-content">
                  {/* Tecnologías */}
                  <div className="analysis-section">
                    <h3>
                      <Server size={20} />
                      Stack Tecnológico ({scanResult.analysis.technologies?.length || 0})
                    </h3>
                    {scanResult.analysis.technologies?.length > 0 ? (
                      <div className="technologies-grid">
                        {scanResult.analysis.technologies.map((tech, index) => (
                          <div key={index} className="technology-card">
                            <div className="tech-name">{tech.name}</div>
                            <div className="tech-meta">
                              <span className="tech-category">{tech.category}</span>
                              <span className={`tech-confidence ${tech.confidence}`}>
                                {tech.confidence}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No se detectaron tecnologías específicas.</p>
                    )}
                  </div>

                  {/* Exposiciones de datos */}
                  {scanResult.analysis.data_exposures?.length > 0 && (
                    <div className="analysis-section">
                      <h3>
                        <Eye size={20} />
                        Exposiciones de Datos ({scanResult.analysis.data_exposures.length})
                      </h3>
                      <div className="exposures-list">
                        {scanResult.analysis.data_exposures.map((exposure, index) => (
                          <div key={index} className={`exposure-card ${exposure.severity}`}>
                            <div className="exposure-path">{exposure.path}</div>
                            <div className="exposure-details">
                              <span className={`severity ${exposure.severity}`}>
                                {exposure.severity.toUpperCase()}
                              </span>
                              <span className="exposure-type">{exposure.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Headers de seguridad */}
                  <div className="analysis-section">
                    <h3>
                      <Shield size={20} />
                      Headers de Seguridad
                    </h3>
                    <div className="security-headers">
                      <div className="headers-score">
                        <span>Puntuación: {scanResult.analysis.security_headers?.score || 0}/100</span>
                      </div>
                      <div className="headers-list">
                        {Object.entries(scanResult.analysis.security_headers || {})
                          .filter(([key]) => key !== 'score' && key !== 'error')
                          .map(([header, present]) => (
                            <div key={header} className={`header-item ${present ? 'present' : 'missing'}`}>
                              {present ? <CheckCircle size={16} /> : <XCircle size={16} />}
                              <span>{header.replace(/_/g, '-')}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'monitoring' && (
                <div className="monitoring-content">
                  {/* Repositorios de código */}
                  {scanResult.monitoring.code_repositories?.length > 0 && (
                    <div className="monitoring-section">
                      <h3>
                        <GitBranch size={20} />
                        Repositorios de Código ({scanResult.monitoring.code_repositories.length})
                      </h3>
                      <div className="repositories-list">
                        {scanResult.monitoring.code_repositories.map((repo, index) => (
                          <div key={index} className="repository-card">
                            <div className="repo-info">
                              <span className="repo-platform">{repo.platform}</span>
                              <span className="repo-name">{repo.repository}</span>
                            </div>
                            <div className={`repo-severity ${repo.severity}`}>
                              {repo.severity.toUpperCase()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dominios similares */}
                  {scanResult.monitoring.phishing_domains?.length > 0 && (
                    <div className="monitoring-section">
                      <h3>
                        <Zap size={20} />
                        Dominios Similares Detectados ({scanResult.monitoring.phishing_domains.length})
                      </h3>
                      <div className="phishing-domains-list">
                        {scanResult.monitoring.phishing_domains.map((domain, index) => (
                          <div key={index} className="phishing-domain-card">
                            <div className="domain-name">{domain.domain}</div>
                            <div className="domain-meta">
                              <span className="similarity">Similitud: {Math.round(domain.similarity * 100)}%</span>
                              <span className={`risk-level ${domain.risk_level}`}>
                                {domain.risk_level.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Menciones en redes sociales */}
                  {scanResult.monitoring.social_mentions?.length > 0 && (
                    <div className="monitoring-section">
                      <h3>
                        <TrendingUp size={20} />
                        Menciones en Redes Sociales
                      </h3>
                      <div className="social-mentions-grid">
                        {scanResult.monitoring.social_mentions.map((mention, index) => (
                          <div key={index} className="social-mention-card">
                            <div className="platform-name">{mention.platform}</div>
                            <div className="mention-stats">
                              <span className="mention-count">{mention.mentions} menciones</span>
                              <span className={`sentiment ${mention.sentiment}`}>
                                {mention.sentiment}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="infrastructure-scanner__error">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default InfrastructureScanner