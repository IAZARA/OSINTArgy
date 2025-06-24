import express from 'express'
import { FileAnalysisController } from '../controllers/fileAnalysisController.js'

const router = express.Router()

/**
 * @route   POST /api/file-analysis/analyze
 * @desc    Analizar archivo subido (imagen o documento)
 * @access  Public
 */
router.post('/analyze', 
  FileAnalysisController.uploadMiddleware,
  FileAnalysisController.analyzeFile
)

/**
 * @route   GET /api/file-analysis/supported-types
 * @desc    Obtener tipos de archivo soportados
 * @access  Public
 */
router.get('/supported-types', FileAnalysisController.getSupportedTypes)

export default router
