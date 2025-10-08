import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const SchoolManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const queryClient = useQueryClient();

  const { data: schools, isLoading } = useQuery('schools', async () => {
    const response = await axios.get('/api/schools');
    return response.data;
  });

  const createSchoolMutation = useMutation(async (schoolData) => {
    const response = await axios.post('/api/schools', schoolData);
    return response.data;
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('schools');
      setShowCreateModal(false);
      toast.success('School created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create school');
    }
  });

  const handleCreateSchool = (formData) => {
    createSchoolMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">School Management</h1>
            <p className="page-subtitle">Manage schools and their subscriptions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Add New School
          </button>
        </div>
      </div>

      {/* Schools Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">All Schools</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools?.schools?.map((school) => (
                  <tr key={school.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{school.name}</p>
                        <p className="text-sm text-gray-500">{school.address}</p>
                      </div>
                    </td>
                    <td>{school.email}</td>
                    <td>{school.phone}</td>
                    <td>
                      <span className="badge badge-info capitalize">
                        {school.planType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        school.subscriptionStatus === 'active' ? 'badge-success' : 
                        school.subscriptionStatus === 'trial' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {school.subscriptionStatus}
                      </span>
                    </td>
                    <td>
                      {new Date(school.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedSchool(school)}
                          className="btn btn-sm btn-secondary"
                        >
                          View
                        </button>
                        <button className="btn btn-sm btn-secondary">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create School Modal */}
      {showCreateModal && (
        <CreateSchoolModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSchool}
          isLoading={createSchoolMutation.isLoading}
        />
      )}

      {/* School Details Modal */}
      {selectedSchool && (
        <SchoolDetailsModal
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
        />
      )}
    </div>
  );
};

const CreateSchoolModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    website: '',
    principalName: '',
    description: '',
    planType: 'basic',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Create New School</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">School Name *</label>
              <input
                type="text"
                name="name"
                required
                className="input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Address *</label>
            <textarea
              name="address"
              required
              className="input"
              rows={3}
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="label">Website</label>
              <input
                type="url"
                name="website"
                className="input"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Principal Name</label>
            <input
              type="text"
              name="principalName"
              className="input"
              value={formData.principalName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="label">Plan Type</label>
            <select
              name="planType"
              className="input"
              value={formData.planType}
              onChange={handleChange}
            >
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-4">Admin Account</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Admin Email *</label>
                <input
                  type="email"
                  name="adminEmail"
                  required
                  className="input"
                  value={formData.adminEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label">Admin Password *</label>
                <input
                  type="password"
                  name="adminPassword"
                  required
                  className="input"
                  value={formData.adminPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">First Name *</label>
                <input
                  type="text"
                  name="adminFirstName"
                  required
                  className="input"
                  value={formData.adminFirstName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="adminLastName"
                  required
                  className="input"
                  value={formData.adminLastName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SchoolDetailsModal = ({ school, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">{school.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">School Information</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{school.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{school.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{school.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-sm text-gray-900">{school.address}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Principal</dt>
                  <dd className="text-sm text-gray-900">{school.principalName}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Subscription Details</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="text-sm text-gray-900 capitalize">{school.planType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">{school.subscriptionStatus}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(school.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolManagement;
