import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Play,
  Search,
  Globe,
  Shield,
  User,
  Eye,
  Target
} from 'lucide-react'
import './LessonViewer.css'

const LessonViewer = () => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quizResults, setQuizResults] = useState({})
  const [showQuizResults, setShowQuizResults] = useState(false)

  // Contenido de los módulos OSINT - Nueva estructura de 5 módulos
  const lessons = {
    modulo1: {
      title: "Módulo 1: Introducción a OSINT",
      description: "Fundamentos de la inteligencia de fuentes abiertas",
      totalSlides: 7, // 6 slides educativas + 1 autoevaluación
      slides: [
        {
          id: 1,
          title: "¿Qué es OSINT?",
          content: `
            <h2>Open Source Intelligence</h2>
            <p><strong>OSINT</strong> significa <em>Open Source Intelligence</em> o Inteligencia de Fuentes Abiertas.</p>
            <p>Es la disciplina que se encarga de <strong>recopilar, analizar y utilizar información</strong> que está disponible públicamente para obtener conocimiento útil.</p>
            <div class="highlight-box">
              <p>💡 <strong>Punto clave:</strong> OSINT usa SOLO información pública, no requiere hacking ni acceso privilegiado</p>
            </div>
          `,
          interactive: {
            type: 'icons',
            items: [
              { icon: Search, label: 'Búsqueda' },
              { icon: Eye, label: 'Observación' },
              { icon: Globe, label: 'Fuentes Públicas' },
              { icon: BookOpen, label: 'Análisis' }
            ]
          }
        },
        {
          id: 2,
          title: "Fuentes de Información OSINT",
          content: `
            <h2>¿Dónde encontramos información OSINT?</h2>
            <p>Las fuentes OSINT abarcan todo tipo de información disponible públicamente:</p>
            <ul>
              <li><strong>🌐 Internet:</strong> Sitios web, blogs, foros, archivos públicos</li>
              <li><strong>📱 Redes Sociales:</strong> Facebook, Twitter, Instagram, LinkedIn, TikTok</li>
              <li><strong>📰 Medios de Comunicación:</strong> Periódicos, revistas, noticias online</li>
              <li><strong>📚 Fuentes Académicas:</strong> Papers, investigaciones, tesis públicas</li>
              <li><strong>🏛️ Registros Oficiales:</strong> Documentos gubernamentales, registros públicos</li>
              <li><strong>📊 Bases de Datos Públicas:</strong> Censo, empresas, dominios</li>
            </ul>
          `,
          interactive: {
            type: 'progress_bar',
            items: [
              { label: 'Internet General', percentage: 35 },
              { label: 'Redes Sociales', percentage: 30 },
              { label: 'Medios', percentage: 20 },
              { label: 'Registros Oficiales', percentage: 15 }
            ]
          }
        },
        {
          id: 3,
          title: "Aplicaciones Profesionales de OSINT",
          content: `
            <h2>¿Quién usa OSINT y para qué?</h2>
            <div class="applications-grid">
              <div class="app-card">
                <h3>🔒 Ciberseguridad</h3>
                <p>Detección de amenazas, análisis de malware, investigación de incidentes</p>
              </div>
              <div class="app-card">
                <h3>📰 Periodismo</h3>
                <p>Verificación de noticias, investigación de fuentes, fact-checking</p>
              </div>
              <div class="app-card">
                <h3>🏢 Inteligencia Empresarial</h3>
                <p>Análisis de competencia, due diligence, investigación de mercado</p>
              </div>
              <div class="app-card">
                <h3>⚖️ Investigación Legal</h3>
                <p>Búsqueda de evidencias, localización de testigos, verificación de hechos</p>
              </div>
              <div class="app-card">
                <h3>🛡️ Seguridad Nacional</h3>
                <p>Monitoreo de amenazas, análisis geopolítico, contrainteligencia</p>
              </div>
              <div class="app-card">
                <h3>🕵️ Investigación Privada</h3>
                <p>Localización de personas, verificación de antecedentes, fraudes</p>
              </div>
            </div>
          `,
          interactive: {
            type: 'click_reveal',
            items: [
              { trigger: 'Ciberseguridad', content: 'Los analistas OSINT detectan campañas de phishing, perfiles falsos, infrastructure maliciosa y amenazas emergentes' },
              { trigger: 'Periodismo', content: 'Los periodistas verifican fuentes, investigan historias complejas y realizan fact-checking de información viral' },
              { trigger: 'Empresarial', content: 'Las empresas analizan competencia, realizan due diligence de socios y estudian tendencias de mercado' },
              { trigger: 'Legal', content: 'Los abogados localizan testigos, verifican testimonios y buscan evidencias digitales para casos legales' }
            ]
          }
        },
        {
          id: 4,
          title: "Ciclo de Vida de la Investigación OSINT",
          content: `
            <h2>Proceso Sistemático de Investigación</h2>
            <p>Una metodología estructurada garantiza resultados efectivos:</p>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Definir Requisitos</h3>
                <p>¿Qué información específica necesitamos? ¿Para qué propósito?</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Planificar Fuentes</h3>
                <p>¿Dónde es más probable encontrar la información? ¿Qué herramientas usar?</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Recopilar Datos</h3>
                <p>Búsqueda sistemática, captura de evidencias, documentación</p>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <h3>Procesar y Analizar</h3>
                <p>Filtrar, correlacionar, verificar credibilidad de la información</p>
              </div>
              <div class="step">
                <span class="step-number">5</span>
                <h3>Producir Inteligencia</h3>
                <p>Crear informes accionables, conclusiones basadas en evidencia</p>
              </div>
            </div>
          `,
          interactive: {
            type: 'methodology_flow',
            steps: 5
          }
        },
        {
          id: 5,
          title: "Consideraciones Éticas y Legales",
          content: `
            <h2>OSINT Responsable</h2>
            <p>Es fundamental practicar OSINT de manera ética y legal:</p>
            <div class="ethics-rules">
              <div class="rule-item good">
                <h3>✅ Principios Fundamentales</h3>
                <ul>
                  <li>Usar SOLO información pública y accesible</li>
                  <li>Respetar la privacidad de las personas</li>
                  <li>Verificar múltiples fuentes antes de concluir</li>
                  <li>Documentar fuentes y métodos utilizados</li>
                  <li>Cumplir con las leyes locales e internacionales</li>
                  <li>Mantener objetividad y evitar sesgos</li>
                </ul>
              </div>
              <div class="rule-item bad">
                <h3>❌ Líneas Rojas - NUNCA</h3>
                <ul>
                  <li>Acceder a cuentas privadas o sistemas protegidos</li>
                  <li>Usar ingeniería social o engaños</li>
                  <li>Acosar, intimidar o amenazar a personas</li>
                  <li>Divulgar información personal sin consentimiento</li>
                  <li>Manipular o fabricar evidencias</li>
                  <li>Violar términos de servicio de plataformas</li>
                </ul>
              </div>
            </div>
          `,
          interactive: {
            type: 'ethics_quiz',
            questions: [
              {
                question: "¿Es ético analizar perfiles públicos de redes sociales para una investigación?",
                correct: "Sí, si la información es pública",
                options: ["Sí, si la información es pública", "No, nunca", "Solo con autorización judicial"]
              }
            ]
          }
        },
        {
          id: 6,
          title: "Herramientas Básicas para Empezar",
          content: `
            <h2>Tu Kit de Herramientas OSINT Inicial</h2>
            <p>Estas herramientas gratuitas te permitirán comenzar inmediatamente:</p>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>🔍 Google Search</strong>
                <p>Motor de búsqueda más potente con operadores avanzados</p>
              </div>
              <div class="tool-item">
                <strong>🖼️ Google Images</strong>
                <p>Búsqueda reversa de imágenes para verificación</p>
              </div>
              <div class="tool-item">
                <strong>🗺️ Google Maps/Earth</strong>
                <p>Geolocalización, Street View, imágenes satelitales</p>
              </div>
              <div class="tool-item">
                <strong>🌐 Motores Alternativos</strong>
                <p>DuckDuckGo, Bing, Yandex para diferentes perspectivas</p>
              </div>
              <div class="tool-item">
                <strong>📱 Búsquedas Nativas</strong>
                <p>Usar funciones de búsqueda integradas en redes sociales</p>
              </div>
              <div class="tool-item">
                <strong>🔧 Mi Generador de Dorks</strong>
                <p>Crea consultas avanzadas automáticamente con interfaz visual</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>💡 <strong>Consejo:</strong> Domina las herramientas básicas antes de avanzar a las especializadas</p>
            </div>
          `,
          interactive: {
            type: 'tool_demo',
            tools: ['google', 'images', 'maps', 'social']
          }
        },
        {
          id: 7,
          title: "Autoevaluación - Módulo 1",
          content: `
            <h2>🎯 Evalúa tu Conocimiento</h2>
            <p>Responde estas preguntas para verificar tu comprensión del módulo:</p>
          `,
          interactive: {
            type: 'quiz',
            questions: [
              {
                question: "¿Qué significa OSINT?",
                options: ["Open Source Intelligence", "Online Security Intelligence", "Operational Systems Intelligence"],
                correct: 0,
                explanation: "OSINT significa Open Source Intelligence o Inteligencia de Fuentes Abiertas."
              },
              {
                question: "¿Cuál es una característica fundamental de OSINT?",
                options: ["Requiere hacking de sistemas", "Usa solo información pública", "Necesita acceso privilegiado"],
                correct: 1,
                explanation: "OSINT utiliza únicamente información que está disponible públicamente."
              },
              {
                question: "¿Cuál es el primer paso en una investigación OSINT?",
                options: ["Recopilar todos los datos posibles", "Definir qué información necesitamos", "Elegir las herramientas a usar"],
                correct: 1,
                explanation: "Siempre debemos comenzar definiendo claramente qué información específica necesitamos."
              },
              {
                question: "¿Es ético usar información de perfiles públicos de redes sociales?",
                options: ["Sí, si es información pública", "No, nunca es ético", "Solo con permiso del usuario"],
                correct: 0,
                explanation: "Es ético usar información que está disponible públicamente, respetando términos de uso."
              },
              {
                question: "¿Qué profesionales NO suelen usar OSINT?",
                options: ["Periodistas", "Analistas de ciberseguridad", "Ninguna profesión está excluida"],
                correct: 2,
                explanation: "OSINT es útil para múltiples profesiones: periodismo, seguridad, legal, empresarial, etc."
              }
            ]
          }
        }
      ]
    },
    modulo2: {
      title: "Módulo 2: Google Dorks y Búsqueda Avanzada",
      description: "Domina Google Dorks con nuestro generador automático de consultas",
      totalSlides: 7,
      slides: [
        {
          id: 1,
          title: "Google: Más que una Búsqueda Simple",
          content: `
            <h2>El Poder Oculto de Google</h2>
            <p>Google procesa más de <strong>8.5 billones de búsquedas al día</strong> y indexa más de 130 trillones de páginas web.</p>
            <p>Pero la mayoría de usuarios solo usa el 10% de su potencial real.</p>
            <div class="highlight-box">
              <p>💡 <strong>Dato fascinante:</strong> Google puede encontrar información específica en milisegundos usando operadores especiales</p>
            </div>
            <ul>
              <li><strong>🎯 Búsquedas Precisas:</strong> Encuentra exactamente lo que necesitas</li>
              <li><strong>🔍 Filtros Avanzados:</strong> Por tipo de archivo, fecha, sitio específico</li>
              <li><strong>🕷️ Google Dorks:</strong> Consultas especializadas para descubrir información oculta</li>
              <li><strong>⚡ Eficiencia:</strong> Reduce tiempo de investigación de horas a minutos</li>
            </ul>
          `,
          interactive: {
            type: 'icons',
            items: [
              { icon: Search, label: 'Precisión' },
              { icon: Target, label: 'Enfoque' },
              { icon: Globe, label: 'Alcance' },
              { icon: BookOpen, label: 'Profundidad' }
            ]
          }
        },
        {
          id: 2,
          title: "Operadores Básicos de Búsqueda",
          content: `
            <h2>Fundamentos de Búsqueda Avanzada</h2>
            <p>Estos operadores básicos transformarán inmediatamente tus búsquedas:</p>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>"frase exacta"</code>
                <p>Busca la frase exacta entre comillas</p>
              </div>
              <div class="dork-example">
                <code>palabra1 OR palabra2</code>
                <p>Busca cualquiera de las dos palabras</p>
              </div>
              <div class="dork-example">
                <code>palabra1 -palabra2</code>
                <p>Incluye palabra1 pero excluye palabra2</p>
              </div>
              <div class="dork-example">
                <code>palabra*</code>
                <p>Wildcard: completa automáticamente la palabra</p>
              </div>
              <div class="dork-example">
                <code>palabra1..palabra2</code>
                <p>Busca rangos de números entre dos valores</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>💡 <strong>Ejemplo práctico:</strong> "ciberseguridad 2023" -curso encontrará noticias sobre ciberseguridad de 2023, excluyendo cursos</p>
            </div>
          `,
          interactive: {
            type: 'dork_builder',
            examples: [
              '"data breach" 2024 -blog',
              'phishing OR malware site:gov',
              'cybersecurity budget 2023..2024'
            ]
          }
        },
        {
          id: 3,
          title: "Google Dorks Avanzados",
          content: `
            <h2>Operadores Especializados</h2>
            <p>Estos operadores te dan acceso a información específica y poderosa:</p>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>site:ejemplo.com</code>
                <p>Busca solo dentro del sitio especificado</p>
              </div>
              <div class="dork-example">
                <code>filetype:pdf</code>
                <p>Busca solo archivos del tipo especificado</p>
              </div>
              <div class="dork-example">
                <code>intitle:"admin panel"</code>
                <p>Busca páginas con esas palabras en el título</p>
              </div>
              <div class="dork-example">
                <code>inurl:login</code>
                <p>Busca páginas con esa palabra en la URL</p>
              </div>
              <div class="dork-example">
                <code>cache:ejemplo.com</code>
                <p>Muestra la versión guardada en cache de Google</p>
              </div>
              <div class="dork-example">
                <code>related:ejemplo.com</code>
                <p>Encuentra sitios similares al especificado</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>⚠️ <strong>Importante:</strong> Usa estos operadores de forma ética y respetando los términos de servicio</p>
            </div>
          `,
          interactive: {
            type: 'dork_builder',
            examples: [
              'site:github.com "password" filetype:txt',
              'intitle:"index of" "database.sql"',
              'inurl:admin filetype:php'
            ]
          }
        },
        {
          id: 4,
          title: "Búsqueda de Documentos y Archivos",
          content: `
            <h2>Encontrar Información en Documentos</h2>
            <p>Los documentos públicos contienen información valiosa para investigaciones:</p>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>📄 PDFs</strong>
                <p>Reportes, manuales, documentos oficiales</p>
                <code>filetype:pdf "informe anual 2023"</code>
              </div>
              <div class="tool-item">
                <strong>📊 Excel/CSV</strong>
                <p>Datos, listas, bases de datos públicas</p>
                <code>filetype:xlsx "lista empleados"</code>
              </div>
              <div class="tool-item">
                <strong>📝 Word</strong>
                <p>Documentos, propuestas, contratos</p>
                <code>filetype:docx "contrato" site:gov</code>
              </div>
              <div class="tool-item">
                <strong>📋 PowerPoint</strong>
                <p>Presentaciones, conferencias, entrenamientos</p>
                <code>filetype:pptx "cybersecurity training"</code>
              </div>
              <div class="tool-item">
                <strong>💾 Archivos de Configuración</strong>
                <p>Archivos de sistema, configuraciones</p>
                <code>filetype:conf OR filetype:cfg</code>
              </div>
            </div>
            <div class="highlight-box">
              <p>🎯 <strong>Tip profesional:</strong> Combina operadores: site:empresa.com filetype:pdf "confidencial"</p>
            </div>
          `,
          interactive: {
            type: 'file_search_demo',
            examples: ['pdf', 'xlsx', 'docx', 'pptx', 'txt']
          }
        },
        {
          id: 5,
          title: "Búsquedas por Fecha y Tiempo",
          content: `
            <h2>Investigación Temporal</h2>
            <p>El factor tiempo es crucial en investigaciones OSINT:</p>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Herramientas de Fecha</h3>
                <p>Ir a Herramientas → Cualquier fecha → Personalizado</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Operadores Temporales</h3>
                <p>Usar rangos: after:2023-01-01 before:2023-12-31</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Cache Histórico</h3>
                <p>cache:sitio.com para ver versiones anteriores</p>
              </div>
            </div>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>after:2023-06-01 before:2023-06-30</code>
                <p>Busca contenido de junio 2023 específicamente</p>
              </div>
              <div class="dork-example">
                <code>"data breach" after:2024-01-01</code>
                <p>Brechas de datos reportadas desde 2024</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>📅 <strong>Caso de uso:</strong> Investigar la evolución de un tema específico a lo largo del tiempo</p>
            </div>
          `,
          interactive: {
            type: 'temporal_search',
            examples: ['recent', 'historical', 'trends']
          }
        },
        {
          id: 6,
          title: "Mi Generador de Google Dorks",
          content: `
            <h2>Herramienta Avanzada de Generación de Queries</h2>
            <p>Mi aplicación incluye un <strong>generador de Google Dorks</strong> profesional que automatiza la creación de consultas complejas:</p>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>🎯 Generación Automática</strong>
                <p>Crea consultas avanzadas con interfaz visual - sin memorizar sintaxis</p>
              </div>
              <div class="tool-item">
                <strong>🌐 Múltiples Motores</strong>
                <p>Genera queries para Google, Bing, Yandex y DuckDuckGo simultáneamente</p>
              </div>
              <div class="tool-item">
                <strong>📂 Tipos Especializados</strong>
                <p>Plantillas para usernames, emails, documentos, imágenes, videos y redes sociales</p>
              </div>
              <div class="tool-item">
                <strong>📥 Exportación</strong>
                <p>Descarga resultados en archivo de texto, copia URLs individuales</p>
              </div>
              <div class="tool-item">
                <strong>🚀 Lotes Múltiples</strong>
                <p>Abre todas las búsquedas en pestañas separadas para investigación eficiente</p>
              </div>
              <div class="tool-item">
                <strong>📚 Guía Integrada</strong>
                <p>Tutorial completo con ejemplos y mejores prácticas incluido</p>
              </div>
            </div>
            <div class="next-steps">
              <h3>¡Usa el Generador Ahora!</h3>
              <button class="action-button" onclick="window.location.href='/dorks'">
                <Search size={20} />
                Abrir Generador de Dorks
              </button>
            </div>
            <div class="highlight-box">
              <p>🚀 <strong>Ventaja profesional:</strong> Lo que tomaría horas crear manualmente, el generador lo hace en segundos</p>
            </div>
          `,
          interactive: {
            type: 'generator_preview',
            features: ['automatic_generation', 'multi_engine', 'templates', 'export_options']
          }
        },
        {
          id: 7,
          title: "Autoevaluación - Módulo 2",
          content: `
            <h2>🎯 Evalúa tu Dominio de Google Dorks</h2>
            <p>Demuestra tu comprensión de las técnicas de búsqueda avanzada:</p>
          `,
          interactive: {
            type: 'quiz',
            questions: [
              {
                question: "¿Qué operador usarías para buscar solo archivos PDF?",
                options: ["type:pdf", "filetype:pdf", "format:pdf"],
                correct: 1,
                explanation: "El operador correcto es 'filetype:pdf' para buscar archivos de un tipo específico."
              },
              {
                question: "¿Cómo buscarías solo en un sitio web específico?",
                options: ["site:ejemplo.com", "website:ejemplo.com", "domain:ejemplo.com"],
                correct: 0,
                explanation: "El operador 'site:' limita la búsqueda a un dominio específico."
              },
              {
                question: "¿Qué significa el operador 'intitle:' en Google?",
                options: ["Busca en el contenido", "Busca en el título de la página", "Busca en la URL"],
                correct: 1,
                explanation: "'intitle:' busca páginas que contengan las palabras especificadas en el título."
              },
              {
                question: "¿Cómo excluirías una palabra de tu búsqueda?",
                options: ["palabra !excluir", "palabra -excluir", "palabra NOT excluir"],
                correct: 1,
                explanation: "El operador '-' (menos) excluye palabras de los resultados de búsqueda."
              },
              {
                question: "¿Qué ventaja principal tiene mi generador de Dorks?",
                options: ["Es más rápido que Google", "Automatiza la creación de queries complejas", "Tiene más información que Google"],
                correct: 1,
                explanation: "El generador automatiza la creación de consultas complejas con interfaz visual, ahorrando tiempo y eliminando errores de sintaxis."
              }
            ]
          }
        }
      ]
    },
    modulo3: {
      title: "Módulo 3: Búsqueda Avanzada en Redes Sociales",
      description: "Técnicas especializadas para investigación en plataformas sociales",
      totalSlides: 7,
      slides: [
        {
          id: 1,
          title: "El Ecosistema de Redes Sociales",
          content: `
            <h2>Mapeo del Universo Social Digital</h2>
            <p>Las redes sociales son la mayor fuente de información personal pública en la historia:</p>
            <div class="applications-grid">
              <div class="app-card">
                <h3>📘 Facebook</h3>
                <p><strong>2.9 billones</strong> de usuarios activos</p>
                <p>Información personal, relaciones, ubicaciones</p>
              </div>
              <div class="app-card">
                <h3>🐦 Twitter/X</h3>
                <p><strong>450 millones</strong> de usuarios activos</p>
                <p>Opiniones, noticias en tiempo real, tendencias</p>
              </div>
              <div class="app-card">
                <h3>💼 LinkedIn</h3>
                <p><strong>900 millones</strong> de profesionales</p>
                <p>Información laboral, conexiones profesionales</p>
              </div>
              <div class="app-card">
                <h3>📸 Instagram</h3>
                <p><strong>2 billones</strong> de usuarios activos</p>
                <p>Fotos geolocalizadas, actividades, intereses</p>
              </div>
              <div class="app-card">
                <h3>🎵 TikTok</h3>
                <p><strong>1 billón</strong> de usuarios activos</p>
                <p>Comportamientos, tendencias, demografía joven</p>
              </div>
              <div class="app-card">
                <h3>👻 Snapchat</h3>
                <p><strong>750 millones</strong> de usuarios activos</p>
                <p>Ubicaciones en tiempo real, contenido efímero</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>📊 <strong>Dato impactante:</strong> Cada día se publican 95 millones de fotos en Instagram y 500 millones de tweets</p>
            </div>
          `,
          interactive: {
            type: 'platform_stats',
            platforms: ['facebook', 'twitter', 'linkedin', 'instagram', 'tiktok', 'snapchat']
          }
        },
        {
          id: 2,
          title: "Facebook: Búsquedas Avanzadas",
          content: `
            <h2>Técnicas Especializadas para Facebook</h2>
            <p>Facebook mantiene el motor de búsqueda social más potente. Aprende a dominarlo:</p>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Búsqueda por Personas</h3>
                <p>Nombre + Ciudad + Trabajo + Educación</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Filtros Avanzados</h3>
                <p>Por ubicación, empleador, escuela, año</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Búsqueda de Posts</h3>
                <p>Por fecha, ubicación, palabras clave</p>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <h3>Graph Search</h3>
                <p>Consultas complejas de relaciones</p>
              </div>
            </div>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>Personas llamadas "Juan" que viven en "Madrid"</code>
                <p>Búsqueda de personas por nombre y ubicación</p>
              </div>
              <div class="dork-example">
                <code>Empleados de "Microsoft" que estudiaron en "Universidad Complutense"</code>
                <p>Combinación de filtros profesionales y educativos</p>
              </div>
              <div class="dork-example">
                <code>Posts de mis amigos sobre "vacaciones" en "2023"</code>
                <p>Búsqueda temporal de contenido específico</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>🔍 <strong>Tip profesional:</strong> Usa múltiples variaciones del nombre (Juan, Juanito, J. García)</p>
            </div>
          `,
          interactive: {
            type: 'facebook_search_demo',
            examples: ['people_search', 'post_search', 'location_search']
          }
        },
        {
          id: 3,
          title: "Twitter/X: Búsqueda en Tiempo Real",
          content: `
            <h2>Dominar la Búsqueda Avanzada de Twitter</h2>
            <p>Twitter es la fuente principal de información en tiempo real. Sus operadores son similares a Google:</p>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>from:usuario</code>
                <p>Tweets de un usuario específico</p>
              </div>
              <div class="dork-example">
                <code>to:usuario</code>
                <p>Tweets dirigidos a un usuario específico</p>
              </div>
              <div class="dork-example">
                <code>"frase exacta"</code>
                <p>Tweets que contienen la frase exacta</p>
              </div>
              <div class="dork-example">
                <code>#hashtag</code>
                <p>Tweets con hashtag específico</p>
              </div>
              <div class="dork-example">
                <code>since:2024-01-01 until:2024-01-31</code>
                <p>Tweets en un rango de fechas específico</p>
              </div>
              <div class="dork-example">
                <code>near:"Madrid" within:15km</code>
                <p>Tweets geolocalizados cerca de una ubicación</p>
              </div>
            </div>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>🎯 Ejemplo Complejo</strong>
                <p><code>from:elonmusk "Tesla" since:2024-01-01 -RT</code></p>
                <p>Tweets originales de Elon Musk sobre Tesla desde enero 2024</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>⚡ <strong>Poder del tiempo real:</strong> Twitter es ideal para seguir eventos en vivo y crisis</p>
            </div>
          `,
          interactive: {
            type: 'twitter_search_demo',
            examples: ['user_search', 'hashtag_search', 'temporal_search', 'location_search']
          }
        },
        {
          id: 4,
          title: "LinkedIn: Inteligencia Profesional",
          content: `
            <h2>Investigación Profesional Avanzada</h2>
            <p>LinkedIn es la mina de oro para inteligencia empresarial y profesional:</p>
            <div class="applications-grid">
              <div class="app-card">
                <h3>🏢 Por Empresa</h3>
                <p>Empleados actuales y anteriores</p>
                <p>Estructura organizacional</p>
              </div>
              <div class="app-card">
                <h3>🎓 Por Educación</h3>
                <p>Alumni de universidades específicas</p>
                <p>Conexiones académicas</p>
              </div>
              <div class="app-card">
                <h3>📍 Por Ubicación</h3>
                <p>Profesionales en ciudades específicas</p>
                <p>Mercados laborales locales</p>
              </div>
              <div class="app-card">
                <h3>💼 Por Función</h3>
                <p>Roles específicos en industrias</p>
                <p>Trayectorias profesionales</p>
              </div>
            </div>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Búsqueda Booleana</h3>
                <p>"Analista AND Ciberseguridad NOT Practicante"</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Filtros Combinados</h3>
                <p>Empresa + Ubicación + Años de experiencia</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Sales Navigator</h3>
                <p>Herramientas avanzadas de búsqueda premium</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>💡 <strong>Estrategia avanzada:</strong> Mapea organigramas empresariales siguiendo conexiones mutuas</p>
            </div>
          `,
          interactive: {
            type: 'linkedin_search_demo',
            examples: ['company_search', 'role_search', 'education_search']
          }
        },
        {
          id: 5,
          title: "Instagram: Investigación Visual y Geográfica",
          content: `
            <h2>Análisis de Contenido Visual</h2>
            <p>Instagram proporciona información única a través de imágenes y ubicaciones:</p>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>📍 Búsqueda por Ubicación</strong>
                <p>Encuentra posts en lugares específicos</p>
                <p>Mapea actividades en tiempo real</p>
              </div>
              <div class="tool-item">
                <strong>#️⃣ Hashtags Estratégicos</strong>
                <p>Descubre comunidades e intereses</p>
                <p>Sigue tendencias y eventos</p>
              </div>
              <div class="tool-item">
                <strong>👥 Análisis de Seguidores</strong>
                <p>Mapea redes sociales reales</p>
                <p>Identifica conexiones ocultas</p>
              </div>
              <div class="tool-item">
                <strong>🕐 Stories y Highlights</strong>
                <p>Contenido más auténtico y espontáneo</p>
                <p>Actividades en tiempo real</p>
              </div>
            </div>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Geolocalización</h3>
                <p>Buscar por lugares específicos en el mapa</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Análisis de Metadatos</h3>
                <p>Extraer información EXIF de imágenes</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Cross-Reference</h3>
                <p>Correlacionar con otras plataformas</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>📷 <strong>Técnica avanzada:</strong> Usa reverse image search en fotos de Instagram para encontrar el origen</p>
            </div>
          `,
          interactive: {
            type: 'instagram_search_demo',
            examples: ['location_search', 'hashtag_analysis', 'visual_analysis']
          }
        },
        {
          id: 6,
          title: "Herramientas y Técnicas Cross-Platform",
          content: `
            <h2>Estrategias Integradas de Investigación</h2>
            <p>La verdadera potencia viene de combinar información de múltiples plataformas:</p>
            <div class="applications-grid">
              <div class="app-card">
                <h3>🔄 Cross-Referencing</h3>
                <p>Confirmar identidad en múltiples plataformas</p>
                <p>Detectar inconsistencias en perfiles</p>
              </div>
              <div class="app-card">
                <h3>📈 Timeline Reconstruction</h3>
                <p>Crear líneas de tiempo de actividades</p>
                <p>Correlacionar eventos entre plataformas</p>
              </div>
              <div class="app-card">
                <h3>🕸️ Network Mapping</h3>
                <p>Mapear conexiones y relaciones</p>
                <p>Identificar patrones de comportamiento</p>
              </div>
              <div class="app-card">
                <h3>🎭 Persona Analysis</h3>
                <p>Crear perfiles completos de individuos</p>
                <p>Detectar múltiples identidades</p>
              </div>
            </div>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>Username Pivoting</code>
                <p>Usar el mismo username en diferentes plataformas</p>
              </div>
              <div class="dork-example">
                <code>Email Address Search</code>
                <p>Buscar email en múltiples redes sociales</p>
              </div>
              <div class="dork-example">
                <code>Phone Number Lookup</code>
                <p>Correlacionar números de teléfono entre plataformas</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>🧩 <strong>Metodología:</strong> Siempre verifica información en al menos 2-3 fuentes diferentes</p>
            </div>
          `,
          interactive: {
            type: 'cross_platform_demo',
            techniques: ['username_pivot', 'email_search', 'timeline_correlation']
          }
        },
        {
          id: 7,
          title: "Autoevaluación - Módulo 3",
          content: `
            <h2>🎯 Evalúa tu Dominio de Redes Sociales</h2>
            <p>Demuestra tu comprensión de las técnicas de investigación en redes sociales:</p>
          `,
          interactive: {
            type: 'quiz',
            questions: [
              {
                question: "¿Qué operador de Twitter busca tweets de un usuario específico?",
                options: ["@usuario", "from:usuario", "user:usuario"],
                correct: 1,
                explanation: "El operador 'from:' busca tweets publicados por un usuario específico."
              },
              {
                question: "¿Cuál es la principal ventaja de LinkedIn para OSINT?",
                options: ["Información personal privada", "Información profesional verificada", "Contenido multimedia"],
                correct: 1,
                explanation: "LinkedIn es valioso por su información profesional, que tiende a ser más verificada y estructurada."
              },
              {
                question: "¿Qué técnica permite confirmar identidad en múltiples plataformas?",
                options: ["Cross-referencing", "Hashtag analysis", "Timeline creation"],
                correct: 0,
                explanation: "El cross-referencing permite verificar y confirmar identidades comparando información entre plataformas."
              },
              {
                question: "¿Qué información única proporciona Instagram?",
                options: ["Solo texto", "Geolocalización y contenido visual", "Información profesional"],
                correct: 1,
                explanation: "Instagram es especialmente valioso por su contenido visual y capacidades de geolocalización."
              },
              {
                question: "¿Cuántas fuentes deberías verificar mínimo?",
                options: ["1 fuente es suficiente", "2-3 fuentes diferentes", "5 o más fuentes"],
                correct: 1,
                explanation: "La verificación cruzada requiere al menos 2-3 fuentes diferentes para confirmar información."
              }
            ]
          }
        }
      ]
    },
    modulo4: {
      title: "Módulo 4: Análisis de Imágenes y Geolocalización",
      description: "Técnicas avanzadas para verificar y analizar contenido visual",
      totalSlides: 7,
      slides: [
        {
          id: 1,
          title: "El Poder del Contenido Visual",
          content: `
            <h2>La Era de la Información Visual</h2>
            <p>Vivimos en una época donde las imágenes son la forma principal de comunicación:</p>
            <div class="applications-grid">
              <div class="app-card">
                <h3>📊 Estadísticas Impactantes</h3>
                <p><strong>95 millones</strong> de fotos subidas a Instagram diariamente</p>
                <p><strong>3.2 billones</strong> de imágenes compartidas en redes sociales cada día</p>
              </div>
              <div class="app-card">
                <h3>🔍 Información Oculta</h3>
                <p>Cada imagen contiene metadatos</p>
                <p>Geolocalización, cámara, fecha, software usado</p>
              </div>
              <div class="app-card">
                <h3>⚠️ Desafíos</h3>
                <p>Deepfakes y manipulación digital</p>
                <p>Desinformación visual masiva</p>
              </div>
              <div class="app-card">
                <h3>🎯 Oportunidades OSINT</h3>
                <p>Verificación de noticias</p>
                <p>Investigación de ubicaciones y eventos</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>📸 <strong>Dato fascinante:</strong> Una sola foto puede contener más de 100 datos diferentes en sus metadatos</p>
            </div>
            <div class="highlight-box">
              <p>🔧 <strong>Herramienta Integrada:</strong> OSINTArgy incluye su propio analizador de metadatos para extraer información de imágenes y documentos de forma fácil y rápida</p>
              <div class="tool-access-button">
                <a href="/file-analysis" target="_blank" class="internal-tool-button">
                  🔍 Abrir Análisis de Archivos
                </a>
              </div>
            </div>
            <ul>
              <li><strong>🗺️ Geolocalización:</strong> Coordenadas GPS exactas</li>
              <li><strong>📅 Temporal:</strong> Fecha y hora precisa</li>
              <li><strong>📱 Técnica:</strong> Dispositivo, software, configuración</li>
              <li><strong>🔍 Análisis:</strong> Reverse image search, similitudes</li>
            </ul>
          `,
          interactive: {
            type: 'visual_stats',
            items: [
              { icon: Globe, label: 'Ubicación' },
              { icon: Search, label: 'Búsqueda' },
              { icon: Eye, label: 'Análisis' },
              { icon: Shield, label: 'Verificación' }
            ]
          }
        },
        {
          id: 2,
          title: "Metadatos EXIF: El ADN Digital",
          content: `
            <h2>Extrayendo Información de Metadatos</h2>
            <p>Los metadatos EXIF (Exchangeable Image File Format) son información invisible embebida en imágenes:</p>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>📱 Información del Dispositivo</strong>
                <p>Marca, modelo, versión del software</p>
                <p>Útil para verificar autenticidad</p>
              </div>
              <div class="tool-item">
                <strong>📍 Geolocalización GPS</strong>
                <p>Latitud, longitud, altitud</p>
                <p>Ubicación exacta donde se tomó la foto</p>
              </div>
              <div class="tool-item">
                <strong>⏰ Timestamp</strong>
                <p>Fecha y hora exacta</p>
                <p>Zona horaria del dispositivo</p>
              </div>
              <div class="tool-item">
                <strong>📸 Configuración Técnica</strong>
                <p>ISO, apertura, velocidad de obturación</p>
                <p>Flash, modo de enfoque</p>
              </div>
              <div class="tool-item">
                <strong>🔧 Software de Edición</strong>
                <p>Photoshop, Lightroom, aplicaciones móviles</p>
                <p>Indicadores de manipulación</p>
              </div>
            </div>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>ExifTool</code>
                <p>Herramienta profesional de línea de comandos</p>
              </div>
              <div class="dork-example">
                <code>Jeffrey's Exif Viewer</code>
                <p>Interfaz web fácil de usar</p>
              </div>
              <div class="dork-example">
                <code>PhotoME</code>
                <p>Software de escritorio con análisis avanzado</p>
              </div>
              <div class="dork-example highlight-internal">
                <code>🔧 OSINTArgy - Análisis de Archivos</code>
                <p>Herramienta integrada con análisis completo de metadatos</p>
                <div class="tool-access-button">
                  <a href="/file-analysis" target="_blank" class="internal-tool-button">
                    🚀 Usar Ahora
                  </a>
                </div>
              </div>
            </div>
            <div class="highlight-box">
              <p>⚠️ <strong>Importante:</strong> Muchas redes sociales eliminan metadatos por privacidad</p>
            </div>
            <div class="highlight-box">
              <p>🎯 <strong>Práctica Inmediata:</strong> Puedes probar ahora mismo el análisis de metadatos usando la herramienta integrada de OSINTArgy</p>
              <div class="tool-access-button">
                <a href="/file-analysis" target="_blank" class="internal-tool-button">
                  📷 Practicar Análisis de Metadatos
                </a>
              </div>
            </div>
          `,
          interactive: {
            type: 'exif_analysis_demo',
            examples: ['gps_extraction', 'device_identification', 'timestamp_analysis']
          }
        },
        {
          id: 3,
          title: "Búsqueda Reversa de Imágenes",
          content: `
            <h2>Encontrar el Origen y Historia de Imágenes</h2>
            <p>La búsqueda reversa es fundamental para verificar autenticidad y encontrar fuentes originales:</p>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Google Images</h3>
                <p>El más completo, reconoce objetos y lugares</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>TinEye</h3>
                <p>Especializado en encontrar duplicados exactos</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Yandex Images</h3>
                <p>Excelente para rostros y variaciones</p>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <h3>Bing Visual Search</h3>
                <p>Bueno para productos y objetos</p>
              </div>
            </div>
            <div class="applications-grid">
              <div class="app-card">
                <h3>🔍 Casos de Uso</h3>
                <p>Verificar noticias falsas</p>
                <p>Encontrar imagen original</p>
                <p>Detectar manipulación</p>
              </div>
              <div class="app-card">
                <h3>📈 Técnicas Avanzadas</h3>
                <p>Recortar secciones específicas</p>
                <p>Ajustar resolución y contraste</p>
                <p>Buscar por colores dominantes</p>
              </div>
              <div class="app-card">
                <h3>🎯 Estrategia Multi-Motor</h3>
                <p>Usar varios motores simultáneamente</p>
                <p>Comparar resultados diferentes</p>
                <p>Triangular información</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>💡 <strong>Tip profesional:</strong> Si una imagen no da resultados, intenta recortar diferentes secciones</p>
            </div>
          `,
          interactive: {
            type: 'reverse_search_demo',
            engines: ['google', 'tineye', 'yandex', 'bing']
          }
        },
        {
          id: 4,
          title: "Geolocalización: Del Pixel al Lugar Real",
          content: `
            <h2>Técnicas de Identificación de Ubicaciones</h2>
            <p>La geolocalización es una de las habilidades más poderosas en OSINT visual:</p>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>🗺️ Google Earth</strong>
                <p>Imágenes satelitales históricas</p>
                <p>Modelos 3D de ciudades</p>
              </div>
              <div class="tool-item">
                <strong>🚶 Google Street View</strong>
                <p>Vistas a nivel de calle</p>
                <p>Comparación directa con fotos</p>
              </div>
              <div class="tool-item">
                <strong>📍 What3Words</strong>
                <p>Sistema de coordenadas de 3 palabras</p>
                <p>Precisión de 3x3 metros</p>
              </div>
              <div class="tool-item">
                <strong>🌍 Wikimapia</strong>
                <p>Información detallada de ubicaciones</p>
                <p>Contribuciones de la comunidad</p>
              </div>
            </div>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Identificar Pistas</h3>
                <p>Arquitectura, señales, vegetación, idiomas</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Buscar Landmarks</h3>
                <p>Edificios únicos, monumentos, características geográficas</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Triangular Ubicación</h3>
                <p>Usar múltiples referencias para precisión</p>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <h3>Verificar con Street View</h3>
                <p>Confirmar ubicación exacta</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>🎯 <strong>Técnica experta:</strong> Analiza sombras para determinar dirección y hora aproximada</p>
            </div>
          `,
          interactive: {
            type: 'geolocation_demo',
            techniques: ['landmark_identification', 'shadow_analysis', 'architectural_clues']
          }
        },
        {
          id: 5,
          title: "Detección de Manipulación Digital",
          content: `
            <h2>Identificando Deepfakes y Contenido Alterado</h2>
            <p>En la era de la manipulación digital, verificar autenticidad es crucial:</p>
            <div class="applications-grid">
              <div class="app-card">
                <h3>🔍 Análisis Técnico</h3>
                <p>Inconsistencias en compresión</p>
                <p>Artefactos de edición</p>
                <p>Patrones de ruido anómalos</p>
              </div>
              <div class="app-card">
                <h3>👁️ Análisis Visual</h3>
                <p>Sombras inconsistentes</p>
                <p>Perspectiva incorrecta</p>
                <p>Iluminación imposible</p>
              </div>
              <div class="app-card">
                <h3>🧠 Deepfake Detection</h3>
                <p>Parpadeo antinatural</p>
                <p>Movimientos faciales raros</p>
                <p>Bordes difusos en rostros</p>
              </div>
              <div class="app-card">
                <h3>📊 Herramientas Especializadas</h3>
                <p>FotoForensics (Error Level Analysis)</p>
                <p>Deepware Scanner</p>
                <p>InVID Verification Plugin</p>
              </div>
            </div>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>Error Level Analysis (ELA)</code>
                <p>Detecta áreas con diferentes niveles de compresión</p>
              </div>
              <div class="dork-example">
                <code>Copy-Move Detection</code>
                <p>Identifica elementos duplicados en la imagen</p>
              </div>
              <div class="dork-example">
                <code>Noise Analysis</code>
                <p>Analiza patrones de ruido digital</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>🚨 <strong>Alerta:</strong> Los deepfakes mejoran constantemente, siempre combina múltiples técnicas de verificación</p>
            </div>
          `,
          interactive: {
            type: 'manipulation_detection',
            techniques: ['ela_analysis', 'shadow_verification', 'noise_analysis']
          }
        },
        {
          id: 6,
          title: "Herramientas y Workflow Profesional",
          content: `
            <h2>Flujo de Trabajo para Análisis de Imágenes</h2>
            <p>Un enfoque sistemático garantiza análisis completos y precisos:</p>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Preservación</h3>
                <p>Guardar imagen original, documentar fuente</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Extracción de Metadatos</h3>
                <p>EXIF, geolocalización, timestamps</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Búsqueda Reversa</h3>
                <p>Multiple motores, variaciones</p>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <h3>Análisis de Autenticidad</h3>
                <p>Detección de manipulación</p>
              </div>
              <div class="step">
                <span class="step-number">5</span>
                <h3>Geolocalización</h3>
                <p>Identificar ubicación exacta si es posible</p>
              </div>
              <div class="step">
                <span class="step-number">6</span>
                <h3>Documentación</h3>
                <p>Crear reporte con evidencias</p>
              </div>
            </div>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>🔧 Kit de Herramientas Esencial</strong>
                <p>ExifTool, Google Images, TinEye</p>
                <p>FotoForensics, Google Earth</p>
                <p><strong>OSINTArgy:</strong> Análisis integrado de metadatos</p>
                <div class="tool-access-button">
                  <a href="/file-analysis" target="_blank" class="internal-tool-button">
                    🔧 Acceder a Herramienta
                  </a>
                </div>
              </div>
              <div class="tool-item">
                <strong>📱 Apps Móviles</strong>
                <p>Reverse Image Search App</p>
                <p>GPS Essentials, What3Words</p>
              </div>
              <div class="tool-item">
                <strong>🌐 Extensions de Navegador</strong>
                <p>InVID Verification Plugin</p>
                <p>RevEye Reverse Image Search</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>📋 <strong>Checklist profesional:</strong> Siempre documenta cada paso y guarda evidencias</p>
            </div>
          `,
          interactive: {
            type: 'workflow_demo',
            steps: ['preservation', 'metadata', 'reverse_search', 'authentication', 'geolocation', 'documentation']
          }
        },
        {
          id: 7,
          title: "Autoevaluación - Módulo 4",
          content: `
            <h2>🎯 Evalúa tu Dominio de Análisis Visual</h2>
            <p>Demuestra tu comprensión de las técnicas de análisis de imágenes y geolocalización:</p>
          `,
          interactive: {
            type: 'quiz',
            questions: [
              {
                question: "¿Qué información NO se encuentra típicamente en metadatos EXIF?",
                options: ["Coordenadas GPS", "Modelo de cámara", "Contenido de la imagen"],
                correct: 2,
                explanation: "Los metadatos EXIF contienen información técnica sobre cómo se tomó la foto, no sobre el contenido visual."
              },
              {
                question: "¿Cuál es la ventaja principal de usar múltiples motores de búsqueda reversa?",
                options: ["Es más rápido", "Cada motor tiene fortalezas diferentes", "Es más barato"],
                correct: 1,
                explanation: "Cada motor de búsqueda tiene diferentes algoritmos y bases de datos, proporcionando resultados complementarios."
              },
              {
                question: "¿Qué indica típicamente el Error Level Analysis (ELA)?",
                options: ["La edad de la imagen", "Áreas posiblemente manipuladas", "La cámara usada"],
                correct: 1,
                explanation: "ELA detecta inconsistencias en la compresión que pueden indicar manipulación digital."
              },
              {
                question: "¿Cuál es el primer paso en un análisis profesional de imágenes?",
                options: ["Búsqueda reversa", "Preservar la imagen original", "Extraer metadatos"],
                correct: 1,
                explanation: "Siempre debemos preservar la imagen original y documentar su fuente antes de cualquier análisis."
              },
              {
                question: "¿Qué NO es una pista útil para geolocalización?",
                options: ["Arquitectura local", "Señales de tráfico", "Marca de la cámara"],
                correct: 2,
                explanation: "La marca de la cámara no proporciona información sobre la ubicación donde se tomó la foto."
              }
            ]
          }
        }
      ]
    },
    modulo5: {
      title: "Módulo 5: Cómo Piensa el Analista OSINT",
      description: "Desarrolla la mentalidad y metodología del investigador profesional",
      totalSlides: 7,
      slides: [
        {
          id: 1,
          title: "La Mentalidad del Investigador OSINT",
          content: `
            <h2>Desarrollando el Pensamiento Analítico</h2>
            <p>Ser un analista OSINT efectivo va más allá de conocer herramientas. Requiere una forma específica de pensar:</p>
            <div class="applications-grid">
              <div class="app-card">
                <h3>🧠 Pensamiento Crítico</h3>
                <p>Cuestionar todo, verificar siempre</p>
                <p>No asumir, validar con evidencias</p>
              </div>
              <div class="app-card">
                <h3>🔍 Curiosidad Sistemática</h3>
                <p>Seguir cada pista metodicamente</p>
                <p>Explorar conexiones no obvias</p>
              </div>
              <div class="app-card">
                <h3>📊 Pensamiento Estructurado</h3>
                <p>Organizar información de forma lógica</p>
                <p>Documentar cada paso del proceso</p>
              </div>
              <div class="app-card">
                <h3>⚖️ Objetividad</h3>
                <p>Separar hechos de opiniones</p>
                <p>Evitar sesgos cognitivos</p>
              </div>
              <div class="app-card">
                <h3>🎯 Orientación a Objetivos</h3>
                <p>Mantener foco en la pregunta original</p>
                <p>No perderse en tangentes irrelevantes</p>
              </div>
              <div class="app-card">
                <h3>🧩 Pensamiento de Conexiones</h3>
                <p>Ver patrones y relaciones ocultas</p>
                <p>Correlacionar información dispersa</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>💡 <strong>Principio fundamental:</strong> "Datos sin análisis son solo ruido; análisis sin datos son solo opiniones"</p>
            </div>
          `,
          interactive: {
            type: 'mindset_assessment',
            traits: ['critical_thinking', 'systematic_curiosity', 'structured_approach', 'objectivity']
          }
        },
        {
          id: 2,
          title: "El Ciclo de Hipótesis y Validación",
          content: `
            <h2>Metodología Científica en OSINT</h2>
            <p>Los analistas OSINT profesionales siguen un proceso científico riguroso:</p>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Observación Inicial</h3>
                <p>¿Qué vemos? ¿Qué llama la atención?</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Formular Hipótesis</h3>
                <p>Crear teorías basadas en evidencia inicial</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Diseñar Pruebas</h3>
                <p>¿Qué evidencia confirmaría o refutaría la hipótesis?</p>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <h3>Recopilar Evidencia</h3>
                <p>Búsqueda dirigida y sistemática</p>
              </div>
              <div class="step">
                <span class="step-number">5</span>
                <h3>Evaluar Resultados</h3>
                <p>¿La evidencia soporta la hipótesis?</p>
              </div>
              <div class="step">
                <span class="step-number">6</span>
                <h3>Refinar o Descartar</h3>
                <p>Ajustar teoría o crear nueva hipótesis</p>
              </div>
            </div>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>Ejemplo: Perfil Sospechoso</code>
                <p><strong>Hipótesis:</strong> Este perfil es falso</p>
                <p><strong>Pruebas:</strong> Buscar imágenes, verificar consistencia temporal, analizar conexiones</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>🧪 <strong>Principio clave:</strong> Una hipótesis que no puede ser refutada no es útil</p>
            </div>
          `,
          interactive: {
            type: 'hypothesis_cycle',
            scenarios: ['fake_profile', 'location_verification', 'timeline_analysis']
          }
        },
        {
          id: 3,
          title: "Gestión de Sesgos Cognitivos",
          content: `
            <h2>Los Enemigos Invisibles del Analista</h2>
            <p>Nuestro cerebro tiene atajos que pueden sabotear investigaciones. Los analistas deben conocerlos:</p>
            <div class="applications-grid">
              <div class="app-card">
                <h3>🎯 Sesgo de Confirmación</h3>
                <p>Buscar solo evidencia que confirme nuestras creencias</p>
                <p><strong>Antídoto:</strong> Buscar activamente evidencia contraria</p>
              </div>
              <div class="app-card">
                <h3>⚓ Sesgo de Anclaje</h3>
                <p>Dar demasiado peso a la primera información</p>
                <p><strong>Antídoto:</strong> Evaluar múltiples fuentes antes de concluir</p>
              </div>
              <div class="app-card">
                <h3>📈 Sesgo de Disponibilidad</h3>
                <p>Sobrevalorar información fácil de recordar</p>
                <p><strong>Antídoto:</strong> Buscar sistemáticamente, no solo lo obvio</p>
              </div>
              <div class="app-card">
                <h3>👥 Sesgo de Grupo</h3>
                <p>Seguir la opinión mayoritaria sin análisis</p>
                <p><strong>Antídoto:</strong> Análisis independiente antes de consultar</p>
              </div>
            </div>
            <div class="ethics-rules">
              <div class="rule-item good">
                <h3>✅ Técnicas Anti-Sesgo</h3>
                <ul>
                  <li>Red Team: asignar alguien que refute hipótesis</li>
                  <li>Lista de verificación estructurada</li>
                  <li>Análisis de fuentes alternativas</li>
                  <li>Documentar proceso de pensamiento</li>
                  <li>Pausas reflexivas antes de concluir</li>
                </ul>
              </div>
              <div class="rule-item bad">
                <h3>⚠️ Señales de Alarma</h3>
                <ul>
                  <li>"Esto confirma lo que pensaba"</li>
                  <li>Evitar fuentes que contradicen</li>
                  <li>Conclusiones muy rápidas</li>
                  <li>No documentar razonamiento</li>
                  <li>Ignorar evidencia incómoda</li>
                </ul>
              </div>
            </div>
            <div class="highlight-box">
              <p>🧠 <strong>Regla de oro:</strong> La mejor evidencia es la que te sorprende o contradice tus expectativas</p>
            </div>
          `,
          interactive: {
            type: 'bias_training',
            scenarios: ['confirmation_bias', 'anchoring_bias', 'availability_bias']
          }
        },
        {
          id: 4,
          title: "Análisis de Fuentes y Credibilidad",
          content: `
            <h2>Evaluando la Confiabilidad de la Información</h2>
            <p>No toda información es igual. Los analistas deben evaluar credibilidad sistemáticamente:</p>
            <div class="methodology-steps">
              <div class="step">
                <span class="step-number">1</span>
                <h3>Identificar la Fuente</h3>
                <p>¿Quién publicó? ¿Cuándo? ¿Dónde?</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <h3>Evaluar Competencia</h3>
                <p>¿La fuente tiene experiencia en el tema?</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <h3>Analizar Motivación</h3>
                <p>¿Qué intereses puede tener la fuente?</p>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <h3>Verificar Consistencia</h3>
                <p>¿Coincide con otras fuentes independientes?</p>
              </div>
              <div class="step">
                <span class="step-number">5</span>
                <h3>Evaluar Método</h3>
                <p>¿Cómo obtuvo la información?</p>
              </div>
            </div>
            <div class="tools-showcase">
              <div class="tool-item">
                <strong>🥇 Fuentes Primarias</strong>
                <p>Testigos directos, documentos originales</p>
                <p>Mayor credibilidad, menor interpretación</p>
              </div>
              <div class="tool-item">
                <strong>🥈 Fuentes Secundarias</strong>
                <p>Análisis de fuentes primarias</p>
                <p>Útiles pero pueden incluir interpretación</p>
              </div>
              <div class="tool-item">
                <strong>🥉 Fuentes Terciarias</strong>
                <p>Resúmenes de fuentes secundarias</p>
                <p>Menos confiables, más interpretación</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>📊 <strong>Matriz de credibilidad:</strong> Cruzar confiabilidad de fuente con veracidad de información</p>
            </div>
          `,
          interactive: {
            type: 'source_evaluation',
            examples: ['primary_source', 'secondary_source', 'tertiary_source', 'anonymous_source']
          }
        },
        {
          id: 5,
          title: "Documentación y Cadena de Custodia",
          content: `
            <h2>Preservando la Integridad de la Investigación</h2>
            <p>La documentación meticulosa separa al analista amateur del profesional:</p>
            <div class="applications-grid">
              <div class="app-card">
                <h3>📝 Documentación en Tiempo Real</h3>
                <p>Registrar cada paso mientras lo realizas</p>
                <p>Timestamps, URLs, capturas de pantalla</p>
              </div>
              <div class="app-card">
                <h3>🔗 Cadena de Custodia</h3>
                <p>Demostrar que la evidencia no fue alterada</p>
                <p>Hashes, metadatos, fuentes originales</p>
              </div>
              <div class="app-card">
                <h3>🗂️ Organización Sistemática</h3>
                <p>Estructura consistente para todos los casos</p>
                <p>Fácil de revisar y auditar</p>
              </div>
              <div class="app-card">
                <h3>📊 Reporting Estructurado</h3>
                <p>Formato estándar para conclusiones</p>
                <p>Separar hechos de interpretaciones</p>
              </div>
            </div>
            <div class="dorks-examples">
              <div class="dork-example">
                <code>Estructura de Carpetas</code>
                <p>YYYY-MM-DD_CaseName/01_Sources/02_Evidence/03_Analysis/04_Report</p>
              </div>
              <div class="dork-example">
                <code>Naming Convention</code>
                <p>YYYY-MM-DD_HH-MM_Source_Description</p>
              </div>
              <div class="dork-example">
                <code>Metadata Logging</code>
                <p>URL, timestamp, hash, tool used, analyst</p>
              </div>
            </div>
            <div class="ethics-rules">
              <div class="rule-item good">
                <h3>✅ Mejores Prácticas</h3>
                <ul>
                  <li>Documentar en tiempo real, no después</li>
                  <li>Incluir información que permita replicar</li>
                  <li>Separar claramente hechos de análisis</li>
                  <li>Usar herramientas de hash para integridad</li>
                  <li>Backup múltiple de evidencia crítica</li>
                </ul>
              </div>
            </div>
            <div class="highlight-box">
              <p>⚖️ <strong>Principio legal:</strong> Si no está documentado, no ocurrió</p>
            </div>
          `,
          interactive: {
            type: 'documentation_practice',
            elements: ['evidence_capture', 'metadata_logging', 'chain_custody', 'report_structure']
          }
        },
        {
          id: 6,
          title: "Ética y Responsabilidad Profesional",
          content: `
            <h2>El Peso de la Información</h2>
            <p>Con gran poder analítico viene gran responsabilidad. Los analistas OSINT manejan información que puede afectar vidas:</p>
            <div class="ethics-rules">
              <div class="rule-item good">
                <h3>✅ Responsabilidades Éticas</h3>
                <ul>
                  <li><strong>Precisión:</strong> Verificar múltiples veces antes de reportar</li>
                  <li><strong>Proporcionalidad:</strong> Usar mínima intrusión necesaria</li>
                  <li><strong>Transparencia:</strong> Documentar métodos y limitaciones</li>
                  <li><strong>Confidencialidad:</strong> Proteger información sensible</li>
                  <li><strong>Objetividad:</strong> Presentar hechos, no interpretaciones sesgadas</li>
                </ul>
              </div>
              <div class="rule-item bad">
                <h3>❌ Líneas Rojas Profesionales</h3>
                <ul>
                  <li>Nunca publicar información personal sin justificación</li>
                  <li>No usar métodos ilegales o no éticos</li>
                  <li>No permitir que sesgos afecten análisis</li>
                  <li>No exagerar certeza de conclusiones</li>
                  <li>No omitir evidencia contradictoria</li>
                </ul>
              </div>
            </div>
            <div class="applications-grid">
              <div class="app-card">
                <h3>⚖️ Dilemas Éticos Comunes</h3>
                <p>Información que podría dañar a inocentes</p>
                <p>Presión para conclusiones rápidas</p>
                <p>Conflicto entre transparencia y privacidad</p>
              </div>
              <div class="app-card">
                <h3>🛡️ Marco de Decisión Ética</h3>
                <p>1. ¿Es legal? 2. ¿Es ético? 3. ¿Es necesario?</p>
                <p>4. ¿Minimiza daño? 5. ¿Puedo defenderlo públicamente?</p>
              </div>
            </div>
            <div class="highlight-box">
              <p>🎯 <strong>Regla fundamental:</strong> Tu reputación profesional es tu activo más valioso</p>
            </div>
          `,
          interactive: {
            type: 'ethical_scenarios',
            dilemmas: ['privacy_vs_truth', 'source_protection', 'incomplete_evidence', 'time_pressure']
          }
        },
        {
          id: 7,
          title: "Autoevaluación - Módulo 5",
          content: `
            <h2>🎯 Evalúa tu Mentalidad de Analista OSINT</h2>
            <p>Demuestra tu comprensión de la metodología y ética del análisis profesional:</p>
          `,
          interactive: {
            type: 'quiz',
            questions: [
              {
                question: "¿Cuál es el primer paso en el ciclo de hipótesis?",
                options: ["Formular teorías", "Observación inicial", "Recopilar evidencia"],
                correct: 1,
                explanation: "Siempre debemos comenzar con observación cuidadosa antes de formular hipótesis."
              },
              {
                question: "¿Qué caracteriza al sesgo de confirmación?",
                options: ["Buscar solo evidencia que confirme nuestras creencias", "Dar peso excesivo a la primera información", "Seguir la opinión mayoritaria"],
                correct: 0,
                explanation: "El sesgo de confirmación nos lleva a buscar solo información que apoye lo que ya creemos."
              },
              {
                question: "¿Qué tipo de fuente tiene mayor credibilidad?",
                options: ["Fuentes secundarias", "Fuentes primarias", "Fuentes anónimas"],
                correct: 1,
                explanation: "Las fuentes primarias (testigos directos, documentos originales) tienen mayor credibilidad."
              },
              {
                question: "¿Cuándo debes documentar tu investigación?",
                options: ["Al final del análisis", "En tiempo real mientras investigas", "Solo los resultados importantes"],
                correct: 1,
                explanation: "La documentación debe ser en tiempo real para mantener precisión y cadena de custodia."
              },
              {
                question: "¿Cuál es la pregunta ética más importante?",
                options: ["¿Es rápido?", "¿Es legal y ético?", "¿Es fácil?"],
                correct: 1,
                explanation: "Siempre debemos evaluar la legalidad y ética de nuestros métodos antes de proceder."
              }
            ]
          }
        }
      ]
    }
  }

  const currentLesson = lessons[lessonId]

  useEffect(() => {
    if (currentLesson) {
      setProgress((currentSlide + 1) / currentLesson.totalSlides * 100)
    }
  }, [currentSlide, currentLesson])

  const handleNext = () => {
    if (currentSlide < currentLesson.totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      // Finalizar módulo y volver a la lista de módulos OSINT
      setIsCompleted(true)
      navigate('/academy', { state: { selectedAcademy: 'osint' } })
    }
  }

  const handleQuizAnswer = (questionIndex, selectedAnswer) => {
    const newResults = { ...quizResults }
    newResults[questionIndex] = selectedAnswer
    setQuizResults(newResults)
  }

  const submitQuiz = () => {
    setShowQuizResults(true)
  }

  const calculateQuizScore = () => {
    const currentSlideData = currentLesson.slides[currentSlide]
    if (!currentSlideData.interactive || currentSlideData.interactive.type !== 'quiz') return 0
    
    const questions = currentSlideData.interactive.questions
    let correct = 0
    
    questions.forEach((question, index) => {
      if (quizResults[index] === question.correct) {
        correct++
      }
    })
    
    return Math.round((correct / questions.length) * 100)
  }

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleBackToAcademy = () => {
    navigate('/academy')
  }

  if (!currentLesson) {
    return (
      <div className="lesson-error">
        <h2>Lección no encontrada</h2>
        <button onClick={handleBackToAcademy}>Volver a la Academia</button>
      </div>
    )
  }

  const currentSlideData = currentLesson.slides[currentSlide]

  return (
    <div className="lesson-viewer">
      <div className="lesson-header">
        <button onClick={handleBackToAcademy} className="back-button">
          <ChevronLeft size={20} />
          Volver a la Academia
        </button>
        <div className="lesson-info">
          <h1>{currentLesson.title}</h1>
          <p>{currentLesson.description}</p>
        </div>
        <div className="lesson-progress">
          <span>{currentSlide + 1} / {currentLesson.totalSlides}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="lesson-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="slide"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="slide-content">
              <div 
                className="slide-text"
                dangerouslySetInnerHTML={{ __html: currentSlideData.content }}
              />
              
              {/* Componente interactivo - solo elementos esenciales */}
              {currentSlideData.interactive && ['quiz', 'icons', 'progress_bar'].includes(currentSlideData.interactive.type) && (
                <div className="interactive-section">
                  {renderInteractiveComponent(currentSlideData.interactive)}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="lesson-navigation">
        <button 
          onClick={handlePrevious}
          disabled={currentSlide === 0}
          className="nav-button prev"
        >
          <ChevronLeft size={20} />
          Anterior
        </button>
        
        <div className="slide-indicators">
          {Array.from({ length: currentLesson.totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'completed' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="nav-button next"
        >
          {currentSlide === currentLesson.totalSlides - 1 ? 'Finalizar' : 'Siguiente'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )

  function renderInteractiveComponent(interactive) {
    switch (interactive.type) {
      case 'icons':
        return (
          <div className="icons-showcase">
            {interactive.items.map((item, index) => (
              <motion.div
                key={index}
                className="icon-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <item.icon size={48} />
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>
        )
      
      case 'progress_bar':
        return (
          <div className="stats-bars">
            {interactive.items.map((item, index) => (
              <div key={index} className="stat-bar">
                <div className="stat-label">
                  <span>{item.label}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="bar">
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'quiz':
        return (
          <div className="quiz-container">
            {!showQuizResults ? (
              <>
                {interactive.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="quiz-question">
                    <h4>Pregunta {questionIndex + 1}:</h4>
                    <p>{question.question}</p>
                    <div className="quiz-options">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="quiz-option">
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={optionIndex}
                            onChange={() => handleQuizAnswer(questionIndex, optionIndex)}
                            checked={quizResults[questionIndex] === optionIndex}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button 
                  className="quiz-submit"
                  onClick={submitQuiz}
                  disabled={Object.keys(quizResults).length < interactive.questions.length}
                >
                  Enviar Respuestas
                </button>
              </>
            ) : (
              <div className="quiz-results">
                <h3>🎯 Resultados de la Autoevaluación</h3>
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-number">{calculateQuizScore()}%</span>
                  </div>
                  <p className="score-text">
                    {calculateQuizScore() >= 80 
                      ? "¡Excelente! Dominas este módulo" 
                      : calculateQuizScore() >= 60 
                      ? "Bien, pero puedes mejorar" 
                      : "Necesitas repasar el contenido"}
                  </p>
                </div>
                <div className="quiz-review">
                  {interactive.questions.map((question, questionIndex) => {
                    const isCorrect = quizResults[questionIndex] === question.correct
                    return (
                      <div key={questionIndex} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <h4>{question.question}</h4>
                        <p className="user-answer">
                          Tu respuesta: {question.options[quizResults[questionIndex]]}
                        </p>
                        {!isCorrect && (
                          <p className="correct-answer">
                            Respuesta correcta: {question.options[question.correct]}
                          </p>
                        )}
                        <p className="explanation">{question.explanation}</p>
                      </div>
                    )
                  })}
                </div>
                {calculateQuizScore() < 80 && (
                  <button 
                    className="retry-quiz"
                    onClick={() => {
                      setQuizResults({})
                      setShowQuizResults(false)
                    }}
                  >
                    Intentar de Nuevo
                  </button>
                )}
              </div>
            )}
          </div>
        )
      
      case 'dork_builder':
        return (
          <div className="interactive-section">
            <h4>🔍 Ejemplos de Google Dorks:</h4>
            <div className="dorks-examples">
              {interactive.examples.map((example, index) => (
                <div key={index} className="dork-example">
                  <code>{example}</code>
                  <p>Ejemplo de consulta avanzada</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'click_reveal':
        return (
          <div className="interactive-section">
            <h4>💡 Haz clic para más información:</h4>
            <div className="applications-grid">
              {interactive.items.map((item, index) => (
                <div key={index} className="app-card">
                  <h3>{item.trigger}</h3>
                  <p>{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'methodology_flow':
        return (
          <div className="interactive-section">
            <h4>📋 Proceso de {interactive.steps} pasos completado</h4>
            <p>Sigue esta metodología para obtener mejores resultados en tus investigaciones OSINT</p>
          </div>
        )
      
      case 'ethics_quiz':
        return (
          <div className="interactive-section">
            <h4>⚖️ Reflexión Ética:</h4>
            {interactive.questions.map((q, index) => (
              <div key={index} className="ethics-question">
                <p><strong>Pregunta:</strong> {q.question}</p>
                <p><strong>Respuesta:</strong> {q.correct}</p>
              </div>
            ))}
          </div>
        )
      
      case 'tool_demo':
        return (
          <div className="interactive-section">
            <h4>🛠️ Herramientas Destacadas:</h4>
            <div className="tools-showcase">
              {interactive.tools.map((tool, index) => (
                <div key={index} className="tool-item">
                  <strong>🔧 {tool}</strong>
                  <p>Herramienta esencial para OSINT</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'temporal_search':
        return (
          <div className="interactive-section">
            <h4>📅 Tipos de Búsqueda Temporal:</h4>
            <div className="search-types">
              {interactive.examples.map((type, index) => (
                <div key={index} className="search-type">
                  <span>🕒 {type}</span>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'generator_preview':
        return (
          <div className="interactive-section">
            <h4>⚡ Características del Generador:</h4>
            <div className="features-grid">
              {interactive.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span>✨ {feature.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'platform_stats':
      case 'visual_stats':
        return (
          <div className="interactive-section">
            <h4>📊 Estadísticas de Plataformas:</h4>
            <div className="stats-showcase">
              {interactive.platforms?.map((platform, index) => (
                <div key={index} className="stat-item">
                  <strong>{platform.name}</strong>
                  <span>{platform.users} usuarios</span>
                </div>
              )) || <p>Datos de estadísticas de plataformas sociales</p>}
            </div>
          </div>
        )
      
      case 'facebook_search_demo':
      case 'twitter_search_demo':
      case 'instagram_search_demo':
      case 'linkedin_search_demo':
      case 'cross_platform_demo':
        return (
          <div className="interactive-section">
            <h4>🔍 Demo de Búsqueda en Redes Sociales:</h4>
            <div className="demo-content">
              <p>Técnicas específicas para buscar en esta plataforma social</p>
              <div className="search-tips">
                {interactive.techniques?.map((technique, index) => (
                  <div key={index} className="tip-item">
                    <span>💡 {technique}</span>
                  </div>
                )) || (
                  <div className="tip-item">
                    <span>💡 Usa operadores específicos de la plataforma</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'file_search_demo':
      case 'documentation_practice':
        return (
          <div className="interactive-section">
            <h4>📁 Demo de Búsqueda de Archivos:</h4>
            <div className="file-demo">
              <p>Ejemplos de búsqueda especializada de documentos</p>
              <div className="file-types">
                {interactive.fileTypes?.map((type, index) => (
                  <div key={index} className="file-type">
                    <code>filetype:{type}</code>
                  </div>
                )) || (
                  <div className="file-type">
                    <code>filetype:pdf</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'exif_analysis_demo':
      case 'reverse_search_demo':
      case 'geolocation_demo':
      case 'manipulation_detection':
        return (
          <div className="interactive-section">
            <h4>🖼️ Análisis de Imágenes:</h4>
            <div className="image-analysis">
              <p>Técnicas avanzadas de verificación de imágenes</p>
              <div className="analysis-tools">
                {interactive.techniques?.map((technique, index) => (
                  <div key={index} className="analysis-tool">
                    <span>🔧 {technique.replace(/_/g, ' ')}</span>
                  </div>
                )) || interactive.engines?.map((engine, index) => (
                  <div key={index} className="analysis-tool">
                    <span>🌐 {engine}</span>
                  </div>
                )) || (
                  <div className="analysis-tool">
                    <span>🔧 Análisis de metadatos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'mindset_assessment':
      case 'source_evaluation':
      case 'ethical_scenarios':
      case 'bias_training':
        return (
          <div className="interactive-section">
            <h4>🧠 Desarrollo del Pensamiento Analítico:</h4>
            <div className="mindset-content">
              <p>Ejercicios para desarrollar habilidades de análisis crítico</p>
              <div className="mindset-principles">
                {interactive.principles?.map((principle, index) => (
                  <div key={index} className="principle-item">
                    <span>🎯 {principle}</span>
                  </div>
                )) || interactive.scenarios?.map((scenario, index) => (
                  <div key={index} className="principle-item">
                    <span>📋 {scenario}</span>
                  </div>
                )) || (
                  <div className="principle-item">
                    <span>🎯 Mantén objetividad en el análisis</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'workflow_demo':
      case 'hypothesis_cycle':
        return (
          <div className="interactive-section">
            <h4>🔄 Flujo de Trabajo OSINT:</h4>
            <div className="workflow-content">
              <p>Metodología sistemática para investigaciones efectivas</p>
              <div className="workflow-steps">
                {interactive.steps?.map((step, index) => (
                  <div key={index} className="workflow-step">
                    <span>{index + 1}. {step}</span>
                  </div>
                )) || (
                  <div className="workflow-step">
                    <span>1. Planificar → 2. Recopilar → 3. Analizar → 4. Verificar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }
}

export default LessonViewer