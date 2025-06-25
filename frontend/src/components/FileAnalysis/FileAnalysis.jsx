import React, { useState, useEffect, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  Image, 
  MapPin, 
  Calendar, 
  Camera, 
  User, 
  Download,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  FileImage,
  File
} from 'lucide-react'
import toast from 'react-hot-toast'
import './FileAnalysis.css'

const FileAnalysis = () => {
  const [file, setFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [supportedTypes, setSupportedTypes] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Cargar tipos de archivo soportados al montar el componente
  useEffect(() => {
    loadSupportedTypes()
  }, [])

  const loadSupportedTypes = async () => {
    try {
      const response = await fetch('/api/file-analysis/supported-types')
      const data = await response.json()
      
      if (data.success) {
        setSupportedTypes(data.data)
      }
    } catch (error) {
      console.error('Error cargando tipos soportados:', error)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Tipo de archivo no soportado')
      return
    }

    // Validar tamaño (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (máximo 50MB)')
      return
    }

    setFile(selectedFile)
    setResults(null)
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const analyzeFile = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo')
      return
    }

    setIsAnalyzing(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/file-analysis/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.data)
        toast.success('Análisis completado exitosamente')
      } else {
        toast.error(data.error || 'Error en el análisis')
      }
    } catch (error) {
      console.error('Error analizando archivo:', error)
      toast.error('Error de conexión')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const downloadResults = () => {
    if (!results) return

    const reportLines = [
      '='.repeat(60),
      '           REPORTE DE ANÁLISIS DE ARCHIVOS',
      '                    OSINTArgy v1.0',
      '='.repeat(60),
      '',
      `📁 ARCHIVO ANALIZADO: ${results.filename}`,
      `📅 FECHA DE ANÁLISIS: ${new Date(results.analyzed_at).toLocaleString('es-AR')}`,
      `📊 TIPO: ${results.type.toUpperCase()}`,
      `📏 TAMAÑO: ${(results.size / 1024 / 1024).toFixed(2)} MB`,
      `🔧 MIME TYPE: ${results.mimetype}`,
      ''
    ]

    // Agregar metadatos de imagen si existen
    if (results.image_metadata) {
      const img = results.image_metadata
      reportLines.push('🖼️ METADATOS DE IMAGEN')
      reportLines.push('-'.repeat(30))
      reportLines.push(`• Dimensiones: ${img.width}x${img.height} píxeles`)
      reportLines.push(`• Formato: ${img.format?.toUpperCase()}`)
      reportLines.push(`• Canales: ${img.channels}`)
      reportLines.push(`• Densidad: ${img.density} DPI`)
      
      if (img.exif && Object.keys(img.exif).length > 0) {
        reportLines.push('')
        reportLines.push('📷 DATOS EXIF')
        reportLines.push('-'.repeat(20))
        
        Object.entries(img.exif).forEach(([key, value]) => {
          if (value) {
            reportLines.push(`• ${key}: ${value}`)
          }
        })
      }

      if (img.gps) {
        reportLines.push('')
        reportLines.push('🌍 COORDENADAS GPS')
        reportLines.push('-'.repeat(20))
        reportLines.push(`• Latitud: ${img.gps.latitude}`)
        reportLines.push(`• Longitud: ${img.gps.longitude}`)
        if (img.gps.altitude) reportLines.push(`• Altitud: ${img.gps.altitude}m`)
        if (img.gps.direction) reportLines.push(`• Dirección: ${img.gps.direction}°`)
      }
    }

    // Agregar metadatos de documento si existen
    if (results.document_metadata) {
      const doc = results.document_metadata
      reportLines.push('📄 METADATOS DEL DOCUMENTO')
      reportLines.push('-'.repeat(30))
      
      if (doc.pages) reportLines.push(`• Páginas: ${doc.pages}`)
      if (doc.author) reportLines.push(`• Autor: ${doc.author}`)
      if (doc.creator) reportLines.push(`• Creador: ${doc.creator}`)
      if (doc.producer) reportLines.push(`• Productor: ${doc.producer}`)
      if (doc.title) reportLines.push(`• Título: ${doc.title}`)
      if (doc.subject) reportLines.push(`• Asunto: ${doc.subject}`)
      if (doc.creation_date) reportLines.push(`• Fecha de creación: ${doc.creation_date}`)
      if (doc.modification_date) reportLines.push(`• Fecha de modificación: ${doc.modification_date}`)
      if (doc.text_length) reportLines.push(`• Longitud del texto: ${doc.text_length} caracteres`)
    }

    reportLines.push('')
    reportLines.push('='.repeat(60))
    reportLines.push('Reporte generado por OSINTArgy')
    reportLines.push('='.repeat(60))

    const reportText = reportLines.join('\n')
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `file-analysis-${results.filename}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Reporte descargado')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type === 'image') return <FileImage size={24} />
    return <File size={24} />
  }

  return (
    <div className="file-analysis">
      <div className="file-analysis__container">
        {/* Header */}
        <div className="file-analysis__header">
          <div className="file-analysis__title">
            <Upload className="file-analysis__icon" size={32} />
            <div>
              <h1>Análisis de Archivos</h1>
              <p>Extrae metadatos de imágenes y documentos para investigaciones OSINT</p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="file-analysis__upload">
          <div 
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".jpg,.jpeg,.png,.pdf,.docx"
              style={{ display: 'none' }}
            />
            
            <div className="upload-content">
              <Upload size={48} className="upload-icon" />
              <h3>Arrastra un archivo aquí o haz clic para seleccionar</h3>
              <p>Soporta: JPG, PNG, PDF, DOCX (máximo 50MB)</p>
            </div>
          </div>

          {file && (
            <div className="selected-file">
              <div className="file-info">
                {getFileIcon(file.type.split('/')[0])}
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    {formatFileSize(file.size)} • {file.type}
                  </div>
                </div>
              </div>
              <button
                onClick={analyzeFile}
                disabled={isAnalyzing}
                className="analyze-button"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="animate-spin" size={16} />
                    Analizando...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Analizar Archivo
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Supported Types Info */}
        {supportedTypes && (
          <div className="supported-types">
            <h3>Tipos de archivo soportados</h3>
            <div className="types-grid">
              <div className="type-card">
                <Image size={24} />
                <h4>Imágenes</h4>
                <p>{supportedTypes.images.formats.join(', ')}</p>
                <ul>
                  {supportedTypes.images.features.filter(feature => !feature.includes('Búsqueda inversa')).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="type-card">
                <FileText size={24} />
                <h4>Documentos</h4>
                <p>{supportedTypes.documents.formats.join(', ')}</p>
                <ul>
                  {supportedTypes.documents.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isAnalyzing && (
          <div className="file-analysis__loading">
            <div className="loading-spinner">
              <Clock className="animate-spin" size={32} />
            </div>
            <p>Analizando archivo y extrayendo metadatos...</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="file-analysis__results">
            <div className="results-header">
              <h3>Resultados del Análisis</h3>
              <div className="results-actions">
                <button
                  onClick={downloadResults}
                  className="action-button action-button--primary"
                >
                  <Download size={16} />
                  Descargar Reporte
                </button>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                  className="action-button action-button--secondary"
                >
                  <Copy size={16} />
                  Copiar Datos
                </button>
              </div>
            </div>

            {/* Basic File Info */}
            <div className="results-section">
              <h4>📁 Información del Archivo</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{results.filename}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tamaño:</span>
                  <span className="info-value">{formatFileSize(results.size)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tipo:</span>
                  <span className="info-value">{results.mimetype}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Analizado:</span>
                  <span className="info-value">{new Date(results.analyzed_at).toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* Image Metadata */}
            {results.image_metadata && (
              <div className="results-section">
                <h4>🖼️ Metadatos de Imagen</h4>
                <div className="image-metadata">
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="metadata-label">Dimensiones:</span>
                      <span className="metadata-value">
                        {results.image_metadata.width} × {results.image_metadata.height} píxeles
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Formato:</span>
                      <span className="metadata-value">{results.image_metadata.format?.toUpperCase()}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Canales:</span>
                      <span className="metadata-value">{results.image_metadata.channels}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Densidad:</span>
                      <span className="metadata-value">{results.image_metadata.density} DPI</span>
                    </div>
                  </div>

                  {/* EXIF Data */}
                  {results.image_metadata.exif && Object.keys(results.image_metadata.exif).length > 0 && (
                    <div className="exif-data">
                      <h5>📷 Datos EXIF</h5>
                      <div className="exif-grid">
                        {Object.entries(results.image_metadata.exif).map(([key, value]) => (
                          value && (
                            <div key={key} className="exif-item">
                              <span className="exif-label">{key}:</span>
                              <span className="exif-value">{String(value)}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GPS Data */}
                  {results.image_metadata.gps && (
                    <div className="gps-data">
                      <h5>🌍 Coordenadas GPS</h5>
                      <div className="gps-info">
                        <div className="gps-coords">
                          <MapPin size={16} />
                          <span>
                            {results.image_metadata.gps.latitude}, {results.image_metadata.gps.longitude}
                          </span>
                          <button
                            onClick={() => copyToClipboard(`${results.image_metadata.gps.latitude}, ${results.image_metadata.gps.longitude}`)}
                            className="copy-coords"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${results.image_metadata.gps.latitude},${results.image_metadata.gps.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="maps-link"
                        >
                          <ExternalLink size={14} />
                          Ver en Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Metadata */}
            {results.document_metadata && (
              <div className="results-section">
                <h4>📄 Metadatos del Documento</h4>
                <div className="document-metadata">
                  <div className="metadata-grid">
                    {results.document_metadata.pages && (
                      <div className="metadata-item">
                        <span className="metadata-label">Páginas:</span>
                        <span className="metadata-value">{results.document_metadata.pages}</span>
                      </div>
                    )}
                    {results.document_metadata.author && (
                      <div className="metadata-item">
                        <span className="metadata-label">Autor:</span>
                        <span className="metadata-value">{results.document_metadata.author}</span>
                      </div>
                    )}
                    {results.document_metadata.creator && (
                      <div className="metadata-item">
                        <span className="metadata-label">Creador:</span>
                        <span className="metadata-value">{results.document_metadata.creator}</span>
                      </div>
                    )}
                    {results.document_metadata.producer && (
                      <div className="metadata-item">
                        <span className="metadata-label">Productor:</span>
                        <span className="metadata-value">{results.document_metadata.producer}</span>
                      </div>
                    )}
                    {results.document_metadata.title && (
                      <div className="metadata-item">
                        <span className="metadata-label">Título:</span>
                        <span className="metadata-value">{results.document_metadata.title}</span>
                      </div>
                    )}
                    {results.document_metadata.creation_date && (
                      <div className="metadata-item">
                        <span className="metadata-label">Fecha de creación:</span>
                        <span className="metadata-value">{results.document_metadata.creation_date}</span>
                      </div>
                    )}
                    {results.document_metadata.text_length && (
                      <div className="metadata-item">
                        <span className="metadata-label">Longitud del texto:</span>
                        <span className="metadata-value">{results.document_metadata.text_length} caracteres</span>
                      </div>
                    )}
                  </div>

                  {results.document_metadata.text_preview && (
                    <div className="text-preview">
                      <h5>📝 Vista previa del texto</h5>
                      <div className="preview-content">
                        {results.document_metadata.text_preview}
                        {results.document_metadata.text_length > 500 && '...'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}

export default FileAnalysis
