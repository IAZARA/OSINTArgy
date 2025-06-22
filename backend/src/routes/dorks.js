import express from 'express'
import DorkController from '../controllers/dorkController.js'
import { protect } from '../middleware/auth.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

/**
 * Middleware para validar errores de express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Errores de validación',
      details: errors.array()
    })
  }
  next()
}

/**
 * @route   POST /api/dorks/generate
 * @desc    Generar dorks basados en parámetros
 * @access  Private (requiere autenticación)
 */
router.post('/generate',
  protect,
  [
    body('query')
      .trim()
      .notEmpty()
      .withMessage('El término de búsqueda es requerido')
      .isLength({ min: 1, max: 200 })
      .withMessage('El término de búsqueda debe tener entre 1 y 200 caracteres'),
    
    body('targetType')
      .optional()
      .isIn(['usernames', 'emails', 'websites'])
      .withMessage('Tipo de objetivo no válido'),
    
    body('engines')
      .optional()
      .isArray()
      .withMessage('Los motores de búsqueda deben ser un array'),
    
    body('engines.*')
      .optional()
      .isIn(['google', 'yandex'])
      .withMessage('Motor de búsqueda no válido'),
    
    body('options.includeTerms')
      .optional()
      .isArray()
      .withMessage('Los términos a incluir deben ser un array'),
    
    body('options.excludeTerms')
      .optional()
      .isArray()
      .withMessage('Los términos a excluir deben ser un array'),
    
    body('options.dateAfter')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('La fecha debe tener formato YYYY-MM-DD'),
    
    body('options.dateBefore')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('La fecha debe tener formato YYYY-MM-DD')
  ],
  handleValidationErrors,
  DorkController.generateDorks
)

/**
 * @route   GET /api/dorks/target-types
 * @desc    Obtener tipos de objetivo disponibles
 * @access  Private (requiere autenticación)
 */
router.get('/target-types', protect, DorkController.getTargetTypes)

/**
 * @route   GET /api/dorks/search-engines
 * @desc    Obtener motores de búsqueda disponibles
 * @access  Private (requiere autenticación)
 */
router.get('/search-engines', protect, DorkController.getSearchEngines)

/**
 * @route   GET /api/dorks/health
 * @desc    Health check para el módulo de dorks
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    module: 'dorks',
    timestamp: new Date().toISOString()
  })
})

export default router