import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  searchTools,
  getSearchSuggestions,
  getAvailableFilters,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory
} from '../controllers/searchController.js'

const router = express.Router()

// @desc    Búsqueda avanzada de herramientas
// @route   GET /api/search/tools
// @access  Public
router.get('/tools', searchTools)

// @desc    Obtener sugerencias de búsqueda
// @route   GET /api/search/suggestions
// @access  Public
router.get('/suggestions', getSearchSuggestions)

// @desc    Obtener filtros disponibles
// @route   GET /api/search/filters
// @access  Public
router.get('/filters', getAvailableFilters)

// @desc    Guardar búsqueda en historial
// @route   POST /api/search/history
// @access  Private
router.post('/history', protect, saveSearchHistory)

// @desc    Obtener historial de búsquedas
// @route   GET /api/search/history
// @access  Private
router.get('/history', protect, getSearchHistory)

// @desc    Limpiar historial de búsquedas
// @route   DELETE /api/search/history
// @access  Private
router.delete('/history', protect, clearSearchHistory)

export default router