import express from 'express';
import Disaster from '../models/Disaster.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all disasters
router.get('/', async (req, res) => {
  try {
    const { status, type, severity, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const disasters = await Disaster.find(filter)
      .populate('reportedBy', 'name email organization')
      .populate('assignedTeams.user', 'name email organization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Disaster.countDocuments(filter);

    res.json({
      disasters,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get disasters error:', error);
    res.status(500).json({ error: 'Failed to fetch disasters' });
  }
});

// Get disaster by ID
router.get('/:id', async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id)
      .populate('reportedBy', 'name email organization')
      .populate('assignedTeams.user', 'name email organization role')
      .populate('updates.author', 'name email organization');

    if (!disaster) {
      return res.status(404).json({ error: 'Disaster not found' });
    }

    res.json(disaster);
  } catch (error) {
    console.error('Get disaster error:', error);
    res.status(500).json({ error: 'Failed to fetch disaster' });
  }
});

// Create new disaster
router.post('/', authMiddleware, async (req, res) => {
  try {
    const disaster = new Disaster({
      ...req.body,
      reportedBy: req.user.userId
    });

    await disaster.save();
    
    const populatedDisaster = await Disaster.findById(disaster._id)
      .populate('reportedBy', 'name email organization');

    res.status(201).json(populatedDisaster);
  } catch (error) {
    console.error('Create disaster error:', error);
    res.status(500).json({ error: 'Failed to create disaster' });
  }
});

// Update disaster
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const disaster = await Disaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email organization');

    if (!disaster) {
      return res.status(404).json({ error: 'Disaster not found' });
    }

    res.json(disaster);
  } catch (error) {
    console.error('Update disaster error:', error);
    res.status(500).json({ error: 'Failed to update disaster' });
  }
});

// Add update to disaster
router.post('/:id/updates', authMiddleware, async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({ error: 'Disaster not found' });
    }

    disaster.updates.push({
      ...req.body,
      author: req.user.userId
    });

    await disaster.save();

    const updatedDisaster = await Disaster.findById(disaster._id)
      .populate('updates.author', 'name email organization');

    res.json(updatedDisaster);
  } catch (error) {
    console.error('Add update error:', error);
    res.status(500).json({ error: 'Failed to add update' });
  }
});

// Assign team to disaster
router.post('/:id/assign', authMiddleware, async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) {
      return res.status(404).json({ error: 'Disaster not found' });
    }

    // Check if user is already assigned
    const existingAssignment = disaster.assignedTeams.find(
      team => team.user.toString() === userId
    );

    if (existingAssignment) {
      return res.status(400).json({ error: 'User already assigned to this disaster' });
    }

    disaster.assignedTeams.push({
      user: userId,
      role: role || 'volunteer'
    });

    await disaster.save();

    const updatedDisaster = await Disaster.findById(disaster._id)
      .populate('assignedTeams.user', 'name email organization');

    res.json(updatedDisaster);
  } catch (error) {
    console.error('Assign team error:', error);
    res.status(500).json({ error: 'Failed to assign team' });
  }
});

export default router;