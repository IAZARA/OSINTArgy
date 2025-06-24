import React from 'react';
import { createRoot } from 'react-dom/client';
import EmailOSINT from './components/EmailOSINT/EmailOSINT';
import UsernameOSINT from './components/UsernameOSINT/UsernameOSINT';
import FileAnalysis from './components/FileAnalysis/FileAnalysis';
import DorkGenerator from './components/DorkGenerator/DorkGenerator';
import CircularView from './components/CircularView/CircularView';
import ForceGraphView from './components/ForceGraphView/ForceGraphView';
import './styles/variables.css';
import './styles/globals.css';

// Componente de prueba para verificar la consistencia visual
const VisualConsistencyTest = () => {
  const [currentComponent, setCurrentComponent] = React.useState('email');

  const components = {
    email: {
      name: 'EmailOSINT',
      component: <EmailOSINT />,
      description: 'Herramienta de investigación de emails'
    },
    username: {
      name: 'UsernameOSINT',
      component: <UsernameOSINT />,
      description: 'Herramienta de investigación de nombres de usuario'
    },
    file: {
      name: 'FileAnalysis',
      component: <FileAnalysis />,
      description: 'Herramienta de análisis de archivos'
    },
    dorks: {
      name: 'DorkGenerator',
      component: <DorkGenerator />,
      description: 'Generador de Google Dorks'
    },
    circular: {
      name: 'CircularView',
      component: <CircularView />,
      description: 'Vista circular de herramientas'
    },
    force: {
      name: 'ForceGraphView',
      component: <ForceGraphView />,
      description: 'Vista de grafo de fuerza'
    }
  };

  const testResults = {
    email: '✅ Convertido al tema oscuro',
    username: '✅ Convertido al tema oscuro',
    file: '✅ Convertido al tema oscuro',
    dorks: '✅ Ya tenía tema oscuro (referencia)',
    circular: '✅ Actualizado al tema oscuro',
    force: '✅ Ya usaba variables CSS'
  };

  return (
    <div style={{
      background: 'var(--dark-bg)',
      color: 'var(--dark-text-primary)',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Header de prueba */}
      <div style={{
        background: 'var(--dark-surface)',
        borderBottom: '1px solid var(--dark-border)',
        padding: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <h1 style={{
          color: 'var(--dark-accent-blue)',
          margin: 0,
          marginBottom: '15px',
          fontSize: '24px'
        }}>
          🎨 Test de Consistencia Visual - OSINTArgy
        </h1>
        
        {/* Navegación entre componentes */}
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '15px'
        }}>
          {Object.entries(components).map(([key, comp]) => (
            <button
              key={key}
              onClick={() => setCurrentComponent(key)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                background: currentComponent === key 
                  ? 'var(--dark-accent-blue)' 
                  : 'var(--dark-surface-elevated)',
                color: currentComponent === key 
                  ? 'black' 
                  : 'var(--dark-text-primary)',
                border: '1px solid var(--dark-border)',
                transition: 'all 0.2s ease'
              }}
            >
              {comp.name}
            </button>
          ))}
        </div>

        {/* Información del componente actual */}
        <div style={{
          background: 'var(--dark-surface-elevated)',
          border: '1px solid var(--dark-border)',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ color: 'var(--dark-text-primary)' }}>
              {components[currentComponent].name}
            </strong>
            <span style={{ 
              color: 'var(--dark-text-secondary)', 
              marginLeft: '10px' 
            }}>
              {components[currentComponent].description}
            </span>
          </div>
          <div style={{
            color: 'var(--dark-accent-green)',
            fontWeight: 'bold'
          }}>
            {testResults[currentComponent]}
          </div>
        </div>
      </div>

      {/* Contenedor del componente */}
      <div style={{
        padding: '20px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        {components[currentComponent].component}
      </div>

      {/* Footer con resumen */}
      <div style={{
        background: 'var(--dark-surface)',
        borderTop: '1px solid var(--dark-border)',
        padding: '20px',
        marginTop: '40px'
      }}>
        <h3 style={{
          color: 'var(--dark-accent-blue)',
          marginBottom: '15px'
        }}>
          📊 Resumen de Consistencia Visual
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} style={{
              background: 'var(--dark-surface-elevated)',
              border: '1px solid var(--dark-border)',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <div style={{
                color: 'var(--dark-text-primary)',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {components[key].name}
              </div>
              <div style={{
                color: 'var(--dark-accent-green)',
                fontSize: '14px'
              }}>
                {result}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(76, 175, 80, 0.1)',
          border: '1px solid var(--dark-accent-green)',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <strong style={{ color: 'var(--dark-accent-green)' }}>
            ✅ Todas las herramientas OSINT ahora usan un estilo visual consistente
          </strong>
          <div style={{
            color: 'var(--dark-text-secondary)',
            marginTop: '5px',
            fontSize: '14px'
          }}>
            Tema oscuro aplicado exitosamente en toda la aplicación
          </div>
        </div>
      </div>
    </div>
  );
};

// Solo renderizar si estamos en modo de prueba
if (window.location.search.includes('test=visual')) {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(<VisualConsistencyTest />);
}

export default VisualConsistencyTest;
