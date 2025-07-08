import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all volunteers
router.get('/', async (req, res) => {
  try {
    const { availability, skills, location, page = 1, limit = 10 } = req.query;
    
    const filter = { 
      role: { $in: ['volunteer', 'ngo'] },
      isActive: true
    };
    
    if (availability) filter.availability = availability === 'true';
    if (skills) filter.skills = { $in: skills.split(',') };

    const volunteers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      volunteers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// Update volunteer profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const volunteer = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.json(volunteer);
  } catch (error) {
    console.error('Update volunteer error:', error);
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
});

// Update availability
router.patch('/:id/availability', authMiddleware, async (req, res) => {
  try {
    const { availability } = req.body;
    
    const volunteer = await User.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    ).select('-password');

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.json(volunteer);
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

export default router;