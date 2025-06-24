import React from 'react'
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react'
import './DisclaimerModal.css'

const DisclaimerModal = ({ onAccept, onDecline }) => {
  const handleOverlayClick = (e) => {
    // Evitar que se cierre al hacer click en el overlay
    e.stopPropagation()
  }

  const handleDecline = () => {
    // Cerrar la ventana o redirigir fuera del sitio
    window.close()
    // Si window.close() no funciona (navegadores modernos), redirigir a página externa
    if (!window.closed) {
      window.location.href = 'about:blank'
    }
    onDecline()
  }

  return (
    <div className="disclaimer-modal-overlay" onClick={handleOverlayClick}>
      <div className="disclaimer-modal">
        <div className="disclaimer-header">
          <div className="disclaimer-logo">
            <img 
              src="/src/assets/images/OSINTA2.png" 
              alt="OSINT Argy Logo" 
              className="disclaimer-logo-image"
            />
          </div>
        </div>

        <div className="disclaimer-content">
          <div className="warning-section">
            <AlertTriangle className="warning-icon" size={24} />
            <h2>Descargo de Responsabilidad</h2>
          </div>

          <div className="disclaimer-text">
            <p>
              <strong>IMPORTANTE:</strong> Al utilizar OSINTArgy, usted acepta expresamente los siguientes términos:
            </p>

            <div className="disclaimer-points">
              <div className="disclaimer-point">
                <CheckCircle size={16} className="point-icon" />
                <div>
                  <strong>Uso Educativo y Defensivo:</strong> Las herramientas proporcionadas están destinadas 
                  exclusivamente para fines educativos, investigación académica y ciberseguridad defensiva.
                </div>
              </div>

              <div className="disclaimer-point">
                <CheckCircle size={16} className="point-icon" />
                <div>
                  <strong>Responsabilidad del Usuario:</strong> Usted es el único responsable del uso que haga 
                  de estas herramientas. El mal uso, actividades ilegales o no éticas son responsabilidad exclusiva del usuario.
                </div>
              </div>

              <div className="disclaimer-point">
                <CheckCircle size={16} className="point-icon" />
                <div>
                  <strong>Cumplimiento Legal:</strong> Debe cumplir con todas las leyes locales, nacionales e 
                  internacionales aplicables. No utilice estas herramientas para actividades ilegales.
                </div>
              </div>

              <div className="disclaimer-point">
                <CheckCircle size={16} className="point-icon" />
                <div>
                  <strong>Límite de Responsabilidad:</strong> Los desarrolladores de OSINTArgy no se hacen 
                  responsables de ningún daño, pérdida o consecuencia derivada del uso de estas herramientas.
                </div>
              </div>

              <div className="disclaimer-point">
                <CheckCircle size={16} className="point-icon" />
                <div>
                  <strong>Privacidad y Ética:</strong> Respete la privacidad de las personas y utilice las 
                  herramientas de manera ética y responsable.
                </div>
              </div>

              <div className="disclaimer-point">
                <CheckCircle size={16} className="point-icon" />
                <div>
                  <strong>Disponibilidad de Herramientas:</strong> No garantizamos la disponibilidad, 
                  funcionamiento o precisión de herramientas externas de terceros. Los servicios externos 
                  pueden cambiar, fallar o discontinuarse sin previo aviso.
                </div>
              </div>
            </div>

            <div className="legal-notice">
              <p>
                <strong>AVISO LEGAL:</strong> Esta plataforma se proporciona "tal como está" sin garantías 
                de ningún tipo. El uso indebido de herramientas OSINT puede violar leyes de privacidad, 
                ciberseguridad y otras regulaciones aplicables.
              </p>
            </div>
          </div>
        </div>

        <div className="disclaimer-actions">
          <button 
            className="btn-decline" 
            onClick={handleDecline}
            aria-label="Rechazar términos y salir"
          >
            <X size={20} />
            Salir de la Página
          </button>
          
          <button 
            className="btn-accept" 
            onClick={onAccept}
            aria-label="Aceptar términos y continuar"
          >
            <CheckCircle size={20} />
            Acepto los Términos
          </button>
        </div>

        <div className="disclaimer-footer">
          <p>
            Al hacer click en "Acepto los Términos", confirma que ha leído, entendido y acepta 
            cumplir con este descargo de responsabilidad.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DisclaimerModal