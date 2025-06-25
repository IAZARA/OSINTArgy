import React from 'react'
import { Shield, Globe, Users, Code, Heart, ExternalLink, Github, Mail } from 'lucide-react'
import logoImage from '@/assets/images/OSINTA2.png'
import './About.css'

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        {/* Header */}
        <div className="about-header">
          <div className="about-logo">
            <img 
              src={logoImage} 
              alt="OSINT Argy Logo" 
              className="about-logo-image"
            />
          </div>
        </div>

        {/* Content */}
        <div className="about-content">
          {/* Misión */}
          <section className="about-section">
            <div className="section-header">
              <Shield className="section-icon" size={24} />
              <h2>Misión</h2>
            </div>
            <p>
              OSINT Argy es una plataforma integral diseñada para democratizar el acceso a herramientas 
              de inteligencia de fuentes abiertas (OSINT) en Argentina y Latinoamérica. El objetivo 
              es proporcionar a investigadores, analistas de seguridad y profesionales de ciberseguridad 
              las herramientas necesarias para realizar investigaciones éticas y defensivas.
            </p>
          </section>

          {/* Herramientas Integradas */}
          <section className="about-section">
            <div className="section-header">
              <Code className="section-icon" size={24} />
              <h2>Herramientas del Sistema</h2>
            </div>
            <div className="tools-list">
              <div className="tool-item">
                <div className="tool-info">
                  <h4>Generador de Dorks</h4>
                  <p>Crea consultas avanzadas para motores de búsqueda como Google, Bing y más.</p>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-info">
                  <h4>OSINT de Emails</h4>
                  <p>Verifica la validez de emails y busca información en brechas de datos.</p>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-info">
                  <h4>Análisis de Archivos</h4>
                  <p>Extrae metadatos de imágenes y documentos para obtener información útil.</p>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-info">
                  <h4>Búsqueda de Usernames</h4>
                  <p>Encuentra perfiles de usuario en múltiples plataformas sociales.</p>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-info">
                  <h4>Scanner de Infraestructura</h4>
                  <p>Análisis defensivo de superficie de ataque y evaluación de seguridad.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Responsabilidad */}
          <section className="about-section">
            <div className="section-header">
              <Shield className="section-icon" size={24} />
              <h2>Uso Responsable</h2>
            </div>
            <div className="responsibility-notice">
              <p>
                <strong>OSINT Argy</strong> está diseñado exclusivamente para:
              </p>
              <ul>
                <li>Investigación académica y educativa</li>
                <li>Ciberseguridad defensiva</li>
                <li>Análisis de amenazas</li>
                <li>Auditorías de seguridad autorizadas</li>
              </ul>
              <p>
                <strong>No me hago responsable</strong> del mal uso de estas herramientas. 
                El usuario es completamente responsable de cumplir con todas las leyes locales 
                e internacionales aplicables.
              </p>
            </div>
          </section>

          {/* Tecnología */}
          <section className="about-section">
            <div className="section-header">
              <Code className="section-icon" size={24} />
              <h2>Tecnología</h2>
            </div>
            <div className="tech-info">
              <p>
                OSINT Argy está construido con tecnologías modernas y open source:
              </p>
              <div className="tech-stack">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Node.js</span>
                <span className="tech-tag">Express</span>
                <span className="tech-tag">JavaScript</span>
                <span className="tech-tag">CSS3</span>
                <span className="tech-tag">REST APIs</span>
              </div>
            </div>
          </section>

          {/* Sobre el Proyecto */}
          <section className="about-section">
            <div className="section-header">
              <Code className="section-icon" size={24} />
              <h2>Sobre el Proyecto</h2>
            </div>
            <div className="project-info">
              <p>
                <strong>OSINT Argy</strong> es un proyecto personal de código abierto creado por 
                <strong> Ivan Agustin Zarate</strong> para la comunidad de ciberseguridad de Argentina y Latinoamérica.
              </p>
              <p>
                <strong>¡Los comentarios o sugerencias de nuevas herramientas son extremadamente bienvenidos!</strong> 
                Si encuentras enlaces caídos, tienes sugerencias de mejoras o conoces herramientas OSINT que 
                deberían estar incluidas, no dudes en contactarme.
              </p>
            </div>
          </section>

          {/* Contacto y Colaboración */}
          <section className="about-section">
            <div className="section-header">
              <Mail className="section-icon" size={24} />
              <h2>Contacto y Colaboración</h2>
            </div>
            <div className="contact-info">
              <p>
                Para sugerencias de herramientas, reportes de enlaces caídos o cualquier consulta:
              </p>
              <div className="contact-links">
                <a href="mailto:osintargy@gmail.com" className="contact-link">
                  <Mail size={20} />
                  <div className="contact-content">
                    <span className="contact-title">Email</span>
                    <span className="contact-subtitle">osintargy@gmail.com</span>
                  </div>
                  <ExternalLink size={16} />
                </a>
                <a 
                  href="https://www.linkedin.com/in/ivan-agustin-zarate/" 
                  className="contact-link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <div className="contact-content">
                    <span className="contact-title">LinkedIn</span>
                    <span className="contact-subtitle">Ivan Agustin Zarate</span>
                  </div>
                  <ExternalLink size={16} />
                </a>
                <a href="https://github.com/IAZARA/OSINTArgy" className="contact-link" target="_blank" rel="noopener noreferrer">
                  <Github size={20} />
                  <div className="contact-content">
                    <span className="contact-title">GitHub</span>
                    <span className="contact-subtitle">Contribuir al proyecto</span>
                  </div>
                  <ExternalLink size={16} />
                </a>
              </div>
              <div className="feedback-notice">
                <p>
                  <strong>Tu colaboración es importante:</strong> Ayúdanos a mantener OSINT Argy actualizado 
                  reportando enlaces que no funcionen o sugiriendo nuevas herramientas. Juntos podemos hacer 
                  crecer esta plataforma para toda la comunidad OSINT.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="about-footer">
          <p>
            <strong>Versión:</strong> 1.0.0 | 
            <strong> Última actualización:</strong> Junio 2025 | 
            <strong> Herramientas:</strong> 200+
          </p>
          <p className="footer-disclaimer">
            Recuerda siempre usar estas herramientas de manera ética y responsable.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About