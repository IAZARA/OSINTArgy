import winston from 'winston'

// Logger para errores
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Middleware para manejar rutas no encontradas
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Middleware principal de manejo de errores
export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log del error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ')
    error = {
      message,
      statusCode: 400
    }
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const message = `Ya existe un registro con ese ${field}`
    error = {
      message,
      statusCode: 400
    }
  }

  // Error de cast de Mongoose (ObjectId inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado'
    error = {
      message,
      statusCode: 404
    }
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido'
    error = {
      message,
      statusCode: 401
    }
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado'
    error = {
      message,
      statusCode: 401
    }
  }

  // Error de conexión a base de datos
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    const message = 'Error de conexión a la base de datos'
    error = {
      message,
      statusCode: 503
    }
  }

  // Error de límite de tamaño de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Archivo demasiado grande'
    error = {
      message,
      statusCode: 413
    }
  }

  // Error de tipo de archivo no permitido
  if (err.code === 'LIMIT_FILE_TYPE') {
    const message = 'Tipo de archivo no permitido'
    error = {
      message,
      statusCode: 400
    }
  }

  // Error de rate limiting
  if (err.status === 429) {
    const message = 'Demasiadas solicitudes, intenta de nuevo más tarde'
    error = {
      message,
      statusCode: 429
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// Middleware para manejar errores asíncronos
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Clase personalizada para errores de la aplicación
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Función helper para crear errores personalizados
export const createError = (message, statusCode = 500) => {
  return new AppError(message, statusCode)
}