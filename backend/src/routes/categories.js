import express from 'express'
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoriesController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Rutas públicas
router.get('/', getCategories)
router.get('/:id', getCategoryById)

// Rutas de administrador
router.post('/', protect, authorize('admin'), createCategory)
router.put('/:id', protect, authorize('admin'), updateCategory)
router.delete('/:id', protect, authorize('admin'), deleteCategory)

export default router