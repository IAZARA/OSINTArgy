import React, { useState } from 'react'
import { 
  ExternalLink, 
  Star, 
  Eye, 
  Heart, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor, 
  Code, 
  Puzzle,
  DollarSign,
  Lock,
  Unlock,
  Info
} from 'lucide-react'

const ToolCard = ({ tool, viewMode = 'grid', onFavorite, isFavorite = false }) => {
  const [showDetails, setShowDetails] = useState(false)

  const getTypeIcon = (type) => {
    switch (type) {
      case 'web': return <Globe size={14} />
      case 'mobile': return <Smartphone size={14} />
      case 'desktop': return <Monitor size={14} />
      case 'api': return <Code size={14} />
      case 'browser-extension': return <Puzzle size={14} />
      default: return <Globe size={14} />
    }
  }

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return '#4CAF50'
      case 'intermediate': return '#FF9800'
      case 'advanced': return '#F44336'
      case 'expert': return '#9C27B0'
      default: return '#9E9E9E'
    }
  }

  const getRegionFlag = (region) => {
    switch (region) {
      case 'argentina': return '🇦🇷'
      case 'latam': return '🌎'
      case 'europa': return '🇪🇺'
      case 'norteamerica': return '🇺🇸'
      case 'asia': return '🌏'
      default: return '🌍'
    }
  }

  const handleVisit = () => {
    // Registrar visita
    if (tool.id) {
      // Aquí se haría la llamada a la API para registrar la visita
      console.log('Registrando visita a:', tool.id)
    }
    
    // Abrir en nueva pestaña
    window.open(tool.url, '_blank', 'noopener,noreferrer')
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    onFavorite?.(tool)
  }

  if (viewMode === 'list') {
    return (
      <div className="tool-card list-view">
        <div className="tool-main">
          <div className="tool-header">
            <h3 className="tool-name">{tool.name}</h3>
            <div className="tool-badges">
              <span className="type-badge">
                {getTypeIcon(tool.type)}
                {tool.type}
              </span>
              <span className="region-badge">
                {getRegionFlag(tool.region)}
                {tool.region}
              </span>
              {!tool.is_free && (
                <span className="price-badge">
                  <DollarSign size={12} />
                  Pago
                </span>
              )}
            </div>
          </div>

          <p className="tool-description">{tool.description}</p>

          <div className="tool-meta">
            <div className="tool-stats">
              <span className="stat">
                <Star size={14} fill="currentColor" />
                {tool.rating || 0}
              </span>
              <span className="stat">
                <Eye size={14} />
                {tool.usage_count || 0}
              </span>
              <span className="stat">
                <Users size={14} />
                {tool.difficulty_level}
              </span>
            </div>

            <div className="tool-tags">
              {tool.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavorite}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          
          <button
            className="visit-btn"
            onClick={handleVisit}
            title="Visitar herramienta"
          >
            <ExternalLink size={18} />
            Visitar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="tool-card grid-view">
      <div className="tool-header">
        <div className="tool-title">
          <h3 className="tool-name">{tool.name}</h3>
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavorite}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="tool-rating">
          <Star size={14} fill="currentColor" />
          <span>{tool.rating || 0}</span>
        </div>
      </div>

      <div className="tool-content">
        <p className="tool-description">{tool.description}</p>
        
        <div className="tool-utility">
          <strong>Utilidad:</strong> {tool.utility}
        </div>

        <div className="tool-badges">
          <span className="type-badge">
            {getTypeIcon(tool.type)}
            {tool.type}
          </span>
          
          <span className="region-badge">
            {getRegionFlag(tool.region)}
          </span>

          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(tool.difficulty_level) }}
          >
            {tool.difficulty_level}
          </span>

          {tool.requires_registration && (
            <span className="registration-badge">
              <Lock size={12} />
              Registro
            </span>
          )}

          {!tool.is_free && (
            <span className="price-badge">
              <DollarSign size={12} />
              Pago
            </span>
          )}
        </div>

        {tool.tags && tool.tags.length > 0 && (
          <div className="tool-tags">
            {tool.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            {tool.tags.length > 4 && (
              <span className="tag more">+{tool.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <div className="tool-footer">
        <div className="tool-stats">
          <span className="stat" title="Veces usado">
            <Eye size={14} />
            {tool.usage_count || 0}
          </span>
          <span className="stat" title="Usuarios">
            <Users size={14} />
            {Math.floor((tool.usage_count || 0) / 10)}
          </span>
        </div>

        <div className="tool-actions">
          <button
            className="details-btn"
            onClick={() => setShowDetails(!showDetails)}
            title="Ver más detalles"
          >
            <Info size={16} />
          </button>
          
          <button
            className="visit-btn"
            onClick={handleVisit}
            title="Visitar herramienta"
          >
            <ExternalLink size={16} />
            Visitar
          </button>
        </div>
      </div>

      {/* Panel de detalles expandible */}
      {showDetails && (
        <div className="tool-details">
          <div className="details-section">
            <h4>Información adicional</h4>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Idioma:</span>
                <span className="detail-value">{tool.language}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Última actualización:</span>
                <span className="detail-value">
                  {tool.last_updated ? new Date(tool.last_updated).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado:</span>
                <span className={`detail-value status-${tool.status}`}>
                  {tool.status}
                </span>
              </div>
            </div>
          </div>

          {tool.indicators && tool.indicators.length > 0 && (
            <div className="details-section">
              <h4>Indicadores OSINT</h4>
              <div className="indicators">
                {tool.indicators.map(indicator => (
                  <span key={indicator} className="indicator" title={getIndicatorTitle(indicator)}>
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper function para títulos de indicadores
const getIndicatorTitle = (indicator) => {
  switch (indicator) {
    case 'D': return 'Datos'
    case 'R': return 'Registros'
    case 'F': return 'Forense'
    case 'P': return 'Personas'
    case 'A': return 'Análisis'
    default: return indicator
  }
}

export default ToolCard