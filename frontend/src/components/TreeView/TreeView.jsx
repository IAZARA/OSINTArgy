import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import './TreeView.css'

const TreeView = ({
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
  const [simulation, setSimulation] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)

  // Actualizar dimensiones cuando cambie el tamaño del contenedor
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ 
          width: Math.max(width, 1280), 
          height: Math.max(height, 800) 
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Preparar datos del grafo cuando cambien las categorías o herramientas
  useEffect(() => {
    if (!categories.length) return

    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2

    // Crear nodo central con diseño mejorado tipo Maltego
    const centralNode = {
      id: 'osintargy-central',
      name: 'OSINTArgy',
      type: 'central',
      x: centerX,
      y: centerY,
      fx: centerX, // Fijar posición
      fy: centerY,
      radius: 50,
      color: '#00d4ff',
      icon: '🎯',
      description: 'Centro de Herramientas OSINT'
    }

    const newNodes = [centralNode]
    const newLinks = []

    // Crear nodos de categorías con distribución mejorada
    const categoryRadius = Math.min(width, height) * 0.25
    const angleStep = (2 * Math.PI) / categories.length

    categories.forEach((category, index) => {
      const angle = index * angleStep - Math.PI / 2 // Empezar desde arriba
      const categoryTools = tools.filter(tool => tool.category === category.id)
      const isExpanded = expandedCategories.has(category.id)
      
      const categoryNode = {
        id: `category-${category.id}`,
        name: category.name,
        type: 'category',
        categoryId: category.id,
        x: centerX + Math.cos(angle) * categoryRadius,
        y: centerY + Math.sin(angle) * categoryRadius,
        radius: isExpanded ? 35 : 28,
        color: category.color || '#42A5F5',
        icon: category.icon || '📁',
        toolsCount: categoryTools.length,
        expanded: isExpanded,
        description: category.description,
        angle: angle
      }

      newNodes.push(categoryNode)
      newLinks.push({
        source: 'osintargy-central',
        target: `category-${category.id}`,
        type: 'category-link',
        strength: 1
      })

      // Si la categoría está expandida, agregar herramientas con mejor distribución
      if (isExpanded && categoryTools.length > 0) {
        const toolRadius = 100 + (categoryTools.length > 8 ? 20 : 0)
        const toolAngleStep = (2 * Math.PI) / Math.max(categoryTools.length, 1)
        const toolStartAngle = angle - (toolAngleStep * (categoryTools.length - 1)) / 2

        categoryTools.forEach((tool, toolIndex) => {
          const toolAngle = toolStartAngle + (toolIndex * toolAngleStep)
          const toolNode = {
            id: `tool-${tool.id || toolIndex}-${category.id}`,
            name: tool.name,
            type: 'tool',
            categoryId: category.id,
            url: tool.url,
            description: tool.description,
            x: categoryNode.x + Math.cos(toolAngle) * toolRadius,
            y: categoryNode.y + Math.sin(toolAngle) * toolRadius,
            radius: 15,
            color: tool.verified ? '#4CAF50' : '#90CAF9',
            verified: tool.verified,
            tags: tool.tags || [],
            icon: tool.icon || '🔧',
            parentAngle: angle
          }

          newNodes.push(toolNode)
          newLinks.push({
            source: `category-${category.id}`,
            target: `tool-${tool.id || toolIndex}-${category.id}`,
            type: 'tool-link',
            strength: 0.8
          })
        })
      }
    })

    setNodes(newNodes)
    setLinks(newLinks)
  }, [categories, tools, expandedCategories, dimensions])

  // Renderizar el grafo con D3.js
  useEffect(() => {
    if (!nodes.length || !links.length) return;

    const { width, height } = dimensions;

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id)
        .strength(d => d.type === 'category-link' ? 0.6 : 0.4)
        .distance(d => d.type === 'category-link' ? Math.min(width, height) * 0.25 : 100))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.radius + 15));

    setSimulation(simulation);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Crear gradientes para el diseño Maltego
    const defs = svg.append('defs')
    
    // Gradiente central
    const centralGradient = defs.append('radialGradient')
      .attr('id', 'centralGradient')
      .attr('cx', '50%')
      .attr('cy', '30%')
    centralGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00d4ff')
    centralGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0288d1')
    
    // Gradiente categoría
    const categoryGradient = defs.append('radialGradient')
      .attr('id', 'categoryGradient')
      .attr('cx', '50%')
      .attr('cy', '30%')
    categoryGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#42A5F5')
    categoryGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1976D2')
    
    // Gradiente categoría expandida
    const categoryExpandedGradient = defs.append('radialGradient')
      .attr('id', 'categoryExpandedGradient')
      .attr('cx', '50%')
      .attr('cy', '30%')
    categoryExpandedGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#64B5F6')
    categoryExpandedGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0D47A1')
    
    // Gradiente herramienta
    const toolGradient = defs.append('radialGradient')
      .attr('id', 'toolGradient')
      .attr('cx', '50%')
      .attr('cy', '30%')
    toolGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#90CAF9')
    toolGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#42A5F5')
    
    // Gradiente herramienta verificada
    const toolVerifiedGradient = defs.append('radialGradient')
      .attr('id', 'toolVerifiedGradient')
      .attr('cx', '50%')
      .attr('cy', '30%')
    toolVerifiedGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#81C784')
    toolVerifiedGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#388E3C')

    // Crear contenedor principal
    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'graph-container')

    // Configurar simulación de fuerzas mejorada
    const newSimulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          if (d.type === 'category-link') return Math.min(width, height) * 0.25
          if (d.type === 'tool-link') return 100 + (d.source.toolsCount > 8 ? 20 : 0)
          return 100
        })
        .strength(d => d.strength || 0.8)
      )
      .force('charge', d3.forceManyBody()
        .strength(d => {
          if (d.type === 'central') return -4000
          if (d.type === 'category') return d.expanded ? -2000 : -1500
          if (d.type === 'tool') return -400
          return -300
        })
      )
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
      .force('collision', d3.forceCollide()
        .radius(d => d.radius + (d.type === 'central' ? 20 : d.type === 'category' ? 15 : 10))
        .strength(0.8)
      )
      .force('radial', d3.forceRadial(
        d => {
          if (d.type === 'category') return Math.min(width, height) * 0.25
          if (d.type === 'tool') return Math.min(width, height) * 0.4
          return 0
        },
        width / 2,
        height / 2
      ).strength(d => d.type === 'central' ? 0 : 0.3))

    setSimulation(newSimulation)

    // Crear enlaces con estilo Maltego mejorado
    const linkElements = container.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', d => `link ${d.type}`)
      .style('stroke', d => {
        if (d.type === 'category-link') return '#00d4ff'
        if (d.type === 'tool-link') return '#42A5F5'
        return '#666'
      })
      .style('stroke-width', d => {
        if (d.type === 'category-link') return 4
        if (d.type === 'tool-link') return 2.5
        return 1.5
      })
      .style('opacity', d => {
        if (d.type === 'category-link') return 0.8
        if (d.type === 'tool-link') return 0.7
        return 0.5
      })
      .style('stroke-dasharray', d => {
        if (d.type === 'tool-link') return '5,5'
        return 'none'
      })
      .style('filter', 'drop-shadow(0 0 3px rgba(0, 212, 255, 0.3))')

    // Crear elementos de nodos con animaciones de entrada
    const nodeElements = container.selectAll('.node')
      .data(nodes, d => d.id)
      .join(
        enter => {
          const enterNodes = enter.append('g')
            .attr('class', d => `node ${d.type} ${d.expanded ? 'expanded' : ''} new`)
            .style('opacity', 0)
            .style('transform', 'scale(0)')
            .call(d3.drag()
              .on('start', (event, d) => {
                if (!event.active) newSimulation.alphaTarget(0.3).restart()
                d.fx = d.x
                d.fy = d.y
              })
              .on('drag', (event, d) => {
                d.fx = event.x
                d.fy = event.y
              })
              .on('end', (event, d) => {
                if (!event.active) newSimulation.alphaTarget(0)
                if (d.type !== 'central') {
                  d.fx = null
                  d.fy = null
                }
              })
            )
          
          // Animación de entrada escalonada
          enterNodes
            .transition()
            .delay((d, i) => {
              if (d.type === 'central') return 0
              if (d.type === 'category') return i * 50
              return 200 + (i * 20)
            })
            .duration(600)
            .ease(d3.easeBackOut.overshoot(1.2))
            .style('opacity', 1)
            .style('transform', 'scale(1)')
            .on('end', function() {
              d3.select(this).classed('new', false)
            })
          
          return enterNodes
        },
        update => update
          .attr('class', d => `node ${d.type} ${d.expanded ? 'expanded' : ''}`)
          .transition()
          .duration(300)
          .ease(d3.easeQuadInOut),
        exit => exit
          .transition()
          .duration(400)
          .ease(d3.easeBackIn)
          .style('opacity', 0)
          .style('transform', 'scale(0)')
          .remove()
      )
      .style('cursor', d => d.type === 'tool' ? 'pointer' : d.type === 'category' ? 'pointer' : 'grab')
      .on('click', (event, d) => {
        handleNodeClick(d, event)
      })
      .on('mouseenter', (event, d) => {
        if (isAnimating) return
        
        setHoveredNode(d)
        const node = d3.select(event.currentTarget)
        const circle = node.select('circle')
        const icon = node.select('.node-icon')
        const label = node.select('.node-label')
        
        // Animación de hover mejorada
        circle
          .transition()
          .duration(250)
          .ease(d3.easeQuadOut)
          .attr('r', d.radius * 1.15)
          .style('filter', d => {
            if (d.type === 'central') return 'drop-shadow(0 0 25px var(--maltego-primary))'
            if (d.type === 'category') return 'drop-shadow(0 0 20px var(--maltego-node-category))'
            if (d.verified) return 'drop-shadow(0 0 15px var(--maltego-accent-green))'
            return 'drop-shadow(0 0 12px var(--maltego-node-tool))'
          })
          .style('stroke-width', d => d.type === 'central' ? 4 : 3)
        
        // Efecto de flotación en el icono
        icon
          .transition()
          .duration(200)
          .style('transform', 'translateY(-2px) scale(1.1)')
        
        // Resaltar etiqueta
        label
          .transition()
          .duration(200)
          .style('font-weight', 'bold')
          .style('text-shadow', '0 0 8px rgba(0, 212, 255, 0.8)')
      })
      .on('mouseleave', (event, d) => {
        if (isAnimating) return
        
        setHoveredNode(null)
        const node = d3.select(event.currentTarget)
        const circle = node.select('circle')
        const icon = node.select('.node-icon')
        const label = node.select('.node-label')
        
        // Restaurar estado normal
        circle
          .transition()
          .duration(300)
          .ease(d3.easeQuadOut)
          .attr('r', d.radius)
          .style('filter', d => {
            if (d.type === 'central') return 'drop-shadow(0 0 15px var(--maltego-primary))'
            if (d.verified) return 'drop-shadow(0 0 10px var(--maltego-accent-green))'
            return 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))'
          })
          .style('stroke-width', d => d.type === 'central' ? 3 : 2)
        
        icon
          .transition()
          .duration(250)
          .style('transform', 'translateY(0px) scale(1)')
        
        label
          .transition()
          .duration(250)
          .style('font-weight', 'normal')
          .style('text-shadow', 'none')
      })

    // Agregar círculos a los nodos con estilo Maltego
    nodeElements.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => {
        if (d.type === 'central') return 'url(#centralGradient)'
        if (d.type === 'category') return d.expanded ? 'url(#categoryExpandedGradient)' : 'url(#categoryGradient)'
        if (d.type === 'tool') return d.verified ? 'url(#toolVerifiedGradient)' : 'url(#toolGradient)'
        return d.color
      })
      .attr('stroke', d => {
        if (d.type === 'central') return '#00d4ff'
        if (d.type === 'category') return d.expanded ? '#00d4ff' : '#42A5F5'
        if (d.type === 'tool') return d.verified ? '#4CAF50' : '#90CAF9'
        return '#666'
      })
      .attr('stroke-width', d => {
        if (d.type === 'central') return 5
        if (d.type === 'category') return d.expanded ? 4 : 3
        if (d.type === 'tool') return 2.5
        return 2
      })
      .style('filter', d => {
        if (d.type === 'central') return 'drop-shadow(0 0 25px rgba(0, 212, 255, 0.9))'
        if (d.type === 'category') return d.expanded ? 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.6))' : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
        if (d.type === 'tool') return d.verified ? 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.6))' : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))'
        return 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
      })
      .style('opacity', d => d.type === 'tool' && hoveredNode && hoveredNode.categoryId !== d.categoryId ? 0.3 : 1)

    // Agregar iconos a los nodos con iconografía mejorada
    nodeElements.append('text')
      .attr('class', 'node-icon')
      .attr('text-anchor', 'middle')
      .attr('dy', d => {
        if (d.type === 'central') return -5
        if (d.type === 'category') return -3
        return -2
      })
      .style('font-size', d => {
        if (d.type === 'central') return '24px'
        if (d.type === 'category') return '16px'
        return '12px'
      })
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))')
      .text(d => {
        if (d.icon) return d.icon
        
        // Iconos específicos por tipo
        if (d.type === 'central') return '🎯'
        if (d.type === 'tool') {
          if (d.verified) return '✅'
          return '🔧'
        }
        
        // Iconos específicos por categoría
        if (d.type === 'category') {
          const categoryIcons = {
            'buscadores': '🔍',
            'redes-sociales': '📱',
            'email': '📧',
            'dominios': '🌐',
            'geolocalizacion': '📍',
            'imagenes': '🖼️',
            'documentos': '📄',
            'registros': '📋',
            'darkweb': '🕸️',
            'analisis': '📊',
            'utilidades': '🛠️',
            'argentina': '🇦🇷',
            'telefonos': '📞',
            'archivos': '📁',
            'criptomonedas': '₿'
          }
          return categoryIcons[d.categoryId] || categoryIcons[d.name?.toLowerCase()] || '📁'
        }
        
        return '📁'
      })

    // Agregar texto a los nodos
    nodeElements.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => {
        if (d.type === 'central') return 20
        if (d.type === 'category') return 15
        return 12
      })
      .style('font-size', d => {
        if (d.type === 'central') return '14px'
        if (d.type === 'category') return '11px'
        return '9px'
      })
      .style('font-weight', d => {
        if (d.type === 'central') return 'bold'
        if (d.type === 'category') return '600'
        return 'normal'
      })
      .style('fill', '#fff')
      .style('text-shadow', '0 1px 3px rgba(0, 0, 0, 0.8)')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => {
        if (d.type === 'central') return d.name
        if (d.type === 'category') return d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name
        return d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name
      })

    // Agregar contador de herramientas para categorías
    nodeElements.filter(d => d.type === 'category' && d.toolsCount > 0)
      .append('circle')
      .attr('class', 'tools-count-bg')
      .attr('cx', d => d.radius * 0.7)
      .attr('cy', d => -d.radius * 0.7)
      .attr('r', 12)
      .style('fill', '#FF5722')
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))')

    nodeElements.filter(d => d.type === 'category' && d.toolsCount > 0)
      .append('text')
      .attr('class', 'tools-count')
      .attr('text-anchor', 'middle')
      .attr('x', d => d.radius * 0.7)
      .attr('y', d => -d.radius * 0.7)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.toolsCount)

    // Agregar tooltips mejorados
    const tooltip = d3.select('body').selectAll('.maltego-tooltip')
      .data([null])
      .enter()
      .append('div')
      .attr('class', 'maltego-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', '#fff')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000)
      .style('backdrop-filter', 'blur(10px)')
      .style('border', '1px solid rgba(0, 212, 255, 0.5)')
      .style('box-shadow', '0 8px 32px rgba(0, 0, 0, 0.3)')

    nodeElements
      .on('mouseenter.tooltip', (event, d) => {
        const tooltipContent = d.type === 'central' 
          ? `<strong>${d.name}</strong><br/>${d.description}`
          : d.type === 'category'
          ? `<strong>${d.name}</strong><br/>${d.description || 'Categoría de herramientas'}<br/><em>${d.toolsCount} herramientas</em>`
          : `<strong>${d.name}</strong><br/>${d.description || 'Herramienta OSINT'}<br/>${d.verified ? '✅ Verificada' : '⚠️ No verificada'}`
        
        d3.select('.maltego-tooltip')
          .style('opacity', 1)
          .html(tooltipContent)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
      })
      .on('mousemove.tooltip', (event) => {
        d3.select('.maltego-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
      })
      .on('mouseleave.tooltip', () => {
        d3.select('.maltego-tooltip')
          .style('opacity', 0)
      })

    // Agregar tooltips
    nodeElements.append('title')
      .text(d => {
        if (d.type === 'central') return 'OSINTArgy - Centro de herramientas OSINT'
        if (d.type === 'category') return `${d.name} - ${d.toolsCount} herramientas`
        return d.description || d.name
      })

    // Función para manejar clics en nodos con animaciones mejoradas
    function handleNodeClick(d, event) {
      event.stopPropagation()
      
      if (d.type === 'category') {
        const newExpanded = new Set(expandedCategories)
        const isExpanding = !newExpanded.has(d.categoryId)
        
        if (newExpanded.has(d.categoryId)) {
          newExpanded.delete(d.categoryId)
        } else {
          newExpanded.add(d.categoryId)
        }
        setExpandedCategories(newExpanded)
        setIsAnimating(true)
        
        // Animación de expansión/colapso mejorada
        const categoryNode = d3.select(event.currentTarget)
        const circle = categoryNode.select('circle')
        const icon = categoryNode.select('.node-icon')
        
        if (isExpanding) {
          // Animación de expansión
          circle
            .transition()
            .duration(200)
            .ease(d3.easeBackOut.overshoot(1.7))
            .attr('r', d.radius * 1.4)
            .style('filter', 'drop-shadow(0 0 25px var(--maltego-primary))')
            .transition()
            .duration(300)
            .ease(d3.easeElastic.period(0.3))
            .attr('r', d.radius)
            .style('filter', 'drop-shadow(0 0 15px var(--maltego-node-category))')
            .on('end', () => setIsAnimating(false))
          
          // Rotación del icono
          icon
            .transition()
            .duration(400)
            .style('transform', 'rotate(180deg)')
            .transition()
            .duration(200)
            .style('transform', 'rotate(0deg)')
        } else {
          // Animación de colapso
          circle
            .transition()
            .duration(150)
            .ease(d3.easeBackIn)
            .attr('r', d.radius * 0.7)
            .style('filter', 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.8))')
            .transition()
            .duration(250)
            .ease(d3.easeBounceOut)
            .attr('r', d.radius)
            .style('filter', 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))')
            .on('end', () => setIsAnimating(false))
          
          // Efecto de implosión en el icono
          icon
            .transition()
            .duration(200)
            .style('transform', 'scale(0.5)')
            .transition()
            .duration(200)
            .style('transform', 'scale(1)')
        }
        
        // Reiniciar simulación con más energía
        if (newSimulation) {
          newSimulation.alpha(0.6).restart()
        }
        
        onCategorySelect?.(categories.find(cat => cat.id === d.categoryId))
        
      } else if (d.type === 'tool' && d.url) {
        // Animación de click en herramienta mejorada
        const toolNode = d3.select(event.currentTarget)
        const circle = toolNode.select('circle')
        const icon = toolNode.select('.node-icon')
        
        setIsAnimating(true)
        
        // Efecto de "lanzamiento"
        circle
          .transition()
          .duration(100)
          .ease(d3.easeQuadIn)
          .attr('r', d.radius * 0.8)
          .style('filter', `drop-shadow(0 0 5px ${d.color})`)
          .transition()
          .duration(200)
          .ease(d3.easeBackOut.overshoot(2))
          .attr('r', d.radius * 1.5)
          .style('filter', `drop-shadow(0 0 30px ${d.color})`)
          .transition()
          .duration(150)
          .ease(d3.easeQuadOut)
          .attr('r', d.radius)
          .style('filter', d.verified ? 'drop-shadow(0 0 10px var(--maltego-accent-green))' : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))')
          .on('end', () => setIsAnimating(false))
        
        // Rotación del icono
        icon
          .transition()
          .duration(300)
          .style('transform', 'rotate(360deg)')
          .transition()
          .duration(100)
          .style('transform', 'rotate(0deg)')
        
        setTimeout(() => {
          window.open(d.url, '_blank')
        }, 150)
        
      } else if (d.type === 'central') {
        // Resetear vista con animación espectacular
        setExpandedCategories(new Set())
        setIsAnimating(true)
        
        const centralNode = d3.select(event.currentTarget)
        const circle = centralNode.select('circle')
        const icon = centralNode.select('.node-icon')
        
        // Efecto de "onda expansiva"
        circle
          .transition()
          .duration(300)
          .ease(d3.easeQuadOut)
          .attr('r', d.radius * 2)
          .style('filter', 'drop-shadow(0 0 50px var(--maltego-primary))')
          .style('opacity', 0.7)
          .transition()
          .duration(400)
          .ease(d3.easeElastic.period(0.4))
          .attr('r', d.radius)
          .style('filter', 'drop-shadow(0 0 20px var(--maltego-primary))')
          .style('opacity', 1)
          .on('end', () => setIsAnimating(false))
        
        // Pulso del icono
        icon
          .transition()
          .duration(200)
          .style('transform', 'scale(1.5)')
          .transition()
          .duration(300)
          .style('transform', 'scale(1)')
        
        if (newSimulation) {
          newSimulation.alpha(0.8).restart()
        }
      }
    }

    // Actualizar posiciones en cada tick de la simulación con animaciones suaves
    newSimulation.on('tick', () => {
      linkElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      nodeElements
        .attr('transform', d => `translate(${d.x},${d.y})`)
        
      // Actualizar opacidad de herramientas basada en hover
      if (hoveredNode) {
        nodeElements.filter(d => d.type === 'tool')
          .style('opacity', d => {
            if (hoveredNode.type === 'category' && d.categoryId !== hoveredNode.categoryId) {
              return 0.2
            }
            return 1
          })
        
        linkElements.filter(d => d.type === 'tool-link')
          .style('opacity', d => {
            if (hoveredNode.type === 'category' && d.source.categoryId !== hoveredNode.categoryId) {
              return 0.2
            }
            return 0.7
          })
      } else {
        nodeElements.style('opacity', 1)
        linkElements.style('opacity', d => d.type === 'category-link' ? 0.8 : 0.7)
      }
    })

    // Configurar zoom y pan avanzado
    const zoom = d3.zoom()
      .scaleExtent([0.1, 5])
      .on('start', () => {
        setIsAnimating(true)
      })
      .on('zoom', (event) => {
        const { transform } = event
        container.attr('transform', transform)
        setZoomLevel(transform.k)
        
        // Ajustar tamaño de nodos según zoom
        nodeElements.selectAll('circle')
          .attr('r', d => d.radius / Math.sqrt(transform.k))
        
        // Ajustar grosor de enlaces según zoom
        linkElements
          .style('stroke-width', d => {
            const baseWidth = d.type === 'category-link' ? 3 : 2
            return Math.max(0.5, baseWidth / transform.k)
          })
        
        // Ajustar tamaño de texto según zoom
        nodeElements.selectAll('.node-label')
          .style('font-size', d => {
            const baseSize = d.type === 'central' ? 14 : d.type === 'category' ? 12 : 10
            return Math.max(8, baseSize / Math.sqrt(transform.k)) + 'px'
          })
        
        nodeElements.selectAll('.node-icon')
          .style('font-size', d => {
            const baseSize = d.type === 'central' ? 24 : d.type === 'category' ? 16 : 12
            return Math.max(10, baseSize / Math.sqrt(transform.k)) + 'px'
          })
      })
      .on('end', () => {
        setIsAnimating(false)
      })

    svg.call(zoom)
    
    // Zoom con Ctrl + Scroll
    svg.on('wheel', (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1
        const currentTransform = d3.zoomTransform(svg.node())
        const newScale = Math.max(0.1, Math.min(5, currentTransform.k * scaleFactor))
        
        svg.transition()
          .duration(200)
          .call(zoom.scaleTo, newScale)
      }
    })
    
    // Función para enfocar en un nodo específico
    const focusOnNode = (nodeId, duration = 750) => {
      const targetNode = nodes.find(n => n.id === nodeId)
      if (!targetNode) return
      
      setFocusedNode(targetNode)
      setIsAnimating(true)
      
      const svg = d3.select(svgRef.current)
      const width = dimensions.width
      const height = dimensions.height
      
      // Calcular transformación para centrar el nodo
      const scale = 1.5
      const translate = [
        width / 2 - targetNode.x * scale,
        height / 2 - targetNode.y * scale
      ]
      
      svg.transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        )
        .on('end', () => {
          setIsAnimating(false)
          // Efecto de pulso en el nodo enfocado
          nodeElements.filter(d => d.id === nodeId)
            .select('circle')
            .transition()
            .duration(300)
            .attr('r', d => d.radius * 1.3)
            .style('filter', 'drop-shadow(0 0 20px var(--maltego-primary))')
            .transition()
            .duration(300)
            .attr('r', d => d.radius)
            .style('filter', d => {
              if (d.type === 'central') return 'drop-shadow(0 0 15px var(--maltego-primary))'
              if (d.verified) return 'drop-shadow(0 0 10px var(--maltego-accent-green))'
              return 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))'
            })
        })
    }
    
    // Exponer función de enfoque
    window.focusOnNode = focusOnNode

    // Cleanup
    return () => {
      newSimulation.stop()
    }

  }, [nodes, links, dimensions, selectedCategory, onCategorySelect, categories, expandedCategories])

  return (
    <div className="tree-view-container" ref={containerRef}>
      <div className="tree-view-header">
        <div className="header-content">
          <h2>🎯 Mapa Interactivo OSINT - Estilo Maltego</h2>
          <div className="status-info">
            <span className="zoom-level">Zoom: {Math.round(zoomLevel * 100)}%</span>
            <span className="categories-expanded">
              {expandedCategories.size}/{categories.length} categorías expandidas
            </span>
            <span className="total-tools">
              {tools.length} herramientas disponibles
            </span>
          </div>
        </div>
        <div className="tree-view-controls">
          <button 
            className={`control-btn reset-zoom ${isAnimating ? 'disabled' : ''}`}
            onClick={() => {
              if (isAnimating) return
              const svg = d3.select(svgRef.current)
              setZoomLevel(1)
              setIsAnimating(true)
              svg.transition()
                .duration(750)
                .ease(d3.easeCubicInOut)
                .call(
                  d3.zoom().transform,
                  d3.zoomIdentity
                )
                .on('end', () => setIsAnimating(false))
              if (simulation) {
                simulation.alpha(0.3).restart()
              }
            }}
            title="Resetear vista y zoom"
            disabled={isAnimating}
          >
            🔄 Reset
          </button>
          <button 
            className={`control-btn collapse-all ${isAnimating ? 'disabled' : ''}`}
            onClick={() => {
              if (isAnimating) return
              setExpandedCategories(new Set())
              setIsAnimating(true)
              if (simulation) {
                simulation.alpha(0.5).restart()
              }
              setTimeout(() => setIsAnimating(false), 800)
            }}
            title="Colapsar todas las categorías"
            disabled={isAnimating}
          >
            📁 Colapsar
          </button>
          <button 
            className={`control-btn expand-all ${isAnimating ? 'disabled' : ''}`}
            onClick={() => {
              if (isAnimating) return
              setExpandedCategories(new Set(categories.map(cat => cat.id)))
              setIsAnimating(true)
              if (simulation) {
                simulation.alpha(0.7).restart()
              }
              setTimeout(() => setIsAnimating(false), 1200)
            }}
            title="Expandir todas las categorías"
            disabled={isAnimating}
          >
            📂 Expandir
          </button>
          <button 
            className={`control-btn auto-layout ${isAnimating ? 'disabled' : ''}`}
            onClick={() => {
              if (isAnimating || !simulation) return
              setIsAnimating(true)
              
              // Reorganizar nodos automáticamente
              simulation
                .force('charge', d3.forceManyBody().strength(-300))
                .force('link', d3.forceLink(links).id(d => d.id).distance(100))
                .alpha(0.8)
                .restart()
              
              setTimeout(() => {
                simulation
                  .force('charge', d3.forceManyBody().strength(-200))
                  .force('link', d3.forceLink(links).id(d => d.id).distance(80))
                setIsAnimating(false)
              }, 2000)
            }}
            title="Reorganizar automáticamente"
            disabled={isAnimating}
          >
            🎲 Auto Layout
          </button>
          {selectedCategory && (
            <button 
              className={`control-btn focus-category ${isAnimating ? 'disabled' : ''}`}
              onClick={() => {
                if (isAnimating) return
                const categoryNode = nodes.find(n => n.type === 'category' && n.categoryId === selectedCategory.id)
                if (categoryNode && window.focusOnNode) {
                  window.focusOnNode(categoryNode.id)
                }
              }}
              title={`Enfocar en ${selectedCategory.name}`}
              disabled={isAnimating}
            >
              🎯 Enfocar
            </button>
          )}
          <button 
            className={`control-btn search-mode ${searchHighlight.size > 0 ? 'active' : ''} ${isAnimating ? 'disabled' : ''}`}
            onClick={() => {
              if (isAnimating) return
              // Función de búsqueda rápida (placeholder)
              const searchTerm = prompt('Buscar herramienta o categoría:')
              if (searchTerm) {
                const matches = new Set()
                nodes.forEach(node => {
                  if (node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (node.description && node.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
                    matches.add(node.id)
                  }
                })
                setSearchHighlight(matches)
                
                // Enfocar en el primer resultado
                if (matches.size > 0 && window.focusOnNode) {
                  const firstMatch = Array.from(matches)[0]
                  window.focusOnNode(firstMatch)
                }
              } else {
                setSearchHighlight(new Set())
              }
            }}
            title="Buscar herramientas"
            disabled={isAnimating}
          >
            🔍 Buscar
          </button>
        </div>
      </div>
      
      <div className="graph-container">
        <svg ref={svgRef} className="graph-svg"></svg>
      </div>

      {selectedCategory && (
        <div className="selected-category-info">
          <div className="category-header">
            <span className="category-icon">{selectedCategory.icon || '📁'}</span>
            <h3>{selectedCategory.name}</h3>
            <button 
              className="close-btn"
              onClick={() => onCategorySelect && onCategorySelect(null)}
              title="Cerrar información"
            >
              ✕
            </button>
          </div>
          <p className="category-description">{selectedCategory.description}</p>
          <div className="category-stats">
            <div className="stat-item">
              <span className="stat-label">Herramientas:</span>
              <span className="stat-value">{tools.filter(tool => tool.category === selectedCategory.id).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Verificadas:</span>
              <span className="stat-value verified">
                {tools.filter(tool => tool.category === selectedCategory.id && tool.verified).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Estado:</span>
              <span className={`stat-value ${expandedCategories.has(selectedCategory.id) ? 'expanded' : 'collapsed'}`}>
                {expandedCategories.has(selectedCategory.id) ? 'Expandida' : 'Colapsada'}
              </span>
            </div>
          </div>
        </div>
      )}

      {hoveredNode && (
        <div className="hovered-node-info">
          <div className="node-preview">
            <span className="node-icon">{hoveredNode.icon}</span>
            <div className="node-details">
              <strong>{hoveredNode.name}</strong>
              <span className="node-type">{hoveredNode.type === 'central' ? 'Centro' : hoveredNode.type === 'category' ? 'Categoría' : 'Herramienta'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="graph-legend">
        <h4>🗺️ Leyenda del Mapa</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-node central">
              <span>🎯</span>
            </div>
            <span>Centro OSINTArgy</span>
          </div>
          <div className="legend-item">
            <div className="legend-node category">
              <span>📁</span>
            </div>
            <span>Categorías ({categories.length})</span>
          </div>
          <div className="legend-item">
            <div className="legend-node tool">
              <span>🔧</span>
            </div>
            <span>Herramientas ({tools.length})</span>
          </div>
          <div className="legend-item">
            <div className="legend-node verified">
              <span>✅</span>
            </div>
            <span>Verificadas ({tools.filter(t => t.verified).length})</span>
          </div>
        </div>
      </div>

      <div className="graph-instructions">
        <h4>🎮 Controles Interactivos</h4>
        <div className="instruction-grid">
          <div className="instruction-item">
            <span className="instruction-icon">👆</span>
            <span>Click en categoría: Expandir/Colapsar</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🔗</span>
            <span>Click en herramienta: Abrir URL</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🎯</span>
            <span>Click en centro: Resetear vista</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🖱️</span>
            <span>Arrastrar: Mover nodos</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🔍</span>
            <span>Scroll: Zoom in/out</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">👀</span>
            <span>Hover: Ver información</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreeView