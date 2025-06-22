import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, Flag, Edit, Trash2 } from 'lucide-react'
import { userService } from '../../services/userService.js'
import './RatingComponent.css'

const RatingComponent = ({ toolId, currentUser }) => {
  const [ratings, setRatings] = useState([])
  const [userRating, setUserRating] = useState(null)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadRatings()
    if (currentUser) {
      loadUserRating()
    }
  }, [toolId, currentUser])

  const loadRatings = async () => {
    try {
      const response = await fetch(`/api/ratings/tool/${toolId}`)
      const data = await response.json()
      if (data.success) {
        setRatings(data.data)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error cargando ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserRating = async () => {
    try {
      const response = await userService.ratings.getUserRating(toolId)
      if (response.success && response.data) {
        setUserRating(response.data)
      }
    } catch (error) {
      console.error('Error cargando rating del usuario:', error)
    }
  }

  const handleVote = async (ratingId, voteType) => {
    if (!currentUser) return

    try {
      const response = await userService.ratings.vote(ratingId, voteType)
      if (response.success) {
        // Actualizar el rating en la lista
        setRatings(prev => prev.map(rating => 
          rating._id === ratingId 
            ? { ...rating, ...response.data }
            : rating
        ))
      }
    } catch (error) {
      console.error('Error votando rating:', error)
    }
  }

  const handleFlag = async (ratingId, reason) => {
    if (!currentUser) return

    try {
      const response = await userService.ratings.flag(ratingId, reason)
      if (response.success) {
        alert('Rating reportado exitosamente')
      }
    } catch (error) {
      console.error('Error reportando rating:', error)
    }
  }

  if (loading) {
    return (
      <div className="rating-loading">
        <div className="spinner"></div>
        <p>Cargando ratings...</p>
      </div>
    )
  }

  return (
    <div className="rating-component">
      {/* Estadísticas generales */}
      {stats && (
        <div className="rating-stats">
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-number">{stats.avgRating?.toFixed(1) || '0.0'}</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= Math.round(stats.avgRating || 0) ? 'filled' : ''}
                  />
                ))}
              </div>
              <span className="rating-count">({stats.totalRatings || 0} ratings)</span>
            </div>
          </div>

          {stats.ratingCounts && (
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="rating-bar">
                  <span>{star}</span>
                  <Star size={14} className="filled" />
                  <div className="bar">
                    <div 
                      className="fill" 
                      style={{ 
                        width: `${((stats.ratingCounts[star] || 0) / stats.totalRatings) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span>{stats.ratingCounts[star] || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulario de rating del usuario */}
      {currentUser && (
        <div className="user-rating-section">
          {userRating ? (
            <div className="user-rating-display">
              <h4>Tu rating</h4>
              <div className="rating-preview">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= userRating.rating ? 'filled' : ''}
                    />
                  ))}
                </div>
                <span>{userRating.rating}/5</span>
                <button 
                  className="edit-rating-btn"
                  onClick={() => setShowRatingForm(true)}
                >
                  <Edit size={14} />
                  Editar
                </button>
              </div>
              {userRating.review && (
                <p className="user-review">{userRating.review}</p>
              )}
            </div>
          ) : (
            <button 
              className="add-rating-btn"
              onClick={() => setShowRatingForm(true)}
            >
              <Star size={16} />
              Calificar esta herramienta
            </button>
          )}
        </div>
      )}

      {/* Formulario de rating */}
      {showRatingForm && (
        <RatingForm
          toolId={toolId}
          existingRating={userRating}
          onSave={(newRating) => {
            setUserRating(newRating)
            setShowRatingForm(false)
            loadRatings() // Recargar para actualizar estadísticas
          }}
          onCancel={() => setShowRatingForm(false)}
        />
      )}

      {/* Lista de ratings */}
      <div className="ratings-list">
        <h4>Opiniones de usuarios ({ratings.length})</h4>
        
        {ratings.length === 0 ? (
          <div className="no-ratings">
            <p>Aún no hay ratings para esta herramienta.</p>
            {currentUser && (
              <p>¡Sé el primero en calificarla!</p>
            )}
          </div>
        ) : (
          <div className="ratings-container">
            {ratings.map(rating => (
              <RatingItem
                key={rating._id}
                rating={rating}
                currentUser={currentUser}
                onVote={handleVote}
                onFlag={handleFlag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para el formulario de rating
const RatingForm = ({ toolId, existingRating, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: existingRating?.rating || 0,
    review: existingRating?.review || '',
    pros: existingRating?.pros || [],
    cons: existingRating?.cons || [],
    experienceLevel: existingRating?.experienceLevel || 'intermediate',
    usageFrequency: existingRating?.usageFrequency || 'monthly',
    recommendedFor: existingRating?.recommendedFor || []
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.rating === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    setSaving(true)
    try {
      const response = await userService.ratings.createOrUpdate({
        toolId,
        ...formData
      })
      if (response.success) {
        onSave(response.data)
      }
    } catch (error) {
      console.error('Error guardando rating:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rating-form-overlay">
      <div className="rating-form">
        <h3>{existingRating ? 'Editar rating' : 'Calificar herramienta'}</h3>
        
        <form onSubmit={handleSubmit}>
          {/* Calificación con estrellas */}
          <div className="form-group">
            <label>Calificación *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={24}
                  className={star <= formData.rating ? 'filled interactive' : 'interactive'}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                />
              ))}
              <span className="rating-text">
                {formData.rating > 0 ? `${formData.rating}/5` : 'Selecciona una calificación'}
              </span>
            </div>
          </div>

          {/* Reseña */}
          <div className="form-group">
            <label>Reseña</label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
              placeholder="Comparte tu experiencia con esta herramienta..."
              rows={4}
            />
          </div>

          {/* Nivel de experiencia */}
          <div className="form-group">
            <label>Tu nivel de experiencia *</label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
              required
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="expert">Experto</option>
            </select>
          </div>

          {/* Frecuencia de uso */}
          <div className="form-group">
            <label>Frecuencia de uso *</label>
            <select
              value={formData.usageFrequency}
              onChange={(e) => setFormData(prev => ({ ...prev, usageFrequency: e.target.value }))}
              required
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="rarely">Rara vez</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : 'Guardar rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente para mostrar un rating individual
const RatingItem = ({ rating, currentUser, onVote, onFlag }) => {
  const [showFlagForm, setShowFlagForm] = useState(false)

  const isOwnRating = currentUser && rating.userId._id === currentUser._id

  return (
    <div className="rating-item">
      <div className="rating-header">
        <div className="user-info">
          <span className="username">{rating.userId.username}</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={14}
                className={star <= rating.rating ? 'filled' : ''}
              />
            ))}
          </div>
          <span className="rating-date">
            {new Date(rating.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        {!isOwnRating && currentUser && (
          <button 
            className="flag-btn"
            onClick={() => setShowFlagForm(true)}
            title="Reportar rating"
          >
            <Flag size={14} />
          </button>
        )}
      </div>

      {rating.review && (
        <div className="rating-content">
          <p>{rating.review}</p>
        </div>
      )}

      <div className="rating-meta">
        <span className="experience">Nivel: {rating.experienceLevel}</span>
        <span className="frequency">Uso: {rating.usageFrequency}</span>
      </div>

      {currentUser && !isOwnRating && (
        <div className="rating-actions">
          <button 
            className="vote-btn"
            onClick={() => onVote(rating._id, 'helpful')}
          >
            <ThumbsUp size={14} />
            Útil ({rating.helpfulVotes || 0})
          </button>
          <button 
            className="vote-btn"
            onClick={() => onVote(rating._id, 'unhelpful')}
          >
            <ThumbsDown size={14} />
            No útil ({rating.unhelpfulVotes || 0})
          </button>
        </div>
      )}

      {showFlagForm && (
        <div className="flag-form">
          <select onChange={(e) => {
            if (e.target.value) {
              onFlag(rating._id, e.target.value)
              setShowFlagForm(false)
            }
          }}>
            <option value="">Seleccionar motivo...</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Contenido inapropiado</option>
            <option value="fake">Rating falso</option>
            <option value="offensive">Ofensivo</option>
            <option value="other">Otro</option>
          </select>
          <button onClick={() => setShowFlagForm(false)}>Cancelar</button>
        </div>
      )}
    </div>
  )
}

export default RatingComponent