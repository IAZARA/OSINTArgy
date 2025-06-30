import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Image, 
  Mail, 
  Globe, 
  Shield, 
  Users, 
  Database,
  Eye,
  Link,
  Code,
  Zap
} from 'lucide-react'
import './OSINTMindMap.css'

const OSINTMindMap = () => {
  const svgRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Datos del mapa mental OSINT
  const mindMapData = {
    name: "OSINT",
    icon: Eye,
    description: "Intelligence de Fuentes Abiertas",
    category: "root",
    children: [
      {
        name: "Búsqueda",
        icon: Search,
        description: "Técnicas de búsqueda avanzada",
        category: "search",
        children: [
          { name: "Google Dorks", icon: Code, description: "Consultas especializadas para encontrar información específica", category: "technique" },
          { name: "Bing", icon: Globe, description: "Motor de búsqueda de Microsoft", category: "tool" },
          { name: "DuckDuckGo", icon: Shield, description: "Búsqueda privada y segura", category: "tool" },
          { name: "Yandex", icon: Search, description: "Motor de búsqueda ruso, útil para imágenes", category: "tool" }
        ]
      },
      {
        name: "Redes Sociales",
        icon: Users,
        description: "Investigación en plataformas sociales",
        category: "social",
        children: [
          { name: "Facebook", icon: Users, description: "Red social principal, Graph Search", category: "platform" },
          { name: "Twitter/X", icon: Users, description: "Búsqueda avanzada de tweets", category: "platform" },
          { name: "LinkedIn", icon: Users, description: "Red profesional, información laboral", category: "platform" },
          { name: "Instagram", icon: Image, description: "Fotos y ubicaciones", category: "platform" },
          { name: "TikTok", icon: Users, description: "Videos virales y tendencias", category: "platform" }
        ]
      },
      {
        name: "Imágenes",
        icon: Image,
        description: "Análisis y verificación de imágenes",
        category: "images",
        children: [
          { name: "Google Images", icon: Search, description: "Búsqueda inversa de imágenes", category: "tool" },
          { name: "TinEye", icon: Eye, description: "Motor de búsqueda inversa especializado", category: "tool" },
          { name: "Exif Data", icon: Database, description: "Metadatos de imágenes", category: "technique" },
          { name: "FotoForensics", icon: Shield, description: "Análisis de manipulación de imágenes", category: "tool" }
        ]
      },
      {
        name: "Emails",
        icon: Mail,
        description: "Verificación y análisis de correos",
        category: "email",
        children: [
          { name: "Hunter.io", icon: Search, description: "Búsqueda de emails corporativos", category: "tool" },
          { name: "Have I Been Pwned", icon: Shield, description: "Verificación de brechas de datos", category: "tool" },
          { name: "Email Headers", icon: Code, description: "Análisis de headers de correo", category: "technique" },
          { name: "SPF/DKIM", icon: Shield, description: "Verificación de autenticidad", category: "technique" }
        ]
      },
      {
        name: "Dominios & IPs",
        icon: Globe,
        description: "Investigación de infraestructura",
        category: "infrastructure",
        children: [
          { name: "Whois", icon: Database, description: "Información de registro de dominios", category: "technique" },
          { name: "Shodan", icon: Search, description: "Motor de búsqueda para dispositivos IoT", category: "tool" },
          { name: "Censys", icon: Eye, description: "Escaneo de internet y certificados", category: "tool" },
          { name: "DNS Records", icon: Link, description: "Registros del sistema de nombres de dominio", category: "technique" }
        ]
      },
      {
        name: "Herramientas",
        icon: Zap,
        description: "Utilidades y frameworks OSINT",
        category: "tools",
        children: [
          { name: "Maltego", icon: Link, description: "Análisis de enlaces y relaciones", category: "tool" },
          { name: "SpiderFoot", icon: Search, description: "Automatización de reconocimiento", category: "tool" },
          { name: "TheHarvester", icon: Database, description: "Recopilación de información", category: "tool" },
          { name: "OSINT Framework", icon: Globe, description: "Colección de herramientas OSINT", category: "tool" }
        ]
      }
    ]
  }

  // Colores por categoría
  const categoryColors = {
    root: '#3498db',
    search: '#e74c3c',
    social: '#9b59b6',
    images: '#f39c12',
    email: '#2ecc71',
    infrastructure: '#34495e',
    tools: '#e67e22',
    technique: '#1abc9c',
    tool: '#95a5a6',
    platform: '#8e44ad'
  }

  useEffect(() => {
    drawMindMap()
  }, [searchTerm])

  const drawMindMap = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 1000
    const height = 700
    const centerX = width / 2
    const centerY = height / 2

    // Configurar zoom
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoom)

    const container = svg.append('g')

    // Preparar datos jerárquicos
    const root = d3.hierarchy(mindMapData)
    
    // Filtrar nodos según búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      root.each(d => {
        d.visible = d.data.name.toLowerCase().includes(searchLower) ||
                   d.data.description.toLowerCase().includes(searchLower)
      })
    } else {
      root.each(d => { d.visible = true })
    }

    // Layout radial
    const angleStep = (2 * Math.PI) / root.children.length
    
    root.children.forEach((child, i) => {
      const angle = i * angleStep - Math.PI / 2
      const distance = 200
      child.x = centerX + Math.cos(angle) * distance
      child.y = centerY + Math.sin(angle) * distance
      
      // Posicionar subnodos
      if (child.children) {
        const subAngleStep = Math.PI / (child.children.length + 1)
        const startAngle = angle - Math.PI / 3
        
        child.children.forEach((subchild, j) => {
          const subAngle = startAngle + (j + 1) * subAngleStep
          const subDistance = 120
          subchild.x = child.x + Math.cos(subAngle) * subDistance
          subchild.y = child.y + Math.sin(subAngle) * subDistance
        })
      }
    })

    root.x = centerX
    root.y = centerY

    // Dibujar enlaces
    const links = []
    root.each(d => {
      if (d.parent && d.visible && d.parent.visible) {
        links.push({ source: d.parent, target: d })
      }
    })

    container.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', '#bdc3c7')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6)

    // Dibujar nodos
    const nodeGroups = container.selectAll('.node')
      .data(root.descendants().filter(d => d.visible))
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d.data)
      })
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d => getNodeRadius(d) * 1.2)
      })
      .on('mouseout', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d => getNodeRadius(d))
      })

    // Círculos de nodos
    nodeGroups.append('circle')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => categoryColors[d.data.category] || '#95a5a6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))')

    // Iconos de nodos (simulados con texto)
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', d => d.depth === 0 ? '20px' : '14px')
      .attr('font-weight', 'bold')
      .text(d => d.data.name.substring(0, 2).toUpperCase())

    // Etiquetas de nodos
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeRadius(d) + 20)
      .attr('fill', '#2c3e50')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(d => d.data.name)

    // Animación de entrada
    nodeGroups.style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .style('opacity', 1)
  }

  const getNodeRadius = (d) => {
    if (d.depth === 0) return 40
    if (d.depth === 1) return 30
    return 20
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const resetZoom = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().duration(750).call(
      d3.zoom().transform,
      d3.zoomIdentity
    )
    setZoomLevel(1)
  }

  return (
    <div className="osint-mindmap">
      <div className="mindmap-header">
        <h1>Mapa Mental OSINT Interactivo</h1>
        <p>Explora las diferentes categorías y herramientas de OSINT</p>
      </div>

      <div className="mindmap-controls">
        <div className="search-control">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar en el mapa mental..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="zoom-controls">
          <span className="zoom-level">Zoom: {Math.round(zoomLevel * 100)}%</span>
          <button onClick={resetZoom} className="reset-zoom">
            Centrar
          </button>
        </div>
      </div>

      <div className="mindmap-container">
        <svg
          ref={svgRef}
          width="100%"
          height="700"
          viewBox="0 0 1000 700"
          className="mindmap-svg"
        />
        
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              className="node-details"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="node-details-header">
                <div className="node-icon">
                  {React.createElement(selectedNode.icon, { size: 24 })}
                </div>
                <h3>{selectedNode.name}</h3>
                <button 
                  className="close-details"
                  onClick={() => setSelectedNode(null)}
                >
                  ×
                </button>
              </div>
              
              <p className="node-description">
                {selectedNode.description}
              </p>
              
              <div className="node-category">
                <span className={`category-badge ${selectedNode.category}`}>
                  {selectedNode.category}
                </span>
              </div>
              
              {selectedNode.children && (
                <div className="node-children">
                  <h4>Subcategorías:</h4>
                  <div className="children-list">
                    {selectedNode.children.map((child, index) => (
                      <div key={index} className="child-item">
                        <span className="child-name">{child.name}</span>
                        <span className="child-description">{child.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mindmap-legend">
        <h4>Leyenda</h4>
        <div className="legend-items">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: color }}
              />
              <span>{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OSINTMindMap