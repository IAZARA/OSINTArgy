import axios from 'axios'
import { API_BASE_URL, ERROR_MESSAGES } from '@utils/constants'
import { storage, handleApiError } from '@utils/helpers'
import toast from 'react-hot-toast'

// Configuración base de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = storage.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Respuesta exitosa
    return response
  },
  (error) => {
    // Manejar errores de respuesta
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Token expirado o inválido
          storage.remove('auth_token')
          if (window.location.pathname !== '/auth') {
            toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
            window.location.href = '/auth'
          }
          break

        case 403:
          toast.error('No tienes permisos para realizar esta acción')
          break

        case 404:
          // No mostrar toast para 404, manejar en el componente
          break

        case 429:
          toast.error('Demasiadas solicitudes. Intenta nuevamente en unos minutos.')
          break

        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Error del servidor. Intenta nuevamente más tarde.')
          break

        default:
          // Otros errores
          if (data?.message) {
            toast.error(data.message)
          }
      }
    } else if (error.request) {
      // Error de red
      toast.error(ERROR_MESSAGES.NETWORK_ERROR)
    } else {
      // Error de configuración
      toast.error(ERROR_MESSAGES.GENERIC_ERROR)
    }

    return Promise.reject(error)
  }
)

// Funciones de utilidad para las peticiones
const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config)
      return {
        success: true,
        data: response.data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
        status: error.response?.status
      }
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config)
      return {
        success: true,
        data: response.data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
        status: error.response?.status
      }
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config)
      return {
        success: true,
        data: response.data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
        status: error.response?.status
      }
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config)
      return {
        success: true,
        data: response.data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
        status: error.response?.status
      }
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config)
      return {
        success: true,
        data: response.data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
        status: error.response?.status
      }
    }
  },

  // Upload file
  upload: async (url, file, onProgress = null) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }

      const response = await api.post(url, formData, config)
      return {
        success: true,
        data: response.data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
        status: error.response?.status
      }
    }
  },

  // Download file
  download: async (url, filename = null) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      })

      // Crear URL del blob
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)

      // Crear elemento de descarga
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar URL del blob
      window.URL.revokeObjectURL(downloadUrl)

      return {
        success: true,
        data: 'Descarga iniciada',
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
        status: error.response?.status
      }
    }
  }
}

// Endpoints específicos de la API
export const endpoints = {
  // Autenticación
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    verify: '/auth/verify',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile'
  },

  // Herramientas
  tools: {
    getAll: '/tools',
    getById: (id) => `/tools/${id}`,
    create: '/tools',
    update: (id) => `/tools/${id}`,
    delete: (id) => `/tools/${id}`,
    search: '/tools/search',
    popular: '/tools/popular',
    recent: '/tools/recent'
  },

  // Categorías
  categories: {
    getAll: '/categories',
    getById: (id) => `/categories/${id}`,
    getTools: (id) => `/categories/${id}/tools`
  },

  // Favoritos
  favorites: {
    getAll: '/favorites',
    add: '/favorites',
    remove: (id) => `/favorites/${id}`,
    check: (id) => `/favorites/check/${id}`
  },

  // Ratings
  ratings: {
    getByTool: (toolId) => `/ratings/tool/${toolId}`,
    create: '/ratings',
    update: (id) => `/ratings/${id}`,
    delete: (id) => `/ratings/${id}`
  },

  // Comentarios
  comments: {
    getByTool: (toolId) => `/comments/tool/${toolId}`,
    create: '/comments',
    update: (id) => `/comments/${id}`,
    delete: (id) => `/comments/${id}`,
    moderate: (id) => `/comments/${id}/moderate`
  },

  // Estadísticas
  stats: {
    general: '/stats',
    tools: '/stats/tools',
    users: '/stats/users',
    categories: '/stats/categories'
  },

  // Búsqueda
  search: {
    tools: '/search/tools',
    suggestions: '/search/suggestions',
    history: '/search/history'
  },

  // Usuario
  user: {
    profile: '/user/profile',
    preferences: '/user/preferences',
    history: '/user/history',
    notes: '/user/notes'
  }
}

// Funciones de conveniencia para endpoints comunes
export const authAPI = {
  login: (credentials) => apiService.post(endpoints.auth.login, credentials),
  register: (userData) => apiService.post(endpoints.auth.register, userData),
  logout: () => apiService.post(endpoints.auth.logout),
  refreshToken: () => apiService.post(endpoints.auth.refresh),
  verifyToken: () => apiService.get(endpoints.auth.verify),
  forgotPassword: (email) => apiService.post(endpoints.auth.forgotPassword, { email }),
  resetPassword: (token, password) => apiService.post(endpoints.auth.resetPassword, { token, password }),
  getProfile: () => apiService.get(endpoints.auth.profile),
  updateProfile: (data) => apiService.put(endpoints.auth.profile, data)
}

export const toolsAPI = {
  getAll: (params = {}) => apiService.get(endpoints.tools.getAll, { params }),
  getById: (id) => apiService.get(endpoints.tools.getById(id)),
  create: (data) => apiService.post(endpoints.tools.create, data),
  update: (id, data) => apiService.put(endpoints.tools.update(id), data),
  delete: (id) => apiService.delete(endpoints.tools.delete(id)),
  search: (query, filters = {}) => apiService.get(endpoints.tools.search, { 
    params: { q: query, ...filters } 
  }),
  getPopular: () => apiService.get(endpoints.tools.popular),
  getRecent: () => apiService.get(endpoints.tools.recent)
}

export const categoriesAPI = {
  getAll: () => apiService.get(endpoints.categories.getAll),
  getById: (id) => apiService.get(endpoints.categories.getById(id)),
  getTools: (id, params = {}) => apiService.get(endpoints.categories.getTools(id), { params })
}

export const favoritesAPI = {
  getAll: () => apiService.get(endpoints.favorites.getAll),
  add: (toolId) => apiService.post(endpoints.favorites.add, { toolId }),
  remove: (toolId) => apiService.delete(endpoints.favorites.remove(toolId)),
  check: (toolId) => apiService.get(endpoints.favorites.check(toolId))
}

export const ratingsAPI = {
  getByTool: (toolId) => apiService.get(endpoints.ratings.getByTool(toolId)),
  create: (data) => apiService.post(endpoints.ratings.create, data),
  update: (id, data) => apiService.put(endpoints.ratings.update(id), data),
  delete: (id) => apiService.delete(endpoints.ratings.delete(id))
}

export const statsAPI = {
  getGeneral: () => apiService.get(endpoints.stats.general),
  getTools: () => apiService.get(endpoints.stats.tools),
  getUsers: () => apiService.get(endpoints.stats.users),
  getCategories: () => apiService.get(endpoints.stats.categories)
}

// Exportar la instancia de axios para uso directo si es necesario
export { api }

// Exportar el servicio principal
export default apiService