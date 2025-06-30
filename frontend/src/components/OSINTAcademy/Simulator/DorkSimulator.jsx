import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Target, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Code,
  Eye,
  Award,
  Zap
} from 'lucide-react'
import './DorkSimulator.css'

const DorkSimulator = () => {
  const [currentQuery, setCurrentQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('basic')
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)

  // Base de conocimientos de Google Dorks
  const dorkCategories = {
    basic: {
      name: 'Básico',
      icon: BookOpen,
      color: '#3498db'
    },
    files: {
      name: 'Archivos',
      icon: Eye,
      color: '#e74c3c'
    },
    security: {
      name: 'Seguridad',
      icon: Target,
      color: '#e67e22'
    },
    social: {
      name: 'Social Media',
      icon: Search,
      color: '#9b59b6'
    }
  }

  const dorkChallenges = {
    basic: [
      {
        id: 'site_operator',
        title: 'Buscar en un sitio específico',
        description: 'Encuentra páginas que contengan "manual" solo en el sitio wikipedia.org',
        expectedPattern: /site:wikipedia\.org.*manual|manual.*site:wikipedia\.org/i,
        hint: 'Usa el operador site: seguido del dominio',
        solution: 'site:wikipedia.org manual',
        points: 100
      },
      {
        id: 'intitle_operator',
        title: 'Buscar en títulos',
        description: 'Encuentra páginas que tengan "login" en el título',
        expectedPattern: /intitle:login|intitle:"login"/i,
        hint: 'Usa el operador intitle: para buscar en los títulos de las páginas',
        solution: 'intitle:login',
        points: 150
      },
      {
        id: 'inurl_operator',
        title: 'Buscar en URLs',
        description: 'Encuentra páginas que tengan "admin" en la URL',
        expectedPattern: /inurl:admin|inurl:"admin"/i,
        hint: 'Usa el operador inurl: para buscar en las URLs',
        solution: 'inurl:admin',
        points: 150
      }
    ],
    files: [
      {
        id: 'filetype_pdf',
        title: 'Buscar archivos PDF',
        description: 'Encuentra documentos PDF que contengan "manual de usuario"',
        expectedPattern: /filetype:pdf.*manual.*usuario|manual.*usuario.*filetype:pdf/i,
        hint: 'Usa filetype:pdf para buscar solo archivos PDF',
        solution: 'filetype:pdf "manual de usuario"',
        points: 200
      },
      {
        id: 'filetype_excel',
        title: 'Buscar hojas de cálculo',
        description: 'Encuentra archivos Excel (.xlsx) con "presupuesto"',
        expectedPattern: /filetype:xlsx.*presupuesto|presupuesto.*filetype:xlsx/i,
        hint: 'Usa filetype:xlsx para archivos Excel',
        solution: 'filetype:xlsx presupuesto',
        points: 200
      }
    ],
    security: [
      {
        id: 'directory_listing',
        title: 'Directorios listados',
        description: 'Encuentra páginas con "Index of" para detectar directorios expuestos',
        expectedPattern: /intitle:"index of"|"index of"/i,
        hint: 'Busca el texto "Index of" que aparece en directorios expuestos',
        solution: 'intitle:"Index of"',
        points: 300
      },
      {
        id: 'config_files',
        title: 'Archivos de configuración',
        description: 'Encuentra archivos .config expuestos públicamente',
        expectedPattern: /filetype:config.*site:|site:.*filetype:config|filetype:config/i,
        hint: 'Usa filetype:config para encontrar archivos de configuración',
        solution: 'filetype:config',
        points: 350
      }
    ],
    social: [
      {
        id: 'twitter_search',
        title: 'Buscar en Twitter',
        description: 'Encuentra tweets en Twitter sobre "OSINT"',
        expectedPattern: /site:twitter\.com.*osint|osint.*site:twitter\.com/i,
        hint: 'Usa site:twitter.com para buscar solo en Twitter',
        solution: 'site:twitter.com OSINT',
        points: 250
      }
    ]
  }

  // Resultados simulados para demostración
  const simulatedResults = [
    {
      title: 'Manual de Usuario - Wikipedia',
      url: 'https://es.wikipedia.org/wiki/Manual_de_usuario',
      snippet: 'Un manual de usuario es un documento técnico destinado a dar asistencia a las personas que utilizan un sistema en particular...'
    },
    {
      title: 'Login - Sistema Administrativo',
      url: 'https://ejemplo.com/admin/login',
      snippet: 'Página de acceso al sistema administrativo. Ingrese sus credenciales para continuar...'
    },
    {
      title: 'Manual de Usuario.pdf',
      url: 'https://empresa.com/docs/manual_usuario.pdf',
      snippet: 'Documento PDF con instrucciones completas para el uso del software...'
    }
  ]

  useEffect(() => {
    if (selectedCategory && dorkChallenges[selectedCategory].length > 0) {
      const uncompletedChallenges = dorkChallenges[selectedCategory].filter(
        challenge => !completedChallenges.includes(challenge.id)
      )
      if (uncompletedChallenges.length > 0) {
        setCurrentChallenge(uncompletedChallenges[0])
      } else {
        setCurrentChallenge(null)
      }
    }
  }, [selectedCategory, completedChallenges])

  const handleQuerySubmit = (e) => {
    e.preventDefault()
    if (!currentChallenge || !currentQuery.trim()) return

    const isCorrect = currentChallenge.expectedPattern.test(currentQuery)
    
    if (isCorrect) {
      setFeedback({
        type: 'success',
        message: '¡Excelente! Has resuelto el desafío correctamente.',
        points: currentChallenge.points
      })
      setCompletedChallenges([...completedChallenges, currentChallenge.id])
      setScore(score + currentChallenge.points)
      
      setTimeout(() => {
        setFeedback(null)
        setCurrentQuery('')
        setShowHint(false)
      }, 3000)
    } else {
      setFeedback({
        type: 'error',
        message: 'No es exactamente lo que buscamos. ¡Sigue intentando!',
        points: 0
      })
      
      setTimeout(() => {
        setFeedback(null)
      }, 3000)
    }
  }

  const getRandomResult = () => {
    return simulatedResults[Math.floor(Math.random() * simulatedResults.length)]
  }

  const handleHint = () => {
    setShowHint(!showHint)
  }

  const formatQuery = (query) => {
    // Resaltar operadores especiales
    return query.replace(
      /(site:|intitle:|inurl:|filetype:|intext:)/gi,
      '<span class="operator">$1</span>'
    )
  }

  return (
    <div className="dork-simulator">
      <div className="simulator-header">
        <h1>Simulador de Google Dorks</h1>
        <p>Aprende y practica técnicas de búsqueda avanzada de forma segura</p>
        <div className="score-display">
          <Award size={20} />
          <span>{score} puntos</span>
        </div>
      </div>

      {/* Categorías */}
      <div className="categories-section">
        <h3>Categorías de Dorks</h3>
        <div className="categories-grid">
          {Object.entries(dorkCategories).map(([key, category]) => (
            <button
              key={key}
              className={`category-card ${selectedCategory === key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(key)}
              style={{ borderColor: category.color }}
            >
              <category.icon size={24} style={{ color: category.color }} />
              <span>{category.name}</span>
              <div className="completed-indicator">
                {dorkChallenges[key].filter(c => completedChallenges.includes(c.id)).length}/
                {dorkChallenges[key].length}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Desafío actual */}
      {currentChallenge && (
        <motion.div
          className="challenge-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="challenge-header">
            <h3>{currentChallenge.title}</h3>
            <div className="challenge-points">
              <Zap size={16} />
              <span>{currentChallenge.points} pts</span>
            </div>
          </div>
          
          <p className="challenge-description">
            {currentChallenge.description}
          </p>

          <form onSubmit={handleQuerySubmit} className="search-form">
            <div className="search-container">
              <div className="google-mockup">
                <div className="google-logo">Google</div>
                <div className="search-input-container">
                  <input
                    type="text"
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    placeholder="Introduce tu Google Dork aquí..."
                    className="dork-input"
                  />
                  <button type="submit" className="search-button">
                    <Search size={20} />
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="challenge-actions">
            <button 
              type="button" 
              onClick={handleHint}
              className="hint-button"
            >
              <Lightbulb size={16} />
              {showHint ? 'Ocultar Pista' : 'Ver Pista'}
            </button>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                className="hint-box"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Lightbulb size={16} />
                <span>{currentChallenge.hint}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                className={`feedback ${feedback.type}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <XCircle size={20} />
                )}
                <span>{feedback.message}</span>
                {feedback.points > 0 && (
                  <span className="points">+{feedback.points} pts</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resultados simulados */}
          {currentQuery && (
            <motion.div
              className="simulated-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h4>Resultados simulados:</h4>
              <div className="result-item">
                <h5>{getRandomResult().title}</h5>
                <p className="result-url">{getRandomResult().url}</p>
                <p className="result-snippet">{getRandomResult().snippet}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Referencia rápida */}
      <div className="reference-section">
        <h3>Referencia Rápida de Operadores</h3>
        <div className="operators-grid">
          <div className="operator-card">
            <code>site:</code>
            <span>Buscar en un sitio específico</span>
            <div className="example">site:wikipedia.org</div>
          </div>
          <div className="operator-card">
            <code>filetype:</code>
            <span>Buscar tipo de archivo específico</span>
            <div className="example">filetype:pdf</div>
          </div>
          <div className="operator-card">
            <code>intitle:</code>
            <span>Buscar en títulos de página</span>
            <div className="example">intitle:login</div>
          </div>
          <div className="operator-card">
            <code>inurl:</code>
            <span>Buscar en URLs</span>
            <div className="example">inurl:admin</div>
          </div>
          <div className="operator-card">
            <code>intext:</code>
            <span>Buscar en contenido de página</span>
            <div className="example">intext:"password"</div>
          </div>
          <div className="operator-card">
            <code>" "</code>
            <span>Buscar frase exacta</span>
            <div className="example">"manual de usuario"</div>
          </div>
        </div>
      </div>

      {/* Progreso */}
      <div className="progress-section">
        <h3>Tu Progreso</h3>
        <div className="progress-stats">
          {Object.entries(dorkChallenges).map(([key, challenges]) => {
            const completed = challenges.filter(c => completedChallenges.includes(c.id)).length
            const total = challenges.length
            const percentage = (completed / total) * 100
            
            return (
              <div key={key} className="progress-item">
                <div className="progress-header">
                  <span>{dorkCategories[key].name}</span>
                  <span>{completed}/{total}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: dorkCategories[key].color 
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DorkSimulator