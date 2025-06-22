import mongoose from 'mongoose'

const subcategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tools: [{
    type: String, // IDs de herramientas
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  }
}, { _id: false })

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  color: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)
      },
      message: 'Color debe ser un código hexadecimal válido'
    }
  },
  subcategories: [subcategorySchema],
  order: {
    type: Number,
    default: 0
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  // Metadatos para SEO
  meta_title: {
    type: String,
    trim: true,
    maxlength: 60
  },
  meta_description: {
    type: String,
    trim: true,
    maxlength: 160
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true
  },
  // Estadísticas
  tools_count: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Índices
categorySchema.index({ name: 'text', description: 'text' })
categorySchema.index({ is_active: 1, order: 1 })
categorySchema.index({ slug: 1 })

// Virtual para obtener herramientas de la categoría
categorySchema.virtual('tools', {
  ref: 'Tool',
  localField: 'id',
  foreignField: 'category'
})

// Middleware para generar slug automáticamente
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  next()
})

// Método para incrementar views
categorySchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Método para actualizar contador de herramientas
categorySchema.methods.updateToolsCount = async function() {
  const Tool = mongoose.model('Tool')
  this.tools_count = await Tool.countDocuments({ category: this.id, status: 'active' })
  return this.save()
}

// Método estático para obtener categorías con estadísticas
categorySchema.statics.getWithStats = function() {
  return this.aggregate([
    {
      $match: { is_active: true }
    },
    {
      $lookup: {
        from: 'tools',
        localField: 'id',
        foreignField: 'category',
        as: 'category_tools'
      }
    },
    {
      $addFields: {
        tools_count: {
          $size: {
            $filter: {
              input: '$category_tools',
              cond: { $eq: ['$$this.status', 'active'] }
            }
          }
        },
        avg_rating: {
          $avg: {
            $filter: {
              input: '$category_tools.rating',
              cond: { $gt: ['$$this', 0] }
            }
          }
        }
      }
    },
    {
      $project: {
        category_tools: 0
      }
    },
    {
      $sort: { order: 1, name: 1 }
    }
  ])
}

const Category = mongoose.model('Category', categorySchema)

export default Category