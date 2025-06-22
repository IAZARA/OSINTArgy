import React, { useState, useEffect } from 'react'
import { X, User, Heart, History, FileText, Settings, LogOut, Plus, Edit, Trash2 } from 'lucide-react'
import { userService } from '../../services/userService.js'
import './UserPanel.css'

const UserPanel = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('favorites')

  if (!isOpen) return null

  const tabs = [
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'notes', label: 'Notas', icon: FileText },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ]

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="user-panel-overlay" onClick={handleOverlayClick}>
      <div className="user-panel">
        {/* Header */}
        <div className="user-panel-header">
          <div className="user-info">
            {user ? (
              <>
                <div className="user-avatar">
                  <User size={24} />
                </div>
                <div className="user-details">
                  <h3>{user.profile?.firstName || user.username}</h3>
                  <p>{user.email}</p>
                </div>
              </>
            ) : (
              <div className="guest-info">
                <h3>Invitado</h3>
                <p>Inicia sesión para acceder a todas las funciones</p>
              </div>
            )}
          </div>
          
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {user ? (
          <>
            {/* Tabs */}
            <div className="user-panel-tabs">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="user-panel-content">
              {activeTab === 'favorites' && <FavoritesTab user={user} />}
              {activeTab === 'history' && <HistoryTab user={user} />}
              {activeTab === 'notes' && <NotesTab user={user} />}
              {activeTab === 'settings' && <SettingsTab user={user} />}
            </div>

            {/* Footer */}
            <div className="user-panel-footer">
              <button className="logout-btn">
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <div className="auth-prompt">
            <div className="auth-buttons">
              <button className="btn-primary">Iniciar sesión</button>
              <button className="btn-secondary">Registrarse</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de Favoritos
const FavoritesTab = ({ user }) => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const response = await userService.favorites.getAll()
      if (response.success) {
        setFavorites(response.data)
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (toolId) => {
    try {
      const response = await userService.favorites.remove(toolId)
      if (response.success) {
        setFavorites(prev => prev.filter(fav => fav.toolId !== toolId))
      }
    } catch (error) {
      console.error('Error removiendo favorito:', error)
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando favoritos...</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="empty-state">
        <Heart size={48} />
        <h4>Sin favoritos</h4>
        <p>Agrega herramientas a favoritos para acceder rápidamente a ellas</p>
      </div>
    )
  }

  return (
    <div className="favorites-list">
      {favorites.map(favorite => (
        <div key={favorite.toolId} className="favorite-item">
          <div className="favorite-info">
            <h4>{favorite.toolId}</h4>
            {favorite.notes && <p>{favorite.notes}</p>}
            <span className="favorite-date">
              Agregado: {new Date(favorite.addedAt).toLocaleDateString()}
            </span>
          </div>
          <button
            className="remove-favorite"
            onClick={() => handleRemoveFavorite(favorite.toolId)}
            title="Remover de favoritos"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

// Componente de Historial
const HistoryTab = ({ user }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await userService.history.get(50)
      if (response.success) {
        setHistory(response.data)
      }
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
      try {
        const response = await userService.history.clear()
        if (response.success) {
          setHistory([])
        }
      } catch (error) {
        console.error('Error limpiando historial:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando historial...</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="empty-state">
        <History size={48} />
        <h4>Sin historial</h4>
        <p>Tu historial de herramientas visitadas aparecerá aquí</p>
      </div>
    )
  }

  return (
    <div className="history-section">
      <div className="history-header">
        <h4>Historial de herramientas</h4>
        <button className="clear-history-btn" onClick={handleClearHistory}>
          Limpiar historial
        </button>
      </div>
      <div className="history-list">
        {history.map((item, index) => (
          <div key={index} className="history-item">
            <div className="history-info">
              <h4>{item.toolId}</h4>
              <div className="history-meta">
                <span>Visitado {item.visitCount} veces</span>
                <span>Última visita: {new Date(item.visitedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente de Notas
const NotesTab = ({ user }) => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] })
  const [showNewNote, setShowNewNote] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const response = await userService.notes.getAll()
      if (response.success) {
        setNotes(response.data)
      }
    } catch (error) {
      console.error('Error cargando notas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      try {
        const response = await userService.notes.create({
          title: newNote.title,
          content: newNote.content,
          tags: newNote.tags,
          isPrivate: true
        })
        if (response.success) {
          setNotes(prev => [response.data, ...prev])
          setNewNote({ title: '', content: '', tags: [] })
          setShowNewNote(false)
        }
      } catch (error) {
        console.error('Error creando nota:', error)
      }
    }
  }

  const handleUpdateNote = async (noteId, noteData) => {
    try {
      const response = await userService.notes.update(noteId, noteData)
      if (response.success) {
        setNotes(prev => prev.map(note =>
          note.id === noteId ? response.data : note
        ))
        setEditingNote(null)
      }
    } catch (error) {
      console.error('Error actualizando nota:', error)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      try {
        const response = await userService.notes.delete(noteId)
        if (response.success) {
          setNotes(prev => prev.filter(note => note.id !== noteId))
        }
      } catch (error) {
        console.error('Error eliminando nota:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando notas...</p>
      </div>
    )
  }

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h4>Mis Notas</h4>
        <button
          className="add-note-btn"
          onClick={() => setShowNewNote(!showNewNote)}
        >
          <Plus size={16} />
          Nueva nota
        </button>
      </div>

      {showNewNote && (
        <div className="new-note-form">
          <input
            type="text"
            placeholder="Título de la nota"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
          <textarea
            placeholder="Contenido de la nota"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            rows={4}
          />
          <input
            type="text"
            placeholder="Tags (separar con comas)"
            value={newNote.tags.join(', ')}
            onChange={(e) => setNewNote({
              ...newNote,
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
            })}
          />
          <div className="note-actions">
            <button className="btn-primary" onClick={handleCreateNote}>
              Guardar
            </button>
            <button className="btn-secondary" onClick={() => setShowNewNote(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h4>Sin notas</h4>
          <p>Crea notas para guardar información importante sobre tus investigaciones</p>
        </div>
      ) : (
        <div className="notes-list">
          {notes.map(note => (
            <div key={note.id} className="note-item">
              {editingNote === note.id ? (
                <EditNoteForm
                  note={note}
                  onSave={(noteData) => handleUpdateNote(note.id, noteData)}
                  onCancel={() => setEditingNote(null)}
                />
              ) : (
                <>
                  <div className="note-content">
                    <h5>{note.title}</h5>
                    <p>{note.content}</p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="note-tags">
                        {note.tags.map(tag => (
                          <span key={tag} className="note-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <span className="note-date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="note-actions">
                    <button
                      className="edit-note-btn"
                      onClick={() => setEditingNote(note.id)}
                      title="Editar nota"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="delete-note-btn"
                      onClick={() => handleDeleteNote(note.id)}
                      title="Eliminar nota"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente para editar notas
const EditNoteForm = ({ note, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    title: note.title,
    content: note.content,
    tags: note.tags || []
  })

  const handleSave = () => {
    if (editData.title.trim() && editData.content.trim()) {
      onSave(editData)
    }
  }

  return (
    <div className="edit-note-form">
      <input
        type="text"
        value={editData.title}
        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
      />
      <textarea
        value={editData.content}
        onChange={(e) => setEditData({ ...editData, content: e.target.value })}
        rows={4}
      />
      <input
        type="text"
        placeholder="Tags (separar con comas)"
        value={editData.tags.join(', ')}
        onChange={(e) => setEditData({
          ...editData,
          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        })}
      />
      <div className="note-actions">
        <button className="btn-primary" onClick={handleSave}>
          Guardar
        </button>
        <button className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

// Componente de Configuración
const SettingsTab = ({ user }) => {
  const [preferences, setPreferences] = useState(user.preferences || {})
  const [saving, setSaving] = useState(false)

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      const response = await userService.preferences.update(preferences)
      if (response.success) {
        // Mostrar mensaje de éxito
        console.log('Preferencias guardadas exitosamente')
      }
    } catch (error) {
      console.error('Error guardando preferencias:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings-section">
      <h4>Configuración</h4>
      
      <div className="setting-group">
        <label>Idioma</label>
        <select
          value={preferences.language || 'es'}
          onChange={(e) => handlePreferenceChange('language', e.target.value)}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Tema</label>
        <select
          value={preferences.theme || 'auto'}
          onChange={(e) => handlePreferenceChange('theme', e.target.value)}
        >
          <option value="auto">Automático</option>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Vista por defecto</label>
        <select
          value={preferences.defaultView || 'tree'}
          onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
        >
          <option value="tree">Árbol</option>
          <option value="cards">Tarjetas</option>
        </select>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={preferences.emailNotifications || false}
            onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
          />
          Recibir notificaciones por email
        </label>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={preferences.publicProfile || false}
            onChange={(e) => handlePreferenceChange('publicProfile', e.target.checked)}
          />
          Perfil público
        </label>
      </div>

      <button
        className="save-settings-btn"
        onClick={handleSavePreferences}
        disabled={saving}
      >
        {saving ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  )
}

export default UserPanel