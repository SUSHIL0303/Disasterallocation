import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Clock,
  Users,
  Eye
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
  };
  affectedPopulation: number;
  assignedTeams: Array<{ user: { name: string } }>;
  reportedBy: {
    name: string;
    organization: string;
  };
  createdAt: string;
}

export default function Disasters() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDisasters();
  }, [statusFilter, severityFilter]);

  const fetchDisasters = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (severityFilter) params.append('severity', severityFilter);
      
      const response = await axios.get(`/api/disasters?${params}`);
      setDisasters(response.data.disasters);
    } catch (error) {
      toast.error('Failed to fetch disasters');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
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

  const filteredDisasters = disasters.filter(disaster =>
    disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disaster.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Disasters</h1>
              <p className="mt-2 text-gray-600">
                Monitor and coordinate disaster response activities
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Report Disaster</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search disasters..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Disasters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisasters.map((disaster, index) => (
            <motion.div
              key={disaster._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTypeIcon(disaster.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {disaster.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{disaster.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(disaster.severity)}`}>
                      {disaster.severity}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(disaster.status)}`}>
                      {disaster.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {disaster.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{disaster.location.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(disaster.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{disaster.affectedPopulation.toLocaleString()} affected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span>Reported by: </span>
                    <span className="font-medium">{disaster.reportedBy.name}</span>
                    {disaster.reportedBy.organization && (
                      <span className="ml-1">({disaster.reportedBy.organization})</span>
                    )}
                  </div>
                  <Link
                    to={`/disasters/${disaster._id}`}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDisasters.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No disasters found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter || severityFilter 
                ? 'Try adjusting your search or filters'
                : 'No disasters have been reported yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}