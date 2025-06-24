import express from 'express'
import { body, validationResult } from 'express-validator'
import { EmailOsintController } from '../controllers/emailOsintController.js'

const router = express.Router()

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Errores de validación',
      details: errors.array()
    })
  }
  next()
}

/**
 * @route   POST /api/osint/email-lookup
 * @desc    Realizar búsqueda OSINT de un email
 * @access  Public
 */
router.post('/email-lookup', [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('El email es demasiado largo')
], handleValidationErrors, EmailOsintController.emailLookup)

/**
 * @route   GET /api/osint/email-sites
 * @desc    Obtener lista de sitios disponibles para búsqueda
 * @access  Public
 */
router.get('/email-sites', EmailOsintController.getAvailableSites)

export default router
