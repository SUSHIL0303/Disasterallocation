import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['food', 'water', 'medical', 'shelter', 'clothing', 'equipment', 'vehicle', 'other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'allocated', 'dispatched', 'delivered', 'expired'],
    default: 'available'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
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
    storageType: {
      type: String,
      enum: ['warehouse', 'mobile', 'temporary', 'field_station'],
      default: 'warehouse'
    }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  disaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dispatchDetails: {
    dispatchedAt: Date,
    expectedDelivery: Date,
    actualDelivery: Date,
    transportMethod: {
      type: String,
      enum: ['truck', 'helicopter', 'boat', 'walking', 'drone', 'other']
    },
    trackingNumber: String,
    driver: {
      name: String,
      phone: String
    }
  },
  costDetails: {
    unitCost: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  expiryDate: {
    type: Date
  },
  conditions: {
    temperature: {
      min: Number,
      max: Number
    },
    humidity: {
      min: Number,
      max: Number
    },
    specialHandling: String
  },
  images: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    action: {
      type: String,
      enum: ['created', 'allocated', 'dispatched', 'delivered', 'returned', 'expired'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
resourceSchema.index({ location: '2dsphere' });
resourceSchema.index({ type: 1, status: 1 });
resourceSchema.index({ supplier: 1 });
resourceSchema.index({ disaster: 1 });

export default mongoose.model('Resource', resourceSchema);