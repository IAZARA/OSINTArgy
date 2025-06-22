import React from 'react'
import { ChevronRight, Wrench } from 'lucide-react'

const CategoryCard = ({ category, toolsCount, onClick, viewMode = 'grid' }) => {
  const handleClick = () => {
    onClick?.(category)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  if (viewMode === 'list') {
    return (
      <div
        className="category-card list-view"
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        tabIndex={0}
        role="button"
        aria-label={`Ver herramientas de ${category.name}`}
      >
        <div className="category-icon" style={{ backgroundColor: category.color }}>
          <span className="icon-text">{category.icon?.charAt(0)?.toUpperCase() || '🔍'}</span>
        </div>
        
        <div className="category-info">
          <h3 className="category-name">{category.name}</h3>
          <p className="category-description">{category.description}</p>
          
          <div className="category-meta">
            <span className="tools-count">
              <Wrench size={14} />
              {toolsCount} herramientas
            </span>
            {category.subcategories && (
              <span className="subcategories-count">
                {category.subcategories.length} subcategorías
              </span>
            )}
          </div>
        </div>

        <div className="category-arrow">
          <ChevronRight size={20} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="category-card grid-view"
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Ver herramientas de ${category.name}`}
      style={{ '--category-color': category.color }}
    >
      <div className="category-header">
        <div className="category-icon" style={{ backgroundColor: category.color }}>
          <span className="icon-text">{category.icon?.charAt(0)?.toUpperCase() || '🔍'}</span>
        </div>
        
        <div className="category-badge">
          <span className="tools-count">{toolsCount}</span>
          <span className="tools-label">herramientas</span>
        </div>
      </div>

      <div className="category-content">
        <h3 className="category-name">{category.name}</h3>
        <p className="category-description">{category.description}</p>
      </div>

      <div className="category-footer">
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="subcategories-preview">
            <span className="subcategories-label">
              {category.subcategories.length} subcategorías:
            </span>
            <div className="subcategories-list">
              {category.subcategories.slice(0, 3).map((sub, index) => (
                <span key={sub.id} className="subcategory-tag">
                  {sub.name}
                </span>
              ))}
              {category.subcategories.length > 3 && (
                <span className="subcategory-more">
                  +{category.subcategories.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        <div className="category-action">
          <span className="action-text">Ver herramientas</span>
          <ChevronRight size={16} />
        </div>
      </div>

      {/* Efecto de hover */}
      <div className="category-overlay"></div>
    </div>
  )
}

export default CategoryCard