import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Users, 
  Package, 
  TrendingUp,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  overview: {
    totalDisasters: number;
    activeDisasters: number;
    totalVolunteers: number;
    availableVolunteers: number;
    totalResources: number;
    availableResources: number;
  };
  charts: {
    disastersByType: Array<{ _id: string; count: number }>;
    severityDistribution: Array<{ _id: string; count: number }>;
    resourcesByType: Array<{ _id: string; count: number }>;
  };
  recentDisasters: Array<{
    _id: string;
    title: string;
    type: string;
    severity: string;
    location: { address: string };
    reportedBy: { name: string; organization: string };
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flood': return '🌊';
      case 'earthquake': return '🌋';
      case 'cyclone': return '🌪️';
      case 'fire': return '🔥';
      case 'drought': return '🌵';
      case 'landslide': return '⛰️';
      default: return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Failed to load dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Active Disasters',
      value: stats.overview.activeDisasters,
      total: stats.overview.totalDisasters,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Available Volunteers',
      value: stats.overview.availableVolunteers,
      total: stats.overview.totalVolunteers,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Available Resources',
      value: stats.overview.availableResources,
      total: stats.overview.totalResources,
      icon: Package,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Response Rate',
      value: `${Math.round((stats.overview.activeDisasters / (stats.overview.totalDisasters || 1)) * 100)}%`,
      total: null,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor disaster response activities and resource coordination
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${card.bgColor} rounded-lg p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                    {card.total && (
                      <span className="text-sm text-gray-500 ml-2">
                        / {card.total}
                      </span>
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Disasters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Disasters</h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.recentDisasters.map((disaster) => (
                <div key={disaster._id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getTypeIcon(disaster.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {disaster.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(disaster.severity)}`}>
                        {disaster.severity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span>{disaster.location.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(disaster.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{disaster.reportedBy.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Statistics Charts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Disaster Distribution</h2>
            <div className="space-y-6">
              {/* Disaster Types */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">By Type</h3>
                <div className="space-y-2">
                  {stats.charts.disastersByType.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{getTypeIcon(item._id)}</span>
                        <span className="text-sm text-gray-600 capitalize">{item._id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${(item.count / stats.overview.totalDisasters) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity Distribution */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">By Severity</h3>
                <div className="space-y-2">
                  {stats.charts.severityDistribution.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{item._id}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${(item.count / stats.overview.totalDisasters) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}