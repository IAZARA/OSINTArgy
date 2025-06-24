import express from 'express'
import { body, validationResult } from 'express-validator'
import { UsernameOsintController } from '../controllers/usernameOsintController.js'
import { ImprovedUsernameOsintController } from '../controllers/improvedUsernameOsintController.js'

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
 * @route   POST /api/osint/username-lookup
 * @desc    Realizar búsqueda completa de nombre de usuario
 * @access  Public
 */
router.post('/username-lookup', [
  body('username')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos')
    .trim()
], handleValidationErrors, UsernameOsintController.usernameLookup)

/**
 * @route   POST /api/osint/username-quick
 * @desc    Realizar búsqueda rápida en sitios principales
 * @access  Public
 */
router.post('/username-quick', [
  body('username')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos')
    .trim()
], handleValidationErrors, UsernameOsintController.quickUsernameLookup)

/**
 * @route   GET /api/osint/username-sites
 * @desc    Obtener lista de sitios disponibles para búsqueda de username
 * @access  Public
 */
router.get('/username-sites', UsernameOsintController.getAvailableSites)

/**
 * @route   POST /api/osint/username-lookup-improved
 * @desc    Realizar búsqueda mejorada de nombre de usuario con detección robusta
 * @access  Public
 */
router.post('/username-lookup-improved', [
  body('username')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 1 y 50 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos')
    .trim()
], handleValidationErrors, ImprovedUsernameOsintController.improvedUsernameLookup)

/**
 * @route   GET /api/osint/username-sites-improved
 * @desc    Obtener lista mejorada de sitios con información de confianza
 * @access  Public
 */
router.get('/username-sites-improved', ImprovedUsernameOsintController.getAvailableSitesImproved)

export default router
