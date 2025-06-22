import { authAPI } from './api'
import { storage } from '@utils/helpers'
import { VALIDATION } from '@utils/constants'

/**
 * Servicio de autenticación para OSINTArgy
 * Maneja todas las operaciones relacionadas con autenticación de usuarios
 */
export const authService = {
  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  login: async (email, password) => {
    try {
      // Validar datos de entrada
      if (!email || !password) {
        return {
          success: false,
          message: 'Email y contraseña son requeridos'
        }
      }

      if (!VALIDATION.EMAIL_REGEX.test(email)) {
        return {
          success: false,
          message: 'Email no válido'
        }
      }

      const response = await authAPI.login({ email, password })
      
      if (response.success) {
        const { user, token } = response.data
        
        // Guardar token en localStorage
        storage.set('auth_token', token)
        
        return {
          success: true,
          data: { user, token },
          message: 'Sesión iniciada correctamente'
        }
      }
      
      return {
        success: false,
        message: response.error || 'Error al iniciar sesión'
      }
    } catch (error) {
      console.error('Error en login:', error)
      return {
        success: false,
        message: 'Error de conexión. Intenta nuevamente.'
      }
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  register: async (userData) => {
    try {
      const { name, email, password, confirmPassword } = userData

      // Validaciones
      if (!name || !email || !password || !confirmPassword) {
        return {
          success: false,
          message: 'Todos los campos son requeridos'
        }
      }

      if (!VALIDATION.EMAIL_REGEX.test(email)) {
        return {
          success: false,
          message: 'Email no válido'
        }
      }

      if (password !== confirmPassword) {
        return {
          success: false,
          message: 'Las contraseñas no coinciden'
        }
      }

      if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        return {
          success: false,
          message: `La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`
        }
      }

      const response = await authAPI.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      })
      
      if (response.success) {
        const { user, token } = response.data
        
        // Guardar token en localStorage
        storage.set('auth_token', token)
        
        return {
          success: true,
          data: { user, token },
          message: 'Cuenta creada correctamente'
        }
      }
      
      return {
        success: false,
        message: response.error || 'Error al crear la cuenta'
      }
    } catch (error) {
      console.error('Error en register:', error)
      return {
        success: false,
        message: 'Error de conexión. Intenta nuevamente.'
      }
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise<Object>} Resultado de la operación
   */
  logout: async () => {
    try {
      // Llamar al endpoint de logout (opcional)
      await authAPI.logout()
      
      // Limpiar token local
      storage.remove('auth_token')
      
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      }
    } catch (error) {
      console.error('Error en logout:', error)
      
      // Aunque falle el logout en el servidor, limpiar token local
      storage.remove('auth_token')
      
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      }
    }
  },

  /**
   * Verificar token actual
   * @param {string} token - Token a verificar (opcional)
   * @returns {Promise<Object>} Datos del usuario si el token es válido
   */
  verifyToken: async (token = null) => {
    try {
      const tokenToVerify = token || storage.get('auth_token')
      
      if (!tokenToVerify) {
        return null
      }

      const response = await authAPI.verifyToken()
      
      if (response.success) {
        return response.data.user
      }
      
      // Token inválido, limpiar storage
      storage.remove('auth_token')
      return null
    } catch (error) {
      console.error('Error al verificar token:', error)
      storage.remove('auth_token')
      return null
    }
  },

  /**
   * Refrescar token
   * @returns {Promise<Object>} Nuevo token
   */
  refreshToken: async () => {
    try {
      const response = await authAPI.refreshToken()
      
      if (response.success) {
        const { token } = response.data
        storage.set('auth_token', token)
        
        return {
          success: true,
          data: { token },
          message: 'Token actualizado'
        }
      }
      
      return {
        success: false,
        message: 'Error al actualizar token'
      }
    } catch (error) {
      console.error('Error al refrescar token:', error)
      return {
        success: false,
        message: 'Error al actualizar token'
      }
    }
  },

  /**
   * Obtener perfil del usuario
   * @returns {Promise<Object>} Datos del perfil
   */
  getProfile: async () => {
    try {
      const response = await authAPI.getProfile()
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Perfil obtenido correctamente'
        }
      }
      
      return {
        success: false,
        message: response.error || 'Error al obtener perfil'
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error)
      return {
        success: false,
        message: 'Error de conexión'
      }
    }
  },

  /**
   * Actualizar perfil del usuario
   * @param {Object} profileData - Datos del perfil a actualizar
   * @returns {Promise<Object>} Resultado de la operación
   */
  updateProfile: async (profileData) => {
    try {
      const { name, email, bio, avatar } = profileData

      // Validaciones básicas
      if (name && name.trim().length < 2) {
        return {
          success: false,
          message: 'El nombre debe tener al menos 2 caracteres'
        }
      }

      if (email && !VALIDATION.EMAIL_REGEX.test(email)) {
        return {
          success: false,
          message: 'Email no válido'
        }
      }

      if (bio && bio.length > 500) {
        return {
          success: false,
          message: 'La biografía no puede exceder 500 caracteres'
        }
      }

      const dataToUpdate = {}
      if (name) dataToUpdate.name = name.trim()
      if (email) dataToUpdate.email = email.trim().toLowerCase()
      if (bio !== undefined) dataToUpdate.bio = bio.trim()
      if (avatar) dataToUpdate.avatar = avatar

      const response = await authAPI.updateProfile(dataToUpdate)
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Perfil actualizado correctamente'
        }
      }
      
      return {
        success: false,
        message: response.error || 'Error al actualizar perfil'
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      return {
        success: false,
        message: 'Error de conexión'
      }
    }
  },

  /**
   * Cambiar contraseña
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Resultado de la operación
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      // Validaciones
      if (!currentPassword || !newPassword) {
        return {
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        }
      }

      if (newPassword.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        return {
          success: false,
          message: `La nueva contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`
        }
      }

      if (currentPassword === newPassword) {
        return {
          success: false,
          message: 'La nueva contraseña debe ser diferente a la actual'
        }
      }

      const response = await authAPI.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      
      if (response.success) {
        return {
          success: true,
          message: 'Contraseña actualizada correctamente'
        }
      }
      
      return {
        success: false,
        message: response.error || 'Error al cambiar contraseña'
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      return {
        success: false,
        message: 'Error de conexión'
      }
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  forgotPassword: async (email) => {
    try {
      if (!email) {
        return {
          success: false,
          message: 'Email es requerido'
        }
      }

      if (!VALIDATION.EMAIL_REGEX.test(email)) {
        return {
          success: false,
          message: 'Email no válido'
        }
      }

      const response = await authAPI.forgotPassword(email.trim().toLowerCase())
      
      if (response.success) {
        return {
          success: true,
          message: 'Se ha enviado un email con instrucciones para recuperar tu contraseña'
        }
      }
      
      return {
        success: false,
        message: response.error || 'Error al enviar email de recuperación'
      }
    } catch (error) {
      console.error('Error en forgot password:', error)
      return {
        success: false,
        message: 'Error de conexión'
      }
    }
  },

  /**
   * Restablecer contraseña con token
   * @param {string} token - Token de recuperación
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Resultado de la operación
   */
  resetPassword: async (token, newPassword) => {
    try {
      if (!token || !newPassword) {
        return {
          success: false,
          message: 'Token y nueva contraseña son requeridos'
        }
      }

      if (newPassword.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        return {
          success: false,
          message: `La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`
        }
      }

      const response = await authAPI.resetPassword(token, newPassword)
      
      if (response.success) {
        return {
          success: true,
          message: 'Contraseña restablecida correctamente'
        }
      }
      
      return {
        success: false,
        message: response.error || 'Error al restablecer contraseña'
      }
    } catch (error) {
      console.error('Error en reset password:', error)
      return {
        success: false,
        message: 'Error de conexión'
      }
    }
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated: () => {
    const token = storage.get('auth_token')
    return !!token
  },

  /**
   * Obtener token actual
   * @returns {string|null} Token actual o null
   */
  getToken: () => {
    return storage.get('auth_token')
  },

  /**
   * Limpiar datos de autenticación
   */
  clearAuth: () => {
    storage.remove('auth_token')
  }
}

export default authService