import React from 'react'
import './Loading.css'

/**
 * Componente de carga reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.size - Tamaño del spinner ('sm', 'md', 'lg')
 * @param {string} props.color - Color del spinner
 * @param {string} props.text - Texto a mostrar
 * @param {boolean} props.overlay - Si debe mostrar overlay de fondo
 * @param {string} props.className - Clases CSS adicionales
 */
const Loading = ({ 
  size = 'md', 
  color = 'primary', 
  text = null, 
  overlay = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'loading-spinner--sm',
    md: 'loading-spinner--md',
    lg: 'loading-spinner--lg'
  }

  const colorClasses = {
    primary: 'loading-spinner--primary',
    secondary: 'loading-spinner--secondary',
    white: 'loading-spinner--white',
    gray: 'loading-spinner--gray'
  }

  const spinnerClass = `loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`

  const content = (
    <div className="loading-container">
      <div className={spinnerClass}>
        <div className="loading-spinner__circle"></div>
        <div className="loading-spinner__circle"></div>
        <div className="loading-spinner__circle"></div>
        <div className="loading-spinner__circle"></div>
      </div>
      {text && (
        <p className="loading-text">{text}</p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    )
  }

  return content
}

// Componente de skeleton para carga de contenido
export const SkeletonLoader = ({ 
  lines = 3, 
  height = '1rem', 
  className = '' 
}) => {
  return (
    <div className={`skeleton-loader ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div 
          key={index}
          className="skeleton-line"
          style={{ 
            height,
            width: index === lines - 1 ? '75%' : '100%'
          }}
        />
      ))}
    </div>
  )
}

// Componente de loading para cards
export const CardSkeleton = ({ count = 1, className = '' }) => {
  return (
    <div className={`card-skeleton-container ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card-skeleton">
          <div className="card-skeleton__header">
            <div className="card-skeleton__avatar"></div>
            <div className="card-skeleton__title">
              <div className="skeleton-line skeleton-line--title"></div>
              <div className="skeleton-line skeleton-line--subtitle"></div>
            </div>
          </div>
          <div className="card-skeleton__content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line skeleton-line--short"></div>
          </div>
          <div className="card-skeleton__footer">
            <div className="skeleton-line skeleton-line--button"></div>
            <div className="skeleton-line skeleton-line--button"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente de loading para listas
export const ListSkeleton = ({ count = 5, className = '' }) => {
  return (
    <div className={`list-skeleton ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="list-skeleton__item">
          <div className="list-skeleton__icon"></div>
          <div className="list-skeleton__content">
            <div className="skeleton-line skeleton-line--title"></div>
            <div className="skeleton-line skeleton-line--subtitle"></div>
          </div>
          <div className="list-skeleton__action"></div>
        </div>
      ))}
    </div>
  )
}

// Componente de loading para el árbol D3
export const TreeSkeleton = ({ className = '' }) => {
  return (
    <div className={`tree-skeleton ${className}`}>
      <div className="tree-skeleton__center">
        <div className="tree-skeleton__node tree-skeleton__node--center"></div>
      </div>
      <div className="tree-skeleton__branches">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="tree-skeleton__branch">
            <div className="tree-skeleton__line"></div>
            <div className="tree-skeleton__node"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook para manejar estados de carga
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState)

  const startLoading = React.useCallback(() => {
    setIsLoading(true)
  }, [])

  const stopLoading = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  const withLoading = React.useCallback(async (asyncFunction) => {
    try {
      startLoading()
      const result = await asyncFunction()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}

export default Loading