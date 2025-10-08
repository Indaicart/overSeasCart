import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const FeatureManagement = () => {
  const [features, setFeatures] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    feature_key: '',
    feature_name: '',
    description: '',
    category: 'academic',
    icon: '',
    is_core: false,
    display_order: 999
  });

  const categories = [
    { value: 'all', label: 'All Features' },
    { value: 'core', label: 'Core Features' },
    { value: 'academic', label: 'Academic' },
    { value: 'financial', label: 'Financial' },
    { value: 'communication', label: 'Communication' },
    { value: 'advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    fetchFeatures();
    fetchPlans();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/feature-management/features', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFeatures(data.data);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      setError('Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/subscriptions/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleToggleFeature = async (featureId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/feature-management/features/${featureId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Feature ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        fetchFeatures();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to toggle feature');
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      setError('Failed to toggle feature');
    }
  };

  const handleCreateFeature = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/feature-management/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Feature created successfully');
        setShowCreateModal(false);
        setFormData({
          feature_key: '',
          feature_name: '',
          description: '',
          category: 'academic',
          icon: '',
          is_core: false,
          display_order: 999
        });
        fetchFeatures();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to create feature');
      }
    } catch (error) {
      console.error('Error creating feature:', error);
      setError('Failed to create feature');
    }
  };

  const handleDeleteFeature = async (featureId) => {
    if (!window.confirm('Are you sure you want to delete this feature?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/feature-management/features/${featureId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Feature deleted successfully');
        fetchFeatures();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to delete feature');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      setError('Failed to delete feature');
    }
  };

  const openAssignModal = (plan) => {
    setSelectedPlan(plan);
    setShowAssignModal(true);
  };

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const getCategoryBadgeColor = (category) => {
    const colors = {
      core: 'bg-blue-100 text-blue-800',
      academic: 'bg-green-100 text-green-800',
      financial: 'bg-yellow-100 text-yellow-800',
      communication: 'bg-purple-100 text-purple-800',
      advanced: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feature Management</h1>
        <p className="text-gray-600 mt-2">
          Control which features are available in your subscription plans
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Feature
        </button>
      </div>

      {/* Feature Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Feature
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFeatures.map((feature) => (
              <tr key={feature.id} className={!feature.is_active ? 'bg-gray-50 opacity-60' : ''}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {feature.feature_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {feature.description}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeColor(feature.category)}`}>
                    {feature.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {feature.is_active ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircleIcon className="w-5 h-5 mr-1" />
                      Enabled
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircleIcon className="w-5 h-5 mr-1" />
                      Disabled
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {feature.is_core ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Core
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      Optional
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-3">
                    {!feature.is_core && (
                      <button
                        onClick={() => handleToggleFeature(feature.id, feature.is_active)}
                        className={`${
                          feature.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {feature.is_active ? 'Disable' : 'Enable'}
                      </button>
                    )}
                    {!feature.is_core && (
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No features found in this category
          </div>
        )}
      </div>

      {/* Plan Feature Assignment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Assign Features to Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">${plan.monthly_price}/month</p>
              <button
                onClick={() => openAssignModal(plan)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Cog6ToothIcon className="w-5 h-5 mr-2" />
                Manage Features
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Feature Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Feature</h2>
            <form onSubmit={handleCreateFeature}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feature Key *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.feature_key}
                      onChange={(e) => setFormData({...formData, feature_key: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., hostel_management"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feature Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.feature_name}
                      onChange={(e) => setFormData({...formData, feature_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Hostel Management"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brief description of the feature"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="academic">Academic</option>
                      <option value="financial">Financial</option>
                      <option value="communication">Communication</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_core}
                      onChange={(e) => setFormData({...formData, is_core: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Core Feature (cannot be disabled)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureManagement;
