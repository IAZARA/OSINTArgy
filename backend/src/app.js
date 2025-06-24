import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import winston from 'winston'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Importar rutas
import authRoutes from './routes/auth.js'
import toolsRoutes from './routes/tools.js'
import usersRoutes from './routes/users.js'
import ratingsRoutes from './routes/ratings.js'
import searchRoutes from './routes/search.js'
import dorksRoutes from './routes/dorks.js'
import categoriesRoutes from './routes/categories.js'
import emailOsintRoutes from './routes/emailOsint.js'
import fileAnalysisRoutes from './routes/fileAnalysis.js'
import usernameOsintRoutes from './routes/usernameOsint.js'
import infrastructureScannerRoutes from './routes/infrastructureScanner.js'

// Importar middleware
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

// Configurar variables de entorno
dotenv.config()

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Crear directorio de logs si no existe
import fs from 'fs'
const logsDir = join(__dirname, '../../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'osintargy-backend' },
  transports: [
    new winston.transports.File({ filename: join(logsDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: join(logsDir, 'combined.log') }),
  ],
})

// En desarrollo, también loggear a consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

const app = express()
const PORT = process.env.PORT || 5000

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
})

// Middleware de seguridad
app.use(helmet())
app.use(limiter)

// Configurar CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))

// Middleware para parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Rutas principales
app.use('/api/auth', authRoutes)
app.use('/api/tools', toolsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/ratings', ratingsRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/dorks', dorksRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/osint', emailOsintRoutes)
app.use('/api/osint', usernameOsintRoutes)
app.use('/api/file-analysis', fileAnalysisRoutes)
app.use('/api/infrastructure-scanner', infrastructureScannerRoutes)

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'OSINTArgy API',
    version: '1.0.0',
    documentation: '/api/docs'
  })
})

// Middleware de manejo de errores
app.use(notFound)
app.use(errorHandler)

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/osintargy')
    logger.info(`MongoDB conectado: ${conn.connection.host}`)
  } catch (error) {
    logger.error('Error conectando a MongoDB:', error)
    process.exit(1)
  }
}

// Iniciar servidor
const startServer = async () => {
  await connectDB()
  
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT}`)
    logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`)
  })
}

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  process.exit(1)
})

// Iniciar la aplicación
startServer()

export default app