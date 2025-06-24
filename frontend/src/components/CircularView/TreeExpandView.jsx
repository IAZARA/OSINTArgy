import React, { useState } from 'react';
import './TreeExpandView.css';

const TreeExpandView = ({ tools = [], categories = [], onCategorySelect }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Manejar expansión/colapso de categorías
  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
    
    // Notificar al componente padre
    if (onCategorySelect) {
      const category = categories.find(cat => cat.id === categoryId);
      onCategorySelect(newExpanded.has(categoryId) ? category : null);
    }
  };

  // Manejar click en herramienta
  const handleToolClick = (tool) => {
    if (tool.url) {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="tree-expand-container">
      {/* Logo Central */}
      <div className="tree-logo-section">
        <div className="tree-logo">
          <img src="/favicon.png" alt="OSINTArgy" />
        </div>
        <h2 className="tree-title">OSINTArgy</h2>
        <p className="tree-subtitle">Plataforma OSINT Argentina</p>
      </div>

      {/* Lista de Categorías */}
      <div className="tree-categories-section">
        <h3 className="section-title">Categorías de Herramientas</h3>
        
        <div className="categories-grid">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const categoryTools = tools.filter(tool => tool.category === category.id);
            
            return (
              <div key={category.id} className="category-card">
                {/* Header de Categoría */}
                <div 
                  className={`category-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="category-info">
                    <div 
                      className="category-icon"
                      style={{ backgroundColor: category.color || '#1E5A8A' }}
                    >
                      {category.icon || '📁'}
                    </div>
                    <div className="category-text">
                      <h4 className="category-name">{category.name}</h4>
                      <p className="category-description">
                        {category.description || 'Herramientas OSINT'}
                      </p>
                      <span className="tools-count">
                        {categoryTools.length} herramienta{categoryTools.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className={`expand-arrow ${isExpanded ? 'rotated' : ''}`}>
                    ▼
                  </div>
                </div>

                {/* Lista de Herramientas */}
                {isExpanded && (
                  <div className="tools-list">
                    {categoryTools.length > 0 ? (
                      categoryTools.map((tool) => (
                        <div 
                          key={tool.id}
                          className="tool-item"
                          onClick={() => handleToolClick(tool)}
                        >
                          <div className="tool-icon">
                            {tool.icon || '🔧'}
                          </div>
                          <div className="tool-info">
                            <h5 className="tool-name">{tool.name}</h5>
                            <p className="tool-description">
                              {tool.description || 'Herramienta OSINT'}
                            </p>
                            {tool.verified && (
                              <span className="tool-verified">✓ Verificado</span>
                            )}
                          </div>
                          <div className="tool-action">
                            <span className="action-text">Abrir</span>
                            <span className="action-arrow">→</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-tools">
                        <p>No hay herramientas disponibles en esta categoría</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="tree-stats">
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Categorías</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{tools.length}</span>
          <span className="stat-label">Herramientas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{expandedCategories.size}</span>
          <span className="stat-label">Expandidas</span>
        </div>
      </div>
    </div>
  );
};

export default TreeExpandView;
