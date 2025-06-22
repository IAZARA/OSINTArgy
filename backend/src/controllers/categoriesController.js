import Category from '../models/Category.js'

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { include_stats = 'true', include_inactive = 'false' } = req.query

    let categories

    if (include_stats === 'true') {
      // Obtener categorías con estadísticas
      categories = await Category.getWithStats()
    } else {
      // Obtener categorías básicas
      const filters = include_inactive === 'true' ? {} : { is_active: true }
      categories = await Category.find(filters)
        .sort({ order: 1, name: 1 })
        .lean()
    }

    res.json({
      success: true,
      data: categories,
      total: categories.length
    })
  } catch (error) {
    console.error('Error obteniendo categorías:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Obtener categoría por ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params
    
    const category = await Category.findOne({ 
      $or: [{ id }, { slug: id }], 
      is_active: true 
    })
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      })
    }

    // Incrementar contador de vistas
    await category.incrementViews()

    res.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error obteniendo categoría:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Crear nueva categoría (Admin)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const categoryData = req.body

    // Verificar que no existe una categoría con el mismo ID
    const existingCategory = await Category.findOne({ 
      $or: [{ id: categoryData.id }, { slug: categoryData.slug }] 
    })
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese ID o slug'
      })
    }

    const category = new Category(categoryData)
    await category.save()

    res.status(201).json({
      success: true,
      data: category,
      message: 'Categoría creada exitosamente'
    })
  } catch (error) {
    console.error('Error creando categoría:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Actualizar categoría (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const category = await Category.findOneAndUpdate(
      { $or: [{ id }, { slug: id }] },
      updateData,
      { new: true, runValidators: true }
    )

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      })
    }

    res.json({
      success: true,
      data: category,
      message: 'Categoría actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error actualizando categoría:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// @desc    Eliminar categoría (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findOneAndUpdate(
      { $or: [{ id }, { slug: id }] },
      { is_active: false },
      { new: true }
    )

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error eliminando categoría:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}