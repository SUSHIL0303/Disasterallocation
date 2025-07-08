import mongoose from 'mongoose';

const disasterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['flood', 'earthquake', 'cyclone', 'fire', 'drought', 'landslide', 'other']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: {
    type: String,
    enum: ['active', 'monitoring', 'resolved', 'escalated'],
    default: 'active'
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    },
    affectedArea: {
      type: Number, // in square kilometers
      default: 0
    }
  },
  affectedPopulation: {
    type: Number,
    default: 0
  },
  casualties: {
    injured: { type: Number, default: 0 },
    missing: { type: Number, default: 0 },
    displaced: { type: Number, default: 0 }
  },
  resources: [{
    type: {
      type: String,
      required: true,
      enum: ['food', 'water', 'medical', 'shelter', 'clothing', 'rescue_team', 'other']
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    fulfilled: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'fulfilled'],
      default: 'pending'
    }
  }],
  assignedTeams: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['coordinator', 'volunteer', 'specialist']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  updates: [{
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  weatherData: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    rainfall: Number,
    forecast: String
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  estimatedDuration: {
    type: Number // in hours
  },
  images: [{
    url: String,
    description: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
disasterSchema.index({ location: '2dsphere' });
disasterSchema.index({ type: 1, severity: 1 });
disasterSchema.index({ status: 1 });
disasterSchema.index({ createdAt: -1 });

export default mongoose.model('Disaster', disasterSchema);