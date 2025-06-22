import React, { useState } from 'react'
import apiService from './api.js'

// Servicio para manejar funcionalidades de usuario
export const userService = {
  // Favoritos
  favorites: {
    // Obtener todos los favoritos
    getAll: async () => {
      return await apiService.get('/api/users/favorites')
    },

    // Agregar herramienta a favoritos
    add: async (toolId, notes = '') => {
      return await apiService.post(`/api/users/favorites/${toolId}`, { notes })
    },

    // Remover herramienta de favoritos
    remove: async (toolId) => {
      return await apiService.delete(`/api/users/favorites/${toolId}`)
    },

    // Verificar si una herramienta está en favoritos
    check: async (toolId) => {
      const response = await apiService.get('/api/users/favorites')
      if (response.success) {
        return response.data.some(fav => fav.toolId === toolId)
      }
      return false
    }
  },

  // Historial
  history: {
    // Obtener historial
    get: async (limit = 50) => {
      return await apiService.get('/api/users/history', { params: { limit } })
    },

    // Limpiar historial
    clear: async () => {
      return await apiService.delete('/api/users/history')
    }
  },

  // Notas
  notes: {
    // Obtener todas las notas
    getAll: async (params = {}) => {
      return await apiService.get('/api/users/notes', { params })
    },

    // Obtener nota específica
    getById: async (noteId) => {
      return await apiService.get(`/api/users/notes/${noteId}`)
    },

    // Crear nueva nota
    create: async (noteData) => {
      return await apiService.post('/api/users/notes', noteData)
    },

    // Actualizar nota
    update: async (noteId, noteData) => {
      return await apiService.put(`/api/users/notes/${noteId}`, noteData)
    },

    // Eliminar nota
    delete: async (noteId) => {
      return await apiService.delete(`/api/users/notes/${noteId}`)
    },

    // Buscar notas
    search: async (query, tags = []) => {
      const params = { search: query }
      if (tags.length > 0) {
        params.tags = tags.join(',')
      }
      return await apiService.get('/api/users/notes', { params })
    }
  },

  // Preferencias
  preferences: {
    // Actualizar preferencias
    update: async (preferences) => {
      return await apiService.put('/api/users/preferences', preferences)
    }
  },

  // Perfil
  profile: {
    // Actualizar perfil
    update: async (profileData) => {
      return await apiService.put('/api/users/profile', profileData)
    }
  },

  // Ratings
  ratings: {
    // Obtener rating del usuario para una herramienta
    getUserRating: async (toolId) => {
      return await apiService.get(`/api/ratings/user/${toolId}`)
    },

    // Crear o actualizar rating
    createOrUpdate: async (ratingData) => {
      return await apiService.post('/api/ratings', ratingData)
    },

    // Eliminar rating
    delete: async (ratingId) => {
      return await apiService.delete(`/api/ratings/${ratingId}`)
    },

    // Votar en un rating
    vote: async (ratingId, vote) => {
      return await apiService.post(`/api/ratings/${ratingId}/vote`, { vote })
    },

    // Reportar rating
    flag: async (ratingId, reason) => {
      return await apiService.post(`/api/ratings/${ratingId}/flag`, { reason })
    }
  }
}

// Servicio para búsqueda avanzada
export const searchService = {
  // Búsqueda avanzada de herramientas
  searchTools: async (params) => {
    return await apiService.get('/api/search/tools', { params })
  },

  // Obtener sugerencias de búsqueda
  getSuggestions: async (query) => {
    return await apiService.get('/api/search/suggestions', { params: { q: query } })
  },

  // Obtener filtros disponibles
  getFilters: async () => {
    return await apiService.get('/api/search/filters')
  },

  // Historial de búsquedas
  history: {
    // Guardar búsqueda en historial
    save: async (query, filters, resultsCount) => {
      return await apiService.post('/api/search/history', {
        query,
        filters,
        resultsCount
      })
    },

    // Obtener historial de búsquedas
    get: async (limit = 20) => {
      return await apiService.get('/api/search/history', { params: { limit } })
    },

    // Limpiar historial de búsquedas
    clear: async () => {
      return await apiService.delete('/api/search/history')
    }
  }
}

// Hook personalizado para manejar favoritos
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

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

  const addToFavorites = async (toolId, notes = '') => {
    try {
      const response = await userService.favorites.add(toolId, notes)
      if (response.success) {
        await loadFavorites() // Recargar favoritos
        return true
      }
    } catch (error) {
      console.error('Error agregando a favoritos:', error)
    }
    return false
  }

  const removeFromFavorites = async (toolId) => {
    try {
      const response = await userService.favorites.remove(toolId)
      if (response.success) {
        setFavorites(prev => prev.filter(fav => fav.toolId !== toolId))
        return true
      }
    } catch (error) {
      console.error('Error removiendo de favoritos:', error)
    }
    return false
  }

  const isFavorite = (toolId) => {
    return favorites.some(fav => fav.toolId === toolId)
  }

  return {
    favorites,
    loading,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  }
}

// Hook personalizado para manejar notas
export const useNotes = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)

  const loadNotes = async (params = {}) => {
    setLoading(true)
    try {
      const response = await userService.notes.getAll(params)
      if (response.success) {
        setNotes(response.data)
      }
    } catch (error) {
      console.error('Error cargando notas:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (noteData) => {
    try {
      const response = await userService.notes.create(noteData)
      if (response.success) {
        setNotes(prev => [response.data, ...prev])
        return response.data
      }
    } catch (error) {
      console.error('Error creando nota:', error)
    }
    return null
  }

  const updateNote = async (noteId, noteData) => {
    try {
      const response = await userService.notes.update(noteId, noteData)
      if (response.success) {
        setNotes(prev => prev.map(note => 
          note.id === noteId ? response.data : note
        ))
        return response.data
      }
    } catch (error) {
      console.error('Error actualizando nota:', error)
    }
    return null
  }

  const deleteNote = async (noteId) => {
    try {
      const response = await userService.notes.delete(noteId)
      if (response.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId))
        return true
      }
    } catch (error) {
      console.error('Error eliminando nota:', error)
    }
    return false
  }

  return {
    notes,
    loading,
    loadNotes,
    createNote,
    updateNote,
    deleteNote
  }
}

export default userService