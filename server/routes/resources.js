import express from 'express';
import Resource from '../models/Resource.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const resources = await Resource.find(filter)
      .populate('supplier', 'name email organization')
      .populate('disaster', 'title type severity')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments(filter);

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Create new resource
router.post('/', authMiddleware, async (req, res) => {
  try {
    const resource = new Resource({
      ...req.body,
      supplier: req.user.userId
    });

    await resource.save();
    
    const populatedResource = await Resource.findById(resource._id)
      .populate('supplier', 'name email organization');

    res.status(201).json(populatedResource);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update resource
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier', 'name email organization');

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Allocate resource to disaster
router.post('/:id/allocate', authMiddleware, async (req, res) => {
  try {
    const { disasterId, quantity } = req.body;
    
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient resource quantity' });
    }

    resource.quantity -= quantity;
    resource.status = resource.quantity === 0 ? 'allocated' : 'available';
    resource.disaster = disasterId;

    // Add to history
    resource.history.push({
      action: 'allocated',
      performedBy: req.user.userId,
      notes: `Allocated ${quantity} units to disaster`
    });

    await resource.save();

    const populatedResource = await Resource.findById(resource._id)
      .populate('supplier', 'name email organization')
      .populate('disaster', 'title type severity');

    res.json(populatedResource);
  } catch (error) {
    console.error('Allocate resource error:', error);
    res.status(500).json({ error: 'Failed to allocate resource' });
  }
});

export default router;