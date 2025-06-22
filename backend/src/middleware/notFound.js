// Middleware para manejar rutas no encontradas
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

export default notFound