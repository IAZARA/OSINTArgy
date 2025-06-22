import express from 'express'
import Rating from '../models/Rating.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @desc    Obtener ratings de una herramienta
// @route   GET /api/ratings/tool/:toolId
// @access  Public
router.get('/tool/:toolId', async (req, res) => {
  try {
    const { toolId } = req.params
    const { page = 1, limit = 10, sort = 'helpful' } = req.query

    let sortOptions = {}
    switch (sort) {
      case 'helpful':
        sortOptions = { helpfulVotes: -1, createdAt: -1 }
        break
      case 'recent':
        sortOptions = { createdAt: -1 }
        break
      case 'rating':
        sortOptions = { rating: -1, createdAt: -1 }
        break
      default:
        sortOptions = { helpfulVotes: -1, createdAt: -1 }
    }

    const ratings = await Rating.find({
      toolId,
      isActive: true,
      isFlagged: false
    })
      .populate('userId', 'username profile.firstName profile.lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Rating.countDocuments({
      toolId,
      isActive: true,
      isFlagged: false
    })

    // Obtener estadísticas
    const stats = await Rating.getToolStats(toolId)

    res.json({
      success: true,
      data: ratings,
      stats: stats[0] || null,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error obteniendo ratings:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// @desc    Crear o actualizar rating
// @route   POST /api/ratings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      toolId,
      rating,
      review,
      pros = [],
      cons = [],
      criteria = {},
      experienceLevel,
      usageFrequency,
      recommendedFor = []
    } = req.body

    // Validaciones
    if (!toolId || !rating || !experienceLevel || !usageFrequency) {
      return res.status(400).json({
        success: false,
        message: 'toolId, rating, experienceLevel y usageFrequency son requeridos'
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating debe estar entre 1 y 5'
      })
    }

    // Verificar si ya existe un rating del usuario para esta herramienta
    let existingRating = await Rating.findOne({
      toolId,
      userId: req.user._id
    })

    if (existingRating) {
      // Actualizar rating existente
      existingRating.rating = rating
      existingRating.review = review
      existingRating.pros = pros
      existingRating.cons = cons
      existingRating.criteria = criteria
      existingRating.experienceLevel = experienceLevel
      existingRating.usageFrequency = usageFrequency
      existingRating.recommendedFor = recommendedFor
      
      await existingRating.save()

      res.json({
        success: true,
        data: existingRating,
        message: 'Rating actualizado exitosamente'
      })
    } else {
      // Crear nuevo rating
      const newRating = new Rating({
        toolId,
        userId: req.user._id,
        rating,
        review,
        pros,
        cons,
        criteria,
        experienceLevel,
        usageFrequency,
        recommendedFor
      })

      await newRating.save()

      // Incrementar contador de ratings del usuario
      req.user.stats.ratingsGiven += 1
      await req.user.save()

      res.status(201).json({
        success: true,
        data: newRating,
        message: 'Rating creado exitosamente'
      })
    }
  } catch (error) {
    console.error('Error creando/actualizando rating:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// @desc    Votar si un rating es útil
// @route   POST /api/ratings/:ratingId/vote
// @access  Private
router.post('/:ratingId/vote', protect, async (req, res) => {
  try {
    const { ratingId } = req.params
    const { vote } = req.body // 'helpful' o 'unhelpful'

    if (!['helpful', 'unhelpful'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Vote debe ser "helpful" o "unhelpful"'
      })
    }

    const rating = await Rating.findById(ratingId)
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating no encontrado'
      })
    }

    // No permitir votar en el propio rating
    if (rating.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes votar en tu propio rating'
      })
    }

    await rating.vote(req.user._id, vote)

    res.json({
      success: true,
      data: {
        helpfulVotes: rating.helpfulVotes,
        unhelpfulVotes: rating.unhelpfulVotes,
        helpfulnessScore: rating.helpfulnessScore
      },
      message: 'Voto registrado exitosamente'
    })
  } catch (error) {
    console.error('Error votando rating:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// @desc    Reportar un rating
// @route   POST /api/ratings/:ratingId/flag
// @access  Private
router.post('/:ratingId/flag', protect, async (req, res) => {
  try {
    const { ratingId } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Razón del reporte es requerida'
      })
    }

    const rating = await Rating.findById(ratingId)
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating no encontrado'
      })
    }

    await rating.flag(req.user._id, reason)

    res.json({
      success: true,
      message: 'Rating reportado exitosamente'
    })
  } catch (error) {
    console.error('Error reportando rating:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// @desc    Obtener rating del usuario para una herramienta
// @route   GET /api/ratings/user/:toolId
// @access  Private
router.get('/user/:toolId', protect, async (req, res) => {
  try {
    const { toolId } = req.params

    const rating = await Rating.findOne({
      toolId,
      userId: req.user._id
    })

    res.json({
      success: true,
      data: rating
    })
  } catch (error) {
    console.error('Error obteniendo rating del usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// @desc    Eliminar rating
// @route   DELETE /api/ratings/:ratingId
// @access  Private
router.delete('/:ratingId', protect, async (req, res) => {
  try {
    const { ratingId } = req.params

    const rating = await Rating.findById(ratingId)
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating no encontrado'
      })
    }

    // Solo el autor o un admin pueden eliminar el rating
    if (rating.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar este rating'
      })
    }

    await Rating.findByIdAndDelete(ratingId)

    // Decrementar contador de ratings del usuario si es el autor
    if (rating.userId.toString() === req.user._id.toString()) {
      req.user.stats.ratingsGiven = Math.max(0, req.user.stats.ratingsGiven - 1)
      await req.user.save()
    }

    res.json({
      success: true,
      message: 'Rating eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error eliminando rating:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

export default router