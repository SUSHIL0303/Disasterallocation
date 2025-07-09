import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users, 
  Package,
  ArrowLeft,
  Plus,
  Edit,
  MessageCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Disaster {
  _id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  location: {
    address: string;
    coordinates: number[];
  };
  affectedPopulation: number;
  casualties: {
    injured: number;
    missing: number;
    displaced: number;
  };
  resources: Array<{
    type: string;
    quantity: number;
    unit: string;
    priority: string;
    fulfilled: number;
    status: string;
  }>;
  assignedTeams: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      organization: string;
    };
    role: string;
    assignedAt: string;
  }>;
  updates: Array<{
    _id: string;
    message: string;
    type: string;
    author: {
      name: string;
      organization: string;
    };
    timestamp: string;
  }>;
  reportedBy: {
    name: string;
    organization: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DisasterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState('');
  const [updateType, setUpdateType] = useState('info');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDisaster();
    }
  }, [id]);

  const fetchDisaster = async () => {
    try {
      const response = await axios.get(`/api/disasters/${id}`);
      setDisaster(response.data);
    } catch (error) {
      toast.error('Failed to fetch disaster details');
      navigate('/disasters');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    setSubmittingUpdate(true);
    try {
      await axios.post(`/api/disasters/${id}/updates`, {
        message: newUpdate,
        type: updateType
      });
      
      setNewUpdate('');
      setUpdateType('info');
      fetchDisaster();
      toast.success('Update added successfully');
    } catch (error) {
      toast.error('Failed to add update');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
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

  if (!disaster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Disaster not found</h2>
          <p className="text-gray-600">The disaster you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/disasters')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Disasters</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getTypeIcon(disaster.type)}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{disaster.title}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 text-sm rounded-full border ${getSeverityColor(disaster.severity)}`}>
                    {disaster.severity.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(disaster.status)}`}>
                    {disaster.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">{disaster.type}</span>
                </div>
              </div>
            </div>
            <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600 mb-6">{disaster.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{disaster.location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Reported</p>
                      <p className="text-sm text-gray-600">
                        {new Date(disaster.createdAt).toLocaleDateString()} at{' '}
                        {new Date(disaster.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Affected Population</p>
                      <p className="text-sm text-gray-600">{disaster.affectedPopulation.toLocaleString()} people</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Casualties</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Injured:</span>
                        <span className="text-gray-900">{disaster.casualties.injured}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Missing:</span>
                        <span className="text-gray-900">{disaster.casualties.missing}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Displaced:</span>
                        <span className="text-gray-900">{disaster.casualties.displaced}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Reported By</p>
                    <p className="text-sm text-gray-600">{disaster.reportedBy.name}</p>
                    {disaster.reportedBy.organization && (
                      <p className="text-sm text-gray-500">{disaster.reportedBy.organization}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Resource Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Resource Requirements</h2>
                <button className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium">
                  <Plus className="h-4 w-4" />
                  <span>Add Resource</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {disaster.resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{resource.type}</p>
                        <p className="text-sm text-gray-600">
                          {resource.quantity} {resource.unit} required
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {resource.fulfilled} / {resource.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Math.round((resource.fulfilled / resource.quantity) * 100)}% fulfilled
                        </p>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(resource.fulfilled / resource.quantity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Updates</h2>
              
              {/* Add Update Form */}
              <form onSubmit={handleAddUpdate} className="mb-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex space-x-4">
                    <select
                      value={updateType}
                      onChange={(e) => setUpdateType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                    <textarea
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      placeholder="Add an update..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                    />
                    <button
                      type="submit"
                      disabled={submittingUpdate || !newUpdate.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingUpdate ? 'Adding...' : 'Add Update'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Updates List */}
              <div className="space-y-4">
                {disaster.updates.map((update) => (
                  <div key={update._id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getUpdateTypeColor(update.type)}`}>
                          {update.type}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{update.author.name}</span>
                        {update.author.organization && (
                          <span className="text-sm text-gray-500">({update.author.organization})</span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(update.timestamp).toLocaleDateString()} at{' '}
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{update.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Teams */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assigned Teams</h3>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Assign
                </button>
              </div>
              
              <div className="space-y-3">
                {disaster.assignedTeams.map((team) => (
                  <div key={team.user._id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{team.user.name}</p>
                      <p className="text-xs text-gray-500">{team.role} • {team.user.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  Request Resources
                </button>
                <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  Assign Volunteers
                </button>
                <button className="w-full text-left px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                  Update Status
                </button>
                <button className="w-full text-left px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                  Generate Report
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}