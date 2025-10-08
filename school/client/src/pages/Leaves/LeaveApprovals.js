import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LeaveApprovals = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reviewModal, setReviewModal] = useState({ open: false, application: null, action: null });
  const [reviewComments, setReviewComments] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter, selectedMonth, selectedYear]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `http://localhost:5000/api/leaves/applications/all?`;
      if (filter !== 'all') {
        url += `status=${filter}&`;
      }
      url += `month=${selectedMonth}&year=${selectedYear}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async () => {
    if (!reviewModal.application) return;
    
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const { application, action } = reviewModal;
      
      const response = await fetch(
        `http://localhost:5000/api/leaves/applications/${application.id}/${action}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ review_comments: reviewComments })
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Leave application ${action}d successfully`);
        setReviewModal({ open: false, application: null, action: null });
        setReviewComments('');
        fetchApplications();
      } else {
        toast.error(result.message || `Failed to ${action} application`);
      }
    } catch (error) {
      console.error('Error processing review:', error);
      toast.error('Failed to process review');
    } finally {
      setProcessing(false);
    }
  };

  const openReviewModal = (application, action) => {
    setReviewModal({ open: true, application, action });
    setReviewComments('');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: ClockIcon }
    };
    
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} flex items-center w-fit`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CheckCircleIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Leave Approvals
        </h1>
        <p className="text-gray-600 mt-1">Review and approve staff leave applications</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>
              {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {[2023, 2024, 2025, 2026].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-900 text-sm font-semibold">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-900 text-sm font-semibold">Approved</p>
          <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-900 text-sm font-semibold">Rejected</p>
          <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No leave applications found for this period</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.teacher_name}
                      </h3>
                      <p className="text-sm text-gray-600">EMP-{application.employee_id}</p>
                      <p className="text-xs text-gray-500">{application.teacher_email}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(application.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Leave Type</p>
                    <p className="font-semibold">{application.leave_type_name}</p>
                    {!application.is_paid && (
                      <span className="text-xs text-red-600">⚠️ Unpaid</span>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="font-semibold">{application.total_days} day(s)</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">From</p>
                    <p className="font-semibold">{new Date(application.start_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">To</p>
                    <p className="font-semibold">{new Date(application.end_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-semibold mb-1">Reason:</p>
                  <p className="text-sm text-gray-900">{application.reason}</p>
                </div>

                {application.contact_during_leave && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Contact: {application.contact_during_leave}</p>
                  </div>
                )}

                {application.is_emergency && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                      🚨 Emergency Leave
                    </span>
                  </div>
                )}

                {application.review_comments && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold">Review Comments:</p>
                    <p className="text-sm text-gray-900">{application.review_comments}</p>
                    {application.reviewed_by_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        By {application.reviewed_by_name} on {new Date(application.reviewed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {application.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => openReviewModal(application, 'reject')}
                      className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => openReviewModal(application, 'approve')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {reviewModal.action === 'approve' ? 'Approve' : 'Reject'} Leave Application
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Staff: <span className="font-semibold">{reviewModal.application?.teacher_name}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Leave: <span className="font-semibold">{reviewModal.application?.leave_type_name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Duration: <span className="font-semibold">{reviewModal.application?.total_days} day(s)</span>
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments {reviewModal.action === 'reject' && <span className="text-red-500">(Required)</span>}
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows="4"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={`Add your ${reviewModal.action === 'approve' ? 'approval' : 'rejection'} comments...`}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setReviewModal({ open: false, application: null, action: null })}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewAction}
                  disabled={processing || (reviewModal.action === 'reject' && !reviewComments)}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    processing || (reviewModal.action === 'reject' && !reviewComments)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : reviewModal.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : `Confirm ${reviewModal.action === 'approve' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;

