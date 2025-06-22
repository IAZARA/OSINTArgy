import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema({
  toolId: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating debe ser un número entero'
    }
  },
  review: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  // Criterios específicos de evaluación
  criteria: {
    usability: {
      type: Number,
      min: 1,
      max: 5
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    speed: {
      type: Number,
      min: 1,
      max: 5
    },
    features: {
      type: Number,
      min: 1,
      max: 5
    },
    support: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Información adicional
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  usageFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'rarely'],
    required: true
  },
  recommendedFor: [{
    type: String,
    enum: ['beginners', 'professionals', 'researchers', 'investigators', 'students', 'analysts']
  }],
  // Metadatos
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  // Interacciones
  helpfulVotes: {
    type: Number,
    default: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'unhelpful']
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Estado
  isActive: {
    type: Boolean,
    default: true
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
  },
  flaggedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Índices
ratingSchema.index({ toolId: 1, userId: 1 }, { unique: true }) // Un usuario solo puede calificar una herramienta una vez
ratingSchema.index({ toolId: 1, rating: -1 })
ratingSchema.index({ userId: 1, createdAt: -1 })
ratingSchema.index({ isActive: 1, isFlagged: 1 })
ratingSchema.index({ helpfulVotes: -1 })

// Virtual para calcular el score de utilidad
ratingSchema.virtual('helpfulnessScore').get(function() {
  const total = this.helpfulVotes + this.unhelpfulVotes
  if (total === 0) return 0
  return (this.helpfulVotes / total) * 100
})

// Virtual para verificar si el review es detallado
ratingSchema.virtual('isDetailed').get(function() {
  return this.review && this.review.length > 50
})

// Middleware para actualizar el rating promedio de la herramienta
ratingSchema.post('save', async function() {
  await this.constructor.updateToolRating(this.toolId)
})

ratingSchema.post('remove', async function() {
  await this.constructor.updateToolRating(this.toolId)
})

// Método estático para actualizar el rating de una herramienta
ratingSchema.statics.updateToolRating = async function(toolId) {
  const Tool = mongoose.model('Tool')
  
  const stats = await this.aggregate([
    {
      $match: { 
        toolId: toolId, 
        isActive: true, 
        isFlagged: false 
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ])
  
  if (stats.length > 0) {
    const { avgRating, totalRatings } = stats[0]
    await Tool.findOneAndUpdate(
      { id: toolId },
      { 
        rating: Math.round(avgRating * 10) / 10, // Redondear a 1 decimal
        $inc: { usage_count: 0 } // Trigger para actualizar last_updated
      }
    )
  } else {
    await Tool.findOneAndUpdate(
      { id: toolId },
      { rating: 0 }
    )
  }
}

// Método para votar si un review es útil
ratingSchema.methods.vote = function(userId, voteType) {
  // Verificar si el usuario ya votó
  const existingVote = this.votedBy.find(vote => vote.userId.toString() === userId.toString())
  
  if (existingVote) {
    // Si ya votó lo mismo, remover el voto
    if (existingVote.vote === voteType) {
      this.votedBy = this.votedBy.filter(vote => vote.userId.toString() !== userId.toString())
      if (voteType === 'helpful') {
        this.helpfulVotes = Math.max(0, this.helpfulVotes - 1)
      } else {
        this.unhelpfulVotes = Math.max(0, this.unhelpfulVotes - 1)
      }
    } else {
      // Cambiar el voto
      existingVote.vote = voteType
      existingVote.votedAt = new Date()
      
      if (voteType === 'helpful') {
        this.helpfulVotes += 1
        this.unhelpfulVotes = Math.max(0, this.unhelpfulVotes - 1)
      } else {
        this.unhelpfulVotes += 1
        this.helpfulVotes = Math.max(0, this.helpfulVotes - 1)
      }
    }
  } else {
    // Nuevo voto
    this.votedBy.push({ userId, vote: voteType })
    if (voteType === 'helpful') {
      this.helpfulVotes += 1
    } else {
      this.unhelpfulVotes += 1
    }
  }
  
  return this.save()
}

// Método para reportar un review
ratingSchema.methods.flag = function(userId, reason) {
  if (!this.flaggedBy.find(flag => flag.userId.toString() === userId.toString())) {
    this.flaggedBy.push({ userId, reason })
    
    // Si recibe más de 3 reportes, marcarlo como flagged
    if (this.flaggedBy.length >= 3) {
      this.isFlagged = true
      this.flagReason = reason
    }
  }
  
  return this.save()
}

// Método estático para obtener estadísticas de ratings de una herramienta
ratingSchema.statics.getToolStats = function(toolId) {
  return this.aggregate([
    {
      $match: { 
        toolId: toolId, 
        isActive: true, 
        isFlagged: false 
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        },
        avgCriteria: {
          usability: { $avg: '$criteria.usability' },
          accuracy: { $avg: '$criteria.accuracy' },
          speed: { $avg: '$criteria.speed' },
          features: { $avg: '$criteria.features' },
          support: { $avg: '$criteria.support' }
        }
      }
    },
    {
      $addFields: {
        ratingCounts: {
          $reduce: {
            input: [1, 2, 3, 4, 5],
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { k: { $toString: '$$this' }, v: {
                      $size: {
                        $filter: {
                          input: '$ratingDistribution',
                          cond: { $eq: ['$$item', '$$this'] }
                        }
                      }
                    }}
                  ]]
                }
              ]
            }
          }
        }
      }
    }
  ])
}

const Rating = mongoose.model('Rating', ratingSchema)

export default Rating