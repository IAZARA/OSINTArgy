import express from 'express'
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { validateRegister, validateLogin } from '../middleware/validation.js'

const router = express.Router()

// Rutas públicas
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Rutas privadas
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, changePassword)
router.post('/logout', protect, logout)

export default router