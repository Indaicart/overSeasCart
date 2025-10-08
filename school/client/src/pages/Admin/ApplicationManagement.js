import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const ApplicationManagement = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  const [assignedPlan, setAssignedPlan] = useState('basic');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const queryClient = useQueryClient();

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery('applications', async () => {
    const response = await axios.get('/api/school-applications');
    return response.data;
  });

  // Fetch plans
  const { data: plans } = useQuery('subscription-plans', async () => {
    const response = await axios.get('/api/school-applications/plans');
    return response.data;
  });

  // Approve application mutation
  const approveMutation = useMutation(async ({ applicationId, data }) => {
    const response = await axios.post(`/api/school-applications/${applicationId}/approve`, data);
    return response.data;
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('applications');
      setShowModal(false);
      setSelectedApplication(null);
      setNotes('');
    }
  });

  // Reject application mutation
  const rejectMutation = useMutation(async ({ applicationId, reason }) => {
    const response = await axios.post(`/api/school-applications/${applicationId}/reject`, { reason });
    return response.data;
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('applications');
      setShowModal(false);
      setSelectedApplication(null);
      setNotes('');
    }
  });

  const handleViewApplication = async (applicationId) => {
    try {
      const response = await axios.get(`/api/school-applications/${applicationId}`);
      setSelectedApplication(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching application details:', error);
    }
  };

  const handleApprove = () => {
    setActionType('approve');
    setAssignedPlan(selectedApplication?.requirements?.preferredPlan || 'basic');
    setAdminEmail(selectedApplication?.contactInfo?.email || '');
    setAdminPassword('password123');
  };

  const handleReject = () => {
    setActionType('reject');
  };

  const handleSubmitAction = () => {
    if (actionType === 'approve') {
      approveMutation.mutate({
        applicationId: selectedApplication.id,
        data: {
          assignedPlan,
          adminEmail,
          adminPassword,
          notes
        }
      });
    } else if (actionType === 'reject') {
      rejectMutation.mutate({
        applicationId: selectedApplication.id,
        reason: notes
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'onboarded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'approved': return <CheckIcon className="h-4 w-4" />;
      case 'rejected': return <XMarkIcon className="h-4 w-4" />;
      case 'onboarded': return <BuildingOfficeIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const applications = applicationsData?.applications || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">School Applications</h1>
        <div className="text-sm text-gray-500">
          {applications.length} total applications
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <XMarkIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Onboarded</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'onboarded').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Applications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preferred Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {application.schoolName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.contactEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {application.contactPerson}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {application.estimatedStudents} students
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                      {application.estimatedTeachers} teachers
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {application.preferredPlan || 'Not specified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{application.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewApplication(application.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleViewApplication(application.id);
                            handleApprove();
                          }}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            handleViewApplication(application.id);
                            handleReject();
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* School Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">School Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedApplication.schoolInfo.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedApplication.schoolInfo.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedApplication.schoolInfo.phone}
                    </div>
                    <div>
                      <span className="font-medium">Website:</span> {selectedApplication.schoolInfo.website || 'N/A'}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Address:</span> {selectedApplication.schoolInfo.address}
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Requirements</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Students:</span> {selectedApplication.requirements.estimatedStudents}
                    </div>
                    <div>
                      <span className="font-medium">Teachers:</span> {selectedApplication.requirements.estimatedTeachers}
                    </div>
                    <div>
                      <span className="font-medium">Classes:</span> {selectedApplication.requirements.estimatedClasses || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span> {selectedApplication.requirements.budgetRange || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Preferred Plan:</span> {selectedApplication.requirements.preferredPlan || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Trial Period:</span> {selectedApplication.requirements.trialPeriod} days
                    </div>
                  </div>
                  
                  {selectedApplication.requirements.neededFeatures.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Needed Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApplication.requirements.neededFeatures.map((feature, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Contact Person:</span> {selectedApplication.contactInfo.person}
                    </div>
                    <div>
                      <span className="font-medium">Position:</span> {selectedApplication.contactInfo.position}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedApplication.contactInfo.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedApplication.contactInfo.phone || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Action Form */}
                {actionType && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">
                      {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
                    </h4>
                    
                    {actionType === 'approve' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Assign Plan
                          </label>
                          <select
                            value={assignedPlan}
                            onChange={(e) => setAssignedPlan(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            {plans?.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name} - ${plan.monthlyPrice}/month
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Admin Email
                          </label>
                          <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Admin Password
                          </label>
                          <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={actionType === 'approve' ? 'Approval notes...' : 'Reason for rejection...'}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => {
                          setActionType(null);
                          setNotes('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitAction}
                        disabled={approveMutation.isLoading || rejectMutation.isLoading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          actionType === 'approve' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        } disabled:opacity-50`}
                      >
                        {approveMutation.isLoading || rejectMutation.isLoading 
                          ? 'Processing...' 
                          : actionType === 'approve' 
                            ? 'Approve' 
                            : 'Reject'
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
