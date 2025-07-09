import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  User,
  Award
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
  location: {
    address: string;
  };
  skills: string[];
  availability: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchVolunteers();
  }, [availabilityFilter, roleFilter]);

  const fetchVolunteers = async () => {
    try {
      const params = new URLSearchParams();
      if (availabilityFilter) params.append('availability', availabilityFilter);
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await axios.get(`/api/volunteers?${params}`);
      setVolunteers(response.data.volunteers);
    } catch (error) {
      toast.error('Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (volunteerId: string, currentAvailability: boolean) => {
    try {
      await axios.patch(`/api/volunteers/${volunteerId}/availability`, {
        availability: !currentAvailability
      });
      
      setVolunteers(volunteers.map(volunteer =>
        volunteer._id === volunteerId
          ? { ...volunteer, availability: !currentAvailability }
          : volunteer
      ));
      
      toast.success('Availability updated successfully');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'ngo': return 'bg-blue-100 text-blue-800';
      case 'volunteer': return 'bg-green-100 text-green-800';
      case 'government': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillColor = (skill: string) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-gray-100 text-gray-800'
    ];
    return colors[skill.length % colors.length];
  };

  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <h1 className="text-3xl font-bold text-gray-900">Volunteers</h1>
              <p className="mt-2 text-gray-600">
                Manage and coordinate volunteer assignments for disaster response
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-green-600">
                  {volunteers.filter(v => v.availability).length}
                </span> available of {volunteers.length} total
              </div>
            </div>
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
                  placeholder="Search volunteers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Availability</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Roles</option>
                <option value="volunteer">Volunteer</option>
                <option value="ngo">NGO</option>
                <option value="government">Government</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Volunteers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolunteers.map((volunteer, index) => (
            <motion.div
              key={volunteer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{volunteer.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(volunteer.role)}`}>
                        {volunteer.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                      volunteer.availability 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {volunteer.availability ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>{volunteer.availability ? 'Available' : 'Unavailable'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{volunteer.email}</span>
                  </div>
                  {volunteer.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4" />
                      <span>{volunteer.phone}</span>
                    </div>
                  )}
                  {volunteer.location?.address && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{volunteer.location.address}</span>
                    </div>
                  )}
                  {volunteer.organization && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Award className="h-4 w-4" />
                      <span className="truncate">{volunteer.organization}</span>
                    </div>
                  )}
                </div>

                {volunteer.skills && volunteer.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className={`px-2 py-1 text-xs rounded-full ${getSkillColor(skill)}`}
                        >
                          {skill}
                        </span>
                      ))}
                      {volunteer.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          +{volunteer.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Joined: {new Date(volunteer.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => toggleAvailability(volunteer._id, volunteer.availability)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      volunteer.availability
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {volunteer.availability ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Assign Task
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Contact
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVolunteers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
            <p className="text-gray-600">
              {searchTerm || availabilityFilter || roleFilter 
                ? 'Try adjusting your search or filters'
                : 'No volunteers have registered yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}