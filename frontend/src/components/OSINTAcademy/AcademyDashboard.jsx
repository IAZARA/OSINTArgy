import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Target, 
  Brain, 
  Search, 
  Clock,
  Unlock,
  Play
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import './AcademyDashboard.css'

const AcademyDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [completedModules, setCompletedModules] = useState([])
  const [selectedAcademy, setSelectedAcademy] = useState(location.state?.selectedAcademy || null)

  // Academias disponibles
  const academies = [
    {
      id: 'osint',
      title: 'Academia OSINT',
      description: 'Aprende las técnicas de inteligencia de fuentes abiertas de forma interactiva',
      icon: Search,
      modules: 5,
      duration: '2.5 horas',
      difficulty: 'principiante',
      color: 'primary'
    }
    // Aquí puedes agregar más academias en el futuro
  ]

  // Módulos OSINT
  const osintModules = [
    {
      id: 'modulo1',
      title: 'Módulo 1: Introducción a OSINT',
      description: 'Fundamentos de la inteligencia de fuentes abiertas - qué es y para qué sirve',
      icon: BookOpen,
      duration: '20 min',
      difficulty: 'principiante',
      type: 'lesson'
    },
    {
      id: 'modulo2',
      title: 'Módulo 2: Google Dorks y Búsqueda Avanzada',
      description: 'Domina Google Dorks con mi generador automático de consultas avanzadas',
      icon: Search,
      duration: '25 min',
      difficulty: 'intermedio',
      type: 'lesson'
    },
    {
      id: 'modulo3',
      title: 'Módulo 3: Búsqueda en Redes Sociales',
      description: 'Técnicas avanzadas de investigación en plataformas sociales con ejemplos interactivos',
      icon: Target,
      duration: '30 min',
      difficulty: 'intermedio',
      type: 'lesson'
    },
    {
      id: 'modulo4',
      title: 'Módulo 4: Análisis de Imágenes',
      description: 'Geolocalización y verificación de imágenes usando herramientas OSINT',
      icon: Brain,
      duration: '35 min',
      difficulty: 'avanzado',
      type: 'lesson'
    },
    {
      id: 'modulo5',
      title: 'Módulo 5: Mentalidad del Analista',
      description: 'Cómo piensa y trabaja un analista OSINT profesional',
      icon: Brain,
      duration: '25 min',
      difficulty: 'avanzado',
      type: 'lesson'
    },
    {
      id: 'audio-resumen',
      title: 'Audio Resumen',
      description: 'Podcast resumen sobre técnicas y metodologías OSINT',
      icon: Play,
      duration: '7 min',
      difficulty: 'principiante',
      type: 'audio'
    }
  ]

  const handleAcademyClick = (academy) => {
    if (academy.id === 'osint') {
      setSelectedAcademy('osint')
    }
  }

  const handleModuleClick = (module) => {
    if (module.type === 'audio') {
      navigate('/academy/audio')
    } else {
      navigate(`/academy/lesson/${module.id}`)
    }
  }

  const handleBackToAcademies = () => {
    setSelectedAcademy(null)
  }

  const isModuleCompleted = (moduleId) => {
    return completedModules.includes(moduleId)
  }

  return (
    <div className="academy-dashboard">
      {!selectedAcademy ? (
        // Vista principal de academias
        <>
          <div className="academy-header">
            <h1>Academias</h1>
            <p>Elige una academia para comenzar tu formación especializada</p>
          </div>

          <div className="modules-section">
            <div className="academies-container">
              {academies.map((academy) => (
                <div 
                  key={academy.id}
                  className="academy-banner"
                  onClick={() => handleAcademyClick(academy)}
                >
                  <div className="banner-icon">
                    <academy.icon size={48} />
                  </div>
                  
                  <div className="banner-content">
                    <h3>{academy.title}</h3>
                    <p>{academy.description}</p>
                  </div>
                  
                  <div className="banner-arrow">
                    →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Vista de módulos de la academia seleccionada
        <>
          <div className="academy-header">
            <button 
              onClick={handleBackToAcademies}
              className="back-button"
            >
              ← Volver a Academias
            </button>
            <h1>Academia OSINT</h1>
            <p>Aprende las técnicas de inteligencia de fuentes abiertas de forma interactiva</p>
          </div>

          <div className="modules-section">
            <div className="modules-grid">
              {osintModules.map((module) => (
                <div 
                  key={module.id}
                  className={`module-card ${isModuleCompleted(module.id) ? 'completed' : ''}`}
                  onClick={() => handleModuleClick(module)}
                >
                  <div className="module-header">
                    <div className="module-icon">
                      <module.icon size={32} />
                    </div>
                    <div className={`difficulty-badge ${module.difficulty}`}>
                      {module.difficulty}
                    </div>
                  </div>
                  
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  
                  {isModuleCompleted(module.id) && (
                    <div className="completed-indicator">
                      <Unlock size={16} />
                      <span>Completado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AcademyDashboard