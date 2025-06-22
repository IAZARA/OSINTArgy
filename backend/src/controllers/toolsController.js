import Tool from '../models/Tool.js'
import Category from '../models/Category.js'
import Rating from '../models/Rating.js'

// @desc    Obtener todas las herramientas
// @route   GET /api/tools
// @access  Public
export const getTools = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      subcategory,
      region,
      language,
      type,
      difficulty_level,
      is_free,
      requires_registration,
      min_rating,
      search,
      sort = 'rating'
    } = req.query

    // Construir filtros
    const filters = { status: 'active' }
    
    if (category) filters.category = category
    if (subcategory) filters.subcategory = subcategory
    if (region) filters.region = region
    if (language) filters.language = language
    if (type) filters.type = type
    if (difficulty_level) filters.difficulty_level = difficulty_level
    if (is_free !== undefined) filters.is_free = is_free === 'true'
    if (requires_registration !== undefined) filters.requires_registration = requires_registration === 'true'
    if (min_rating) filters.rating = { $gte: parseFloat(min_rating) }

    // Búsqueda de texto
    if (search) {
      filters.$text = { $search: search }
    }

    // Configurar ordenamiento
    let sortOptions = {}
    switch (sort) {
      case 'name':
        sortOptions = { name: 1 }
        break
      case 'rating':
        sortOptions = { rating: -1, usage_count: -1 }
        break
      case 'usage':
        sortOptions = { usage_count: -1, rating: -1 }
        break
      case 'recent':
        sortOptions = { last_updated: -1 }
        break
      default:
        sortOptions = { rating: -1, usage_count: -1 }
    }

    // Ejecutar consulta con paginación
    const tools = await Tool.find(filters)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    // Contar total de documentos
    const total = await Tool.countDocuments(filters)

    res.json({
      success: true,
      data: tools,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error obteniendo herramientas:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Obtener herramienta por ID
// @route   GET /api/tools/:id
// @access  Public
export const getToolById = async (req, res) => {
  try {
    const { id } = req.params
    
    const tool = await Tool.findOne({ id, status: 'active' })
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      })
    }

    // Incrementar contador de vistas
    await tool.incrementViews()

    // Obtener estadísticas de ratings
    const ratingStats = await Rating.getToolStats(id)

    res.json({
      success: true,
      data: {
        ...tool.toObject(),
        ratingStats: ratingStats[0] || null
      }
    })
  } catch (error) {
    console.error('Error obteniendo herramienta:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Buscar herramientas
// @route   GET /api/tools/search
// @access  Public
export const searchTools = async (req, res) => {
  try {
    const { q, filters = {} } = req.query
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La consulta de búsqueda debe tener al menos 2 caracteres'
      })
    }

    const tools = await Tool.searchTools(q, filters)
      .limit(20)
      .lean()

    res.json({
      success: true,
      data: tools,
      query: q,
      total: tools.length
    })
  } catch (error) {
    console.error('Error en búsqueda:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Obtener herramientas por categoría
// @route   GET /api/tools/category/:categoryId
// @access  Public
export const getToolsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params
    const { subcategory, page = 1, limit = 20 } = req.query

    // Verificar que la categoría existe
    const category = await Category.findOne({ id: categoryId, is_active: true })
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      })
    }

    // Construir filtros
    const filters = { 
      category: categoryId, 
      status: 'active' 
    }
    
    if (subcategory) {
      filters.subcategory = subcategory
    }

    // Obtener herramientas
    const tools = await Tool.find(filters)
      .sort({ rating: -1, usage_count: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    const total = await Tool.countDocuments(filters)

    // Incrementar vistas de la categoría
    await category.incrementViews()

    res.json({
      success: true,
      data: tools,
      category: category,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error obteniendo herramientas por categoría:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Registrar uso de herramienta
// @route   POST /api/tools/:id/use
// @access  Public
export const recordToolUsage = async (req, res) => {
  try {
    const { id } = req.params
    
    const tool = await Tool.findOne({ id, status: 'active' })
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      })
    }

    // Incrementar contador de uso
    await tool.incrementUsage()

    // Si hay usuario autenticado, agregar al historial
    if (req.user) {
      await req.user.addToHistory(id)
    }

    res.json({
      success: true,
      message: 'Uso registrado correctamente',
      data: {
        usage_count: tool.usage_count + 1
      }
    })
  } catch (error) {
    console.error('Error registrando uso:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Obtener herramientas populares
// @route   GET /api/tools/popular
// @access  Public
export const getPopularTools = async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query

    let dateFilter = {}
    
    // Filtrar por período si se especifica
    if (period !== 'all') {
      const now = new Date()
      let startDate
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }
      
      if (startDate) {
        dateFilter.last_updated = { $gte: startDate }
      }
    }

    const tools = await Tool.find({ 
      status: 'active',
      ...dateFilter
    })
      .sort({ usage_count: -1, rating: -1 })
      .limit(parseInt(limit))
      .lean()

    res.json({
      success: true,
      data: tools,
      period
    })
  } catch (error) {
    console.error('Error obteniendo herramientas populares:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Obtener herramientas recomendadas
// @route   GET /api/tools/recommended
// @access  Private
export const getRecommendedTools = async (req, res) => {
  try {
    const userId = req.user._id
    const { limit = 10 } = req.query

    // Obtener categorías de herramientas favoritas del usuario
    const userFavorites = req.user.favorites.map(fav => fav.toolId)
    
    if (userFavorites.length === 0) {
      // Si no tiene favoritos, devolver herramientas populares
      return getPopularTools(req, res)
    }

    // Obtener categorías de las herramientas favoritas
    const favoriteTools = await Tool.find({ 
      id: { $in: userFavorites },
      status: 'active'
    }).select('category subcategory tags')

    const categories = [...new Set(favoriteTools.map(tool => tool.category))]
    const subcategories = [...new Set(favoriteTools.map(tool => tool.subcategory))]
    const tags = [...new Set(favoriteTools.flatMap(tool => tool.tags))]

    // Buscar herramientas similares
    const recommendedTools = await Tool.find({
      status: 'active',
      id: { $nin: userFavorites }, // Excluir favoritos
      $or: [
        { category: { $in: categories } },
        { subcategory: { $in: subcategories } },
        { tags: { $in: tags } }
      ]
    })
      .sort({ rating: -1, usage_count: -1 })
      .limit(parseInt(limit))
      .lean()

    res.json({
      success: true,
      data: recommendedTools
    })
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Crear nueva herramienta (Admin)
// @route   POST /api/tools
// @access  Private/Admin
export const createTool = async (req, res) => {
  try {
    const toolData = req.body

    // Verificar que no existe una herramienta con el mismo ID
    const existingTool = await Tool.findOne({ id: toolData.id })
    if (existingTool) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una herramienta con ese ID'
      })
    }

    const tool = new Tool(toolData)
    await tool.save()

    res.status(201).json({
      success: true,
      data: tool,
      message: 'Herramienta creada exitosamente'
    })
  } catch (error) {
    console.error('Error creando herramienta:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Actualizar herramienta (Admin)
// @route   PUT /api/tools/:id
// @access  Private/Admin
export const updateTool = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const tool = await Tool.findOneAndUpdate(
      { id },
      { ...updateData, last_updated: new Date() },
      { new: true, runValidators: true }
    )

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      })
    }

    res.json({
      success: true,
      data: tool,
      message: 'Herramienta actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error actualizando herramienta:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Eliminar herramienta (Admin)
// @route   DELETE /api/tools/:id
// @access  Private/Admin
export const deleteTool = async (req, res) => {
  try {
    const { id } = req.params

    const tool = await Tool.findOneAndUpdate(
      { id },
      { status: 'inactive' },
      { new: true }
    )

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Herramienta eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error eliminando herramienta:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}