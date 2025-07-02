import React, { useState, useEffect, useRef } from 'react'
import { 
  GitBranch, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Home,
  CheckCircle,
  Circle,
  ExternalLink,
  Info,
  ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFlowchartsInfo, getFlowchartById } from '@/data/flowcharts'
import toast from 'react-hot-toast'
import './OSINTFlowcharts.css'

const OSINTFlowcharts = () => {
  const [selectedFlowchart, setSelectedFlowchart] = useState(null)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState(null)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  
  const flowchartsInfo = getFlowchartsInfo()

  // Cargar progreso guardado
  useEffect(() => {
    const savedProgress = localStorage.getItem('osint-flowcharts-progress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        setCompletedSteps(new Set(progress))
      } catch (error) {
        console.error('Error loading saved progress:', error)
      }
    }
  }, [])

  // Guardar progreso
  useEffect(() => {
    localStorage.setItem('osint-flowcharts-progress', JSON.stringify([...completedSteps]))
  }, [completedSteps])

  const handleFlowchartSelect = (flowchartId) => {
    const flowchart = getFlowchartById(flowchartId)
    setSelectedFlowchart(flowchart)
    setSelectedNode(null)
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleBackToSelection = () => {
    setSelectedFlowchart(null)
    setSelectedNode(null)
  }

  const toggleStepCompletion = (nodeId) => {
    const newCompleted = new Set(completedSteps)
    const stepKey = `${selectedFlowchart.id}-${nodeId}`
    
    if (newCompleted.has(stepKey)) {
      newCompleted.delete(stepKey)
      toast.success('Paso marcado como pendiente')
    } else {
      newCompleted.add(stepKey)
      toast.success('Paso marcado como completado')
    }
    
    setCompletedSteps(newCompleted)
  }

  const handleNodeClick = (node) => {
    setSelectedNode(node)
    
    // Si el nodo tiene herramienta interna, abrir en nueva pestaña
    if (node.internal_tool) {
      window.open(node.internal_tool, '_blank')
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const downloadFlowchart = () => {
    if (!selectedFlowchart || !svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    
    const downloadLink = document.createElement('a')
    downloadLink.href = svgUrl
    downloadLink.download = `osint-flowchart-${selectedFlowchart.id}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(svgUrl)
    
    toast.success('Flowchart descargado')
  }

  const getNodeColor = (node) => {
    switch (node.type) {
      case 'start': return '#E74C3C'
      case 'process': return '#3498DB'
      case 'result': return '#27AE60'
      case 'data': return '#F39C12'
      default: return '#95A5A6'
    }
  }

  const isStepCompleted = (nodeId) => {
    return completedSteps.has(`${selectedFlowchart?.id}-${nodeId}`)
  }

  const getCompletionPercentage = () => {
    if (!selectedFlowchart) return 0
    const totalSteps = selectedFlowchart.nodes.length
    const completedCount = selectedFlowchart.nodes.filter(node => 
      isStepCompleted(node.id)
    ).length
    return Math.round((completedCount / totalSteps) * 100)
  }

  if (!selectedFlowchart) {
    return (
      <div className="osint-flowcharts">
        <div className="flowcharts__container">
          {/* Header */}
          <div className="flowcharts__header">
            <div className="flowcharts__title">
              <GitBranch className="flowcharts__icon" size={32} />
              <div>
                <h1>OSINT Flowcharts</h1>
              </div>
            </div>
          </div>

          {/* Grid de Flowcharts */}
          <div className="flowcharts__grid">
            {flowchartsInfo.map((flowchart) => (
              <button
                key={flowchart.id}
                className="flowchart__button"
                onClick={() => handleFlowchartSelect(flowchart.id)}
                style={{ '--accent-color': flowchart.color }}
              >
                <span className="flowchart__button-icon">{flowchart.icon}</span>
                <h3 className="flowchart__button-title">{flowchart.title}</h3>
                <p className="flowchart__button-description">{flowchart.description}</p>
              </button>
            ))}
          </div>

          {/* Información adicional */}
          <div className="flowcharts__info">
            <div className="info__card">
              <Info size={24} />
              <div>
                <h3>¿Cómo usar los Flowcharts?</h3>
                <ul>
                  <li>Selecciona el tipo de investigación que quieres realizar</li>
                  <li>Sigue los pasos del diagrama de flujo de forma secuencial</li>
                  <li>Haz clic en los nodos para ver detalles y herramientas</li>
                  <li>Marca los pasos completados para llevar tu progreso</li>
                  <li>Usa las herramientas integradas de OSINTArgy cuando estén disponibles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="osint-flowcharts">
      <div className="flowcharts__container">
        {/* Header del flowchart específico */}
        <div className="flowchart__header">
          <div className="flowchart__nav">
            <button 
              onClick={handleBackToSelection}
              className="back-button"
            >
              <ArrowLeft size={20} />
              Volver a Flowcharts
            </button>
          </div>
          
          <div className="flowchart__info">
            <span className="flowchart__icon-large">{selectedFlowchart.icon}</span>
            <div>
              <h1>{selectedFlowchart.title}</h1>
              <p>{selectedFlowchart.description}</p>
            </div>
          </div>

          <div className="flowchart__controls">
            <div className="progress-info">
              <span className="progress-percentage">{getCompletionPercentage()}%</span>
              <span className="progress-label">Completado</span>
            </div>
            
            <div className="zoom-controls">
              <button onClick={handleZoomOut} className="control-button">
                <ZoomOut size={16} />
              </button>
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={handleZoomIn} className="control-button">
                <ZoomIn size={16} />
              </button>
              <button onClick={handleReset} className="control-button">
                <Home size={16} />
              </button>
              <button onClick={downloadFlowchart} className="control-button">
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Área del diagrama */}
        <div className="flowchart__diagram-container" ref={containerRef}>
          <svg
            ref={svgRef}
            className="flowchart__svg"
            viewBox="0 0 1200 1200"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#666"
                />
              </marker>
              
              <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
              </linearGradient>
            </defs>
            
            <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
              {/* Conexiones */}
              {selectedFlowchart.connections.map((connection, index) => {
                const fromNode = selectedFlowchart.nodes.find(n => n.id === connection.from)
                const toNode = selectedFlowchart.nodes.find(n => n.id === connection.to)
                
                if (!fromNode || !toNode) return null

                return (
                  <line
                    key={index}
                    x1={fromNode.x + 75}
                    y1={fromNode.y + 30}
                    x2={toNode.x + 75}
                    y2={toNode.y + 30}
                    stroke="#666"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                    className="flowchart__connection"
                  />
                )
              })}

              {/* Nodos */}
              {selectedFlowchart.nodes.map((node) => (
                <g key={node.id} className="flowchart__node-group">
                  {/* Sombra del nodo */}
                  <rect
                    x={node.x + 2}
                    y={node.y + 2}
                    width="150"
                    height="60"
                    rx="8"
                    fill="rgba(0, 0, 0, 0.3)"
                    className="flowchart__node-shadow"
                  />
                  
                  {/* Nodo principal */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width="150"
                    height="60"
                    rx="8"
                    fill={getNodeColor(node)}
                    stroke={selectedNode?.id === node.id ? '#FFD700' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth={selectedNode?.id === node.id ? '3' : '1'}
                    className="flowchart__node"
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Gradiente interno */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width="150"
                    height="30"
                    rx="8"
                    fill="url(#nodeGradient)"
                    className="flowchart__node-highlight"
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  />
                  
                  <text
                    x={node.x + 75}
                    y={node.y + 35}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                    className="flowchart__node-text"
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>

                  {/* Indicador de completado */}
                  <circle
                    cx={node.x + 140}
                    cy={node.y + 10}
                    r="8"
                    fill={isStepCompleted(node.id) ? '#27AE60' : '#95A5A6'}
                    stroke="white"
                    strokeWidth="2"
                    className="completion-indicator"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStepCompletion(node.id)
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {isStepCompleted(node.id) && (
                    <text
                      x={node.x + 140}
                      y={node.y + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      ✓
                    </text>
                  )}

                  {/* Indicador de herramienta interna */}
                  {node.internal_tool && (
                    <>
                      <circle
                        cx={node.x + 10}
                        cy={node.y + 10}
                        r="8"
                        fill="#E67E22"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={node.x + 10}
                        y={node.y + 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
                      >
                        🔧
                      </text>
                    </>
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Panel de información del nodo seleccionado */}
        {selectedNode && (
          <div className="node-info-panel">
            <div className="node-info__header">
              <h3>{selectedNode.label}</h3>
              <button 
                onClick={() => setSelectedNode(null)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="node-info__content">
              <p>{selectedNode.description}</p>
              
              {selectedNode.example && (
                <div className="node-info__example">
                  <strong>Ejemplo:</strong> {selectedNode.example}
                </div>
              )}

              {selectedNode.tools && (
                <div className="node-info__tools">
                  <strong>Herramientas sugeridas:</strong>
                  <ul>
                    {selectedNode.tools.map((tool, index) => (
                      <li key={index}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.internal_tool && (
                <div className="node-info__internal">
                  <Link 
                    to={selectedNode.internal_tool}
                    target="_blank"
                    className="internal-tool-link"
                  >
                    <ExternalLink size={16} />
                    Usar herramienta integrada
                  </Link>
                </div>
              )}

              <div className="node-info__actions">
                <button
                  onClick={() => toggleStepCompletion(selectedNode.id)}
                  className={`completion-button ${isStepCompleted(selectedNode.id) ? 'completed' : ''}`}
                >
                  {isStepCompleted(selectedNode.id) ? (
                    <>
                      <CheckCircle size={16} />
                      Marcar como pendiente
                    </>
                  ) : (
                    <>
                      <Circle size={16} />
                      Marcar como completado
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OSINTFlowcharts