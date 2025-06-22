import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Componentes
import Header from '@components/Header/Header'
import CircularView from '@components/CircularView/CircularView' // Importar nuevo componente
import CardsView from '@components/CardsView/CardsView'
import UserPanel from '@components/UserPanel/UserPanel'
import Auth from '@components/Auth/Auth'
import Loading from '@components/Common/Loading'
import DorkGenerator from '@components/DorkGenerator/DorkGenerator'

// Hooks
import { useAuth } from '@hooks/useAuth'
import { useTools } from '@hooks/useTools'

// Estilos
import './App.css'
import './styles/maltego-theme.css'

function App() {
  const [currentView, setCurrentView] = useState('tree') // 'tree' o 'cards'
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  const { user, isLoading: authLoading } = useAuth()
  const { tools, categories, isLoading: toolsLoading, error } = useTools()

  // Manejar cambio de vista
  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  // Manejar búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  // Manejar selección de categoría
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  // Filtrar herramientas basado en búsqueda y categoría
  const filteredTools = React.useMemo(() => {
    if (!tools) return []
    
    let filtered = tools
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(tool => tool.category === selectedCategory.id)
    }
    
    return filtered
  }, [tools, searchQuery, selectedCategory])

  // Mostrar loading si está cargando
  if (authLoading || toolsLoading) {
    return (
      <div className="app-loading">
        <Loading />
        <p>Cargando OSINTArgy...</p>
      </div>
    )
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className="app-error">
        <h2>Error al cargar la aplicación</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header principal */}
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onUserPanelToggle={() => setIsUserPanelOpen(!isUserPanelOpen)}
        user={user}
      />

      {/* Contenido principal */}
      <main className="app-main">
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="app-content">
                {currentView === 'tree' ? (
                  <CircularView
                    tools={filteredTools}
                    categories={categories}
                    onCategorySelect={handleCategorySelect}
                    selectedCategory={selectedCategory}
                  />
                ) : (
                  <CardsView
                    tools={filteredTools}
                    categories={categories}
                    onCategorySelect={handleCategorySelect}
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                  />
                )}
              </div>
            } 
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dorks" element={<DorkGenerator />} />
          <Route path="/categoria/:categoryId" element={
            <CardsView
              tools={filteredTools}
              categories={categories}
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          } />
        </Routes>
      </main>

      {/* Panel de usuario */}
      {isUserPanelOpen && (
        <UserPanel
          isOpen={isUserPanelOpen}
          onClose={() => setIsUserPanelOpen(false)}
          user={user}
        />
      )}

      {/* Notificaciones toast */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--white)',
            color: 'var(--gray-900)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-green)',
              secondary: 'var(--white)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--accent-red)',
              secondary: 'var(--white)',
            },
          },
        }}
      />
    </div>
  )
}

export default App