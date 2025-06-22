import React, { useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft } from 'lucide-react'
import './Auth.css'

const Auth = ({ onClose }) => {
  const [mode, setMode] = useState('login') // 'login' o 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validaciones comunes
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    // Validaciones específicas para registro
    if (mode === 'register') {
      if (!formData.username.trim()) {
        newErrors.username = 'El nombre de usuario es requerido'
      } else if (formData.username.length < 3) {
        newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        newErrors.username = 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'
      }

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'El nombre es requerido'
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'El apellido es requerido'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (mode === 'login') {
        // Simular login
        console.log('Login:', { 
          login: formData.email, 
          password: formData.password 
        })
        
        // Aquí iría la llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simular éxito
        alert('Inicio de sesión exitoso')
        onClose?.()
      } else {
        // Simular registro
        console.log('Register:', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
        
        // Aquí iría la llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simular éxito
        alert('Registro exitoso')
        setMode('login')
      }
    } catch (error) {
      console.error('Error:', error)
      setErrors({ general: 'Ocurrió un error. Intenta de nuevo.' })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    })
    setErrors({})
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          {onClose && (
            <button className="back-btn" onClick={onClose}>
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="auth-logo">
            <h1>OSINTArgy</h1>
            <p>Framework OSINT en español</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="auth-toggle">
          <button
            className={`toggle-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`toggle-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message general">
              {errors.general}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Tu nombre"
                      className={errors.firstName ? 'error' : ''}
                    />
                  </div>
                  {errors.firstName && (
                    <span className="error-message">{errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Apellido</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Tu apellido"
                      className={errors.lastName ? 'error' : ''}
                    />
                  </div>
                  {errors.lastName && (
                    <span className="error-message">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Nombre de usuario</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nombre de usuario único"
                    className={errors.username ? 'error' : ''}
                  />
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Tu contraseña"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirma tu contraseña"
                  className={errors.confirmPassword ? 'error' : ''}
                />
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          {mode === 'login' ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchMode('register')}
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchMode('login')}
              >
                Inicia sesión aquí
              </button>
            </p>
          )}

          {mode === 'login' && (
            <button type="button" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth