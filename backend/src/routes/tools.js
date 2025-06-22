import express from 'express'
import {
  getTools,
  getToolById,
  searchTools,
  getToolsByCategory,
  recordToolUsage,
  getPopularTools,
  getRecommendedTools,
  createTool,
  updateTool,
  deleteTool
} from '../controllers/toolsController.js'
import { protect, authorize } from '../middleware/auth.js'
import { validateTool } from '../middleware/validation.js'

const router = express.Router()

// Rutas públicas
router.get('/', getTools)
router.get('/search', searchTools)
router.get('/popular', getPopularTools)
router.get('/category/:categoryId', getToolsByCategory)
router.get('/:id', getToolById)
router.post('/:id/use', recordToolUsage)

// Rutas privadas
router.get('/recommended', protect, getRecommendedTools)

// Rutas de administrador
router.post('/', protect, authorize('admin'), validateTool, createTool)
router.put('/:id', protect, authorize('admin'), validateTool, updateTool)
router.delete('/:id', protect, authorize('admin'), deleteTool)

export default router