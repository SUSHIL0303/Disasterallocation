import express from 'express';
import Disaster from '../models/Disaster.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalDisasters,
      activeDisasters,
      totalVolunteers,
      availableVolunteers,
      totalResources,
      availableResources,
      recentDisasters
    ] = await Promise.all([
      Disaster.countDocuments(),
      Disaster.countDocuments({ status: 'active' }),
      User.countDocuments({ role: { $in: ['volunteer', 'ngo'] } }),
      User.countDocuments({ 
        role: { $in: ['volunteer', 'ngo'] },
        availability: true,
        isActive: true
      }),
      Resource.countDocuments(),
      Resource.countDocuments({ status: 'available' }),
      Disaster.find({ status: 'active' })
        .populate('reportedBy', 'name organization')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Get disaster statistics by type
    const disastersByType = await Disaster.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get severity distribution
    const severityDistribution = await Disaster.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get resource distribution
    const resourcesByType = await Resource.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalDisasters,
        activeDisasters,
        totalVolunteers,
        availableVolunteers,
        totalResources,
        availableResources
      },
      charts: {
        disastersByType,
        severityDistribution,
        resourcesByType
      },
      recentDisasters
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get real-time updates
router.get('/updates', async (req, res) => {
  try {
    const recentUpdates = await Disaster.aggregate([
      { $unwind: '$updates' },
      { $sort: { 'updates.timestamp': -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'updates.author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $project: {
          title: 1,
          type: 1,
          severity: 1,
          'updates.message': 1,
          'updates.type': 1,
          'updates.timestamp': 1,
          author: { $arrayElemAt: ['$author', 0] }
        }
      }
    ]);

    res.json(recentUpdates);
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

export default router;