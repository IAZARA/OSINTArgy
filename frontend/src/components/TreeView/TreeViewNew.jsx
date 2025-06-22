import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import './TreeView.css'

const TreeViewNew = ({ 
  tools = [], 
  categories = [], 
  onCategorySelect, 
  selectedCategory, 
  searchQuery 
}) => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 1280, height: 800 })
  const [showCategories, setShowCategories] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  // Actualizar dimensiones del contenedor
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 1280,
          height: rect.height || 800
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Función para manejar click en el logo central
  const handleCentralClick = () => {
    setShowCategories(!showCategories)
    // Si estamos ocultando categorías, también colapsar todas las categorías expandidas
    if (showCategories) {
      setExpandedCategories(new Set())
    }
  }

  // Función para manejar click en categoría
  const handleCategoryClick = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)

    // Llamar al callback si existe
    if (onCategorySelect) {
      const category = categories.find(cat => cat.id === categoryId)
      onCategorySelect(category)
    }
  }

  // Función para manejar click en herramienta
  const handleToolClick = (toolUrl) => {
    if (toolUrl) {
      window.open(toolUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Renderizar el grafo con D3.js
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2

    // Limpiar SVG
    svg.selectAll('*').remove()

    // Crear gradientes
    const defs = svg.append('defs')
    
    const centralGradient = defs.append('radialGradient')
      .attr('id', 'centralGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
    
    centralGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00D4FF')
      .attr('stop-opacity', 1)
    
    centralGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0099CC')
      .attr('stop-opacity', 1)

    const categoryGradient = defs.append('radialGradient')
      .attr('id', 'categoryGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
    
    categoryGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4CAF50')
      .attr('stop-opacity', 1)
    
    categoryGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#2E7D32')
      .attr('stop-opacity', 1)

    const toolGradient = defs.append('radialGradient')
      .attr('id', 'toolGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
    
    toolGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#FF9800')
      .attr('stop-opacity', 1)
    
    toolGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#E65100')
      .attr('stop-opacity', 1)

    // Crear contenedor principal
    const container = svg.append('g')
      .attr('class', 'tree-container')

    // PASO 1: Siempre mostrar el logo central
    const centralNode = container.append('g')
      .attr('class', 'node central-node')
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .style('cursor', 'pointer')
      .on('click', handleCentralClick)

    // Tooltip para el nodo central
    centralNode.append('title')
      .text('OSINTArgy - Click para explorar categorías')

    // Círculo del logo central
    centralNode.append('circle')
      .attr('r', 60)
      .attr('fill', 'url(#centralGradient)')
      .attr('stroke', '#00D4FF')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))')

    // Imagen del logo
    centralNode.append('image')
      .attr('href', '/favicon.png')
      .attr('x', -40)
      .attr('y', -40)
      .attr('width', 80)
      .attr('height', 80)
      .style('pointer-events', 'none')

    // Texto del logo
    centralNode.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '85px')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#00D4FF')
      .text('OSINTArgy')

    // Indicador de que es clickeable
    if (!showCategories) {
      centralNode.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '105px')
        .attr('font-size', '12px')
        .attr('fill', '#888')
        .text('Click para explorar')
        .style('opacity', 0.8)
    }

    // PASO 2: Mostrar categorías si showCategories es true
    if (showCategories && categories.length > 0) {
      const categoryRadius = Math.min(width, height) * 0.15  // Reducido de 0.25 a 0.15
      const angleStep = (2 * Math.PI) / categories.length

      console.log('Dimensiones:', width, height, 'Centro:', centerX, centerY, 'Radio categorías:', categoryRadius)

      // Crear enlaces y nodos para cada categoría
      categories.forEach((category, i) => {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + Math.cos(angle) * categoryRadius
        const y = centerY + Math.sin(angle) * categoryRadius

        console.log(`Categoría ${category.name}: posición (${x.toFixed(1)}, ${y.toFixed(1)})`)

        // Crear enlace
        container.append('line')
          .attr('class', 'category-link')
          .attr('x1', centerX)
          .attr('y1', centerY)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', '#4CAF50')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.6)
          .style('filter', 'drop-shadow(0 0 5px rgba(76, 175, 80, 0.3))')

        // Crear nodo de categoría
        const categoryNode = container.append('g')
          .attr('class', 'node category-node')
          .attr('transform', `translate(${x}, ${y})`)
          .style('cursor', 'pointer')
          .on('click', () => handleCategoryClick(category.id))

        // Círculo de categoría
        categoryNode.append('circle')
          .attr('r', 40)
          .attr('fill', category.color || 'url(#categoryGradient)')
          .attr('stroke', category.color || '#4CAF50')
          .attr('stroke-width', 2)
          .style('filter', 'drop-shadow(0 0 15px rgba(76, 175, 80, 0.4))')

        // Icono de categoría
        categoryNode.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', '20px')
          .attr('fill', 'white')
          .text(category.icon || '📁')

        // Nombre de categoría
        categoryNode.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '60px')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text(category.name)

        // Contador de herramientas
        const toolCount = tools.filter(tool => tool.category === category.id).length
        categoryNode.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '75px')
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .text(`${toolCount} herramientas`)

        // Tooltip para categoría
        categoryNode.append('title')
          .text(`${category.name}\n${category.description || ''}\n${toolCount} herramientas disponibles\nClick para expandir`)
      })

      // PASO 3: Mostrar herramientas de categorías expandidas
      expandedCategories.forEach(categoryId => {
        const category = categories.find(cat => cat.id === categoryId)
        if (!category) return

        const categoryIndex = categories.findIndex(cat => cat.id === categoryId)
        const categoryAngle = categoryIndex * angleStep - Math.PI / 2
        const categoryX = centerX + Math.cos(categoryAngle) * categoryRadius
        const categoryY = centerY + Math.sin(categoryAngle) * categoryRadius

        const categoryTools = tools.filter(tool => tool.category === categoryId)
        if (categoryTools.length === 0) return

        const toolRadius = 80  // Reducido de 120 a 80
        const toolAngleStep = (2 * Math.PI) / categoryTools.length

        // Crear enlaces y nodos para cada herramienta
        categoryTools.forEach((tool, i) => {
          const angle = i * toolAngleStep
          const x = categoryX + Math.cos(angle) * toolRadius
          const y = categoryY + Math.sin(angle) * toolRadius

          // Crear enlace de categoría a herramienta
          container.append('line')
            .attr('class', `tool-link tool-link-${categoryId}`)
            .attr('x1', categoryX)
            .attr('y1', categoryY)
            .attr('x2', x)
            .attr('y2', y)
            .attr('stroke', '#FF9800')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.5)

          // Crear nodo de herramienta
          const toolNode = container.append('g')
            .attr('class', `node tool-node tool-node-${categoryId}`)
            .attr('transform', `translate(${x}, ${y})`)
            .style('cursor', 'pointer')
            .on('click', () => handleToolClick(tool.url))

          // Círculo de herramienta
          toolNode.append('circle')
            .attr('r', 20)
            .attr('fill', 'url(#toolGradient)')
            .attr('stroke', '#FF9800')
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0 0 10px rgba(255, 152, 0, 0.4))')

          // Icono de herramienta
          toolNode.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '12px')
            .attr('fill', 'white')
            .text('🔧')

          // Nombre de herramienta
          toolNode.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '35px')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .text(tool.name.length > 15 ? tool.name.substring(0, 15) + '...' : tool.name)

          // Tooltip para herramienta
          toolNode.append('title')
            .text(`${tool.name}\n${tool.description || 'Herramienta OSINT'}\nClick para abrir en nueva pestaña`)
        })
      })
    }

  }, [dimensions, showCategories, expandedCategories, categories, tools])

  // Función para resetear todo
  const handleReset = () => {
    setShowCategories(false)
    setExpandedCategories(new Set())
  }

  return (
    <div className="tree-view-container" ref={containerRef}>
      {/* Controles superiores */}
      {(showCategories || expandedCategories.size > 0) && (
        <div className="tree-controls">
          <button
            className="reset-button"
            onClick={handleReset}
            title="Colapsar todo"
          >
            🏠 Inicio
          </button>
          {showCategories && (
            <div className="tree-info">
              <span>{categories.length} categorías disponibles</span>
              {expandedCategories.size > 0 && (
                <span> • {expandedCategories.size} expandidas</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="tree-view-simple">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="tree-svg"
        />
      </div>
    </div>
  )
}

export default TreeViewNew
