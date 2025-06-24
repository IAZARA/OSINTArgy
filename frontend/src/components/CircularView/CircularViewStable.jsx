import React, { useState, useEffect } from 'react';
import './CircularViewStable.css';

const CircularViewStable = ({ tools = [], categories = [], onCategorySelect, selectedCategory }) => {
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Efecto para actualizar dimensiones
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.circular-stable-container');
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        setDimensions({ width: width || 800, height: height || 600 });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Manejar click en botón central
  const handleCentralClick = () => {
    setShowCategories(prev => !prev);
    setActiveCategory(null);
    if (onCategorySelect) {
      onCategorySelect(null);
    }
  };

  // Manejar click en categoría
  const handleCategoryClick = (category) => {
    setActiveCategory(prev => (prev === category.id ? null : category.id));
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  // Manejar click en herramienta
  const handleToolClick = (tool) => {
    if (tool.url) {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Calcular posiciones de categorías
  const getCategoryPosition = (index, total) => {
    const radius = Math.min(dimensions.width, dimensions.height) / 4;
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // Calcular posiciones de herramientas
  const getToolPosition = (categoryPos, toolIndex, totalTools) => {
    const radius = 80;
    const angle = (toolIndex * 2 * Math.PI) / totalTools - Math.PI / 2;
    
    return {
      x: categoryPos.x + radius * Math.cos(angle),
      y: categoryPos.y + radius * Math.sin(angle)
    };
  };

  return (
    <div className="circular-stable-container">
      {/* Botón Central */}
      <div 
        className="central-button-stable"
        onClick={handleCentralClick}
        style={{
          left: dimensions.width / 2 - 60,
          top: dimensions.height / 2 - 60
        }}
      >
        <div className="central-circle">
          <img src="/favicon.png" alt="OSINTArgy" className="central-logo" />
        </div>
        <div className="central-tooltip">
          OSINTArgy - Click para ver/ocultar categorías
        </div>
      </div>

      {/* Categorías */}
      {showCategories && categories.map((category, index) => {
        const position = getCategoryPosition(index, categories.length);
        const isActive = activeCategory === category.id;
        
        return (
          <div key={category.id}>
            {/* Nodo de Categoría */}
            <div
              className={`category-node-stable ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
              style={{
                left: position.x - 40,
                top: position.y - 40
              }}
            >
              <div 
                className="category-circle"
                style={{ backgroundColor: category.color || '#1E5A8A' }}
              >
                <span className="category-icon">
                  {category.icon || '📁'}
                </span>
              </div>
              <div className="category-tooltip">
                {category.name}
                <br />
                {category.description || ''}
                <br />
                Click para ver herramientas
              </div>
            </div>

            {/* Herramientas de la categoría activa */}
            {isActive && tools
              .filter(tool => tool.category === category.id)
              .map((tool, toolIndex, categoryTools) => {
                const toolPosition = getToolPosition(position, toolIndex, categoryTools.length);
                
                return (
                  <div
                    key={tool.id}
                    className="tool-node-stable"
                    onClick={() => handleToolClick(tool)}
                    style={{
                      left: toolPosition.x - 25,
                      top: toolPosition.y - 25
                    }}
                  >
                    <div className="tool-circle">
                      <span className="tool-icon">
                        {tool.icon || '🔧'}
                      </span>
                    </div>
                    <div className="tool-tooltip">
                      {tool.name}
                      <br />
                      {tool.description || 'Herramienta OSINT'}
                      <br />
                      Click para abrir
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

export default CircularViewStable;
