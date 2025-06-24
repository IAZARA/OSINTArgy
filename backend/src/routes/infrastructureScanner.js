import express from 'express'
import infrastructureScannerController from '../controllers/infrastructureScannerController.js'

const router = express.Router()

// Ruta para iniciar escaneo completo de infraestructura
router.post('/scan', infrastructureScannerController.performFullScan.bind(infrastructureScannerController))

// Ruta para obtener resultado de escaneo por ID
router.get('/scan/:scanId', infrastructureScannerController.getScanResult.bind(infrastructureScannerController))

export default router