import mongoose from 'mongoose'

const toolSchema = new mongoose.Schema({
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
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  utility: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v)
      },
      message: 'URL debe ser válida'
    }
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  type: {
    type: String,
    required: true,
    enum: ['web', 'desktop', 'mobile', 'api', 'browser-extension', 'extension', 'tool', 'dataset', 'cli'],
    default: 'web'
  },
  indicators: [{
    type: String,
    enum: ['D', 'R', 'F', 'P', 'A', 'T', 'M', 'S', 'G', 'V'], // D=Datos, R=Registros, F=Forense, P=Personas, A=Análisis, T=Tool, M=Manual, S=Security, G=Geolocation, V=Verification
    uppercase: true
  }],
  region: {
    type: String,
    required: true,
    enum: ['internacional', 'argentina', 'latam', 'europa', 'norteamerica', 'asia', 'estados unidos', 'reino unido', 'rusia', 'china', 'corea', 'europa del este'],
    default: 'internacional'
  },
  language: {
    type: String,
    required: true,
    enum: ['es', 'en', 'pt', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'ko', 'multi'],
    default: 'es'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  usage_count: {
    type: Number,
    default: 0,
    min: 0
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated', 'maintenance'],
    default: 'active'
  },
  requires_registration: {
    type: Boolean,
    default: false
  },
  is_free: {
    type: Boolean,
    default: true
  },
  difficulty_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  // Metadatos adicionales
  screenshot_url: {
    type: String,
    trim: true
  },
  tutorial_url: {
    type: String,
    trim: true
  },
  api_documentation: {
    type: String,
    trim: true
  },
  pricing: {
    free_tier: {
      type: Boolean,
      default: true
    },
    paid_plans: [{
      name: String,
      price: String,
      features: [String]
    }]
  },
  // Estadísticas
  views: {
    type: Number,
    default: 0
  },
  favorites_count: {
    type: Number,
    default: 0
  },
  // Información de verificación
  verified: {
    type: Boolean,
    default: false
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified_date: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Índices para optimizar búsquedas
// Comentado temporalmente debido a problemas con idiomas no soportados
// toolSchema.index({ name: 'text', description: 'text', tags: 'text' })
toolSchema.index({ category: 1, subcategory: 1 })
toolSchema.index({ region: 1, language: 1 })
toolSchema.index({ status: 1, verified: 1 })
toolSchema.index({ rating: -1, usage_count: -1 })
toolSchema.index({ name: 1 })
toolSchema.index({ description: 1 })

// Virtual para URL completa con tracking
toolSchema.virtual('tracked_url').get(function() {
  return `${this.url}?ref=osintargy&tool=${this.id}`
})

// Middleware para incrementar views
toolSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Middleware para actualizar usage_count
toolSchema.methods.incrementUsage = function() {
  this.usage_count += 1
  this.last_updated = new Date()
  return this.save()
}

// Método estático para búsqueda avanzada
toolSchema.statics.searchTools = function(query, filters = {}) {
  const searchQuery = {}
  
  // Búsqueda de texto usando regex (temporal hasta resolver índice de texto)
  if (query) {
    const regex = new RegExp(query, 'i')
    searchQuery.$or = [
      { name: regex },
      { description: regex },
      { tags: { $in: [regex] } }
    ]
  }
  
  // Filtros
  if (filters.category) searchQuery.category = filters.category
  if (filters.subcategory) searchQuery.subcategory = filters.subcategory
  if (filters.region) searchQuery.region = filters.region
  if (filters.language) searchQuery.language = filters.language
  if (filters.type) searchQuery.type = filters.type
  if (filters.difficulty_level) searchQuery.difficulty_level = filters.difficulty_level
  if (filters.is_free !== undefined) searchQuery.is_free = filters.is_free
  if (filters.requires_registration !== undefined) searchQuery.requires_registration = filters.requires_registration
  if (filters.status) searchQuery.status = filters.status
  
  // Filtro de rating mínimo
  if (filters.min_rating) {
    searchQuery.rating = { $gte: filters.min_rating }
  }
  
  return this.find(searchQuery)
    .sort({ rating: -1, usage_count: -1, name: 1 })
}

const Tool = mongoose.model('Tool', toolSchema)

export default Tool