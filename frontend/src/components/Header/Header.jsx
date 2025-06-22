import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, User, Settings, LogOut, Heart, History, FileText, Target } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { debounce } from '@utils/helpers'
import { SEARCH } from '@utils/constants'
import './Header.css'

/**
 * Componente Header principal de OSINTArgy
 * @param {Object} props - Propiedades del componente
 * @param {string} props.currentView - Vista actual ('tree' o 'cards')
 * @param {Function} props.onViewChange - Función para cambiar vista
 * @param {Function} props.onSearch - Función para realizar búsqueda
 * @param {string} props.searchQuery - Query de búsqueda actual
 * @param {Function} props.onUserPanelToggle - Función para toggle del panel de usuario
 * @param {Object} props.user - Datos del usuario actual
 */
const Header = ({
  currentView,
  onViewChange,
  onSearch,
  searchQuery,
  onUserPanelToggle,
  user
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchQuery || '')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const searchInputRef = useRef(null)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () => debounce((query) => {
      if (onSearch) {
        onSearch(query)
      }
    }, SEARCH.DEBOUNCE_DELAY),
    [onSearch]
  )

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    
    if (value.length >= SEARCH.MIN_QUERY_LENGTH) {
      debouncedSearch(value)
      // Aquí podrías agregar lógica para obtener sugerencias
      // setSearchSuggestions(await getSuggestions(value))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSearchSuggestions([])
    }
  }

  // Manejar submit del formulario de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchValue.trim().length >= SEARCH.MIN_QUERY_LENGTH) {
      if (onSearch) {
        onSearch(searchValue.trim())
      }
      setShowSuggestions(false)
    }
  }

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchValue('')
    setShowSuggestions(false)
    if (onSearch) {
      onSearch('')
    }
  }

  // Manejar logout
  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Sincronizar searchValue con searchQuery prop
  useEffect(() => {
    setSearchValue(searchQuery || '')
  }, [searchQuery])

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo y título */}
        <div className="header__brand">
          <Link to="/" className="header__logo">
            <div className="header__logo-icon">
              🇦🇷
            </div>
            <div className="header__logo-text">
              <span className="header__logo-title">OSINTArgy</span>
              <span className="header__logo-subtitle">Framework OSINT Argentino</span>
            </div>
          </Link>
        </div>

        {/* Barra de búsqueda */}
        <div className="header__search">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-container">
              <Search className="search-icon" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar herramientas OSINT..."
                value={searchValue}
                onChange={handleSearchChange}
                className="search-input"
                autoComplete="off"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="search-clear"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sugerencias de búsqueda */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="search-suggestion"
                    onClick={() => {
                      setSearchValue(suggestion)
                      if (onSearch) {
                        onSearch(suggestion)
                      }
                      setShowSuggestions(false)
                    }}
                  >
                    <Search size={16} />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Controles de vista */}
        <div className="header__view-controls">
          <div className="view-toggle">
            <button
              className={`view-toggle__button ${currentView === 'tree' ? 'view-toggle__button--active' : ''}`}
              onClick={() => onViewChange('tree')}
              aria-label="Vista árbol"
              title="Vista árbol"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="m21 12-6-6-6 6-6-6"/>
              </svg>
            </button>
            <button
              className={`view-toggle__button ${currentView === 'cards' ? 'view-toggle__button--active' : ''}`}
              onClick={() => onViewChange('cards')}
              aria-label="Vista cards"
              title="Vista cards"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Menú de usuario */}
        <div className="header__user">
          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-menu__trigger"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Menú de usuario"
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <span className="user-name">{user.name}</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu__dropdown">
                  <div className="user-menu__header">
                    <div className="user-avatar user-avatar--large">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-info__name">{user.name}</div>
                      <div className="user-info__email">{user.email}</div>
                    </div>
                  </div>

                  <div className="user-menu__section">
                    <Link
                      to="/dorks"
                      className="user-menu__item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Target size={16} />
                      Generador de Dorks
                    </Link>
                  </div>

                  <div className="user-menu__section">
                    <button
                      className="user-menu__item"
                      onClick={() => {
                        onUserPanelToggle()
                        setIsUserMenuOpen(false)
                      }}
                    >
                      <Heart size={16} />
                      Favoritos
                    </button>
                    <button
                      className="user-menu__item"
                      onClick={() => {
                        onUserPanelToggle()
                        setIsUserMenuOpen(false)
                      }}
                    >
                      <History size={16} />
                      Historial
                    </button>
                    <button
                      className="user-menu__item"
                      onClick={() => {
                        onUserPanelToggle()
                        setIsUserMenuOpen(false)
                      }}
                    >
                      <FileText size={16} />
                      Mis Notas
                    </button>
                  </div>

                  <div className="user-menu__section">
                    <Link
                      to="/perfil"
                      className="user-menu__item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} />
                      Configuración
                    </Link>
                  </div>

                  <div className="user-menu__section">
                    <button
                      className="user-menu__item user-menu__item--danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth" className="auth-button auth-button--secondary">
                Iniciar Sesión
              </Link>
              <Link to="/auth?mode=register" className="auth-button auth-button--primary">
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Menú móvil */}
        <button
          className="header__mobile-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú móvil expandido */}
      {isMenuOpen && (
        <div className="header__mobile-nav">
          <div className="mobile-search">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-container">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Buscar herramientas..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="search-clear"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="mobile-view-controls">
            <button
              className={`mobile-view-button ${currentView === 'tree' ? 'mobile-view-button--active' : ''}`}
              onClick={() => {
                onViewChange('tree')
                setIsMenuOpen(false)
              }}
            >
              Vista Árbol
            </button>
            <button
              className={`mobile-view-button ${currentView === 'cards' ? 'mobile-view-button--active' : ''}`}
              onClick={() => {
                onViewChange('cards')
                setIsMenuOpen(false)
              }}
            >
              Vista Cards
            </button>
          </div>

          {user ? (
            <div className="mobile-user-menu">
              <div className="mobile-user-info">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <div className="mobile-user-actions">
                <Link
                  to="/dorks"
                  className="mobile-user-action"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Target size={16} />
                  Generador de Dorks
                </Link>
                <button
                  className="mobile-user-action"
                  onClick={() => {
                    onUserPanelToggle()
                    setIsMenuOpen(false)
                  }}
                >
                  <Heart size={16} />
                  Favoritos
                </button>
                <Link
                  to="/perfil"
                  className="mobile-user-action"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={16} />
                  Configuración
                </Link>
                <button
                  className="mobile-user-action mobile-user-action--danger"
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="mobile-auth">
              <Link
                to="/auth"
                className="mobile-auth-button mobile-auth-button--secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/auth?mode=register"
                className="mobile-auth-button mobile-auth-button--primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Header