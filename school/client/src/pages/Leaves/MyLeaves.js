import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyLeaves = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear, filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch balances
      const balancesResponse = await fetch(`http://localhost:5000/api/leaves/balance?year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const balancesResult = await balancesResponse.json();
      if (balancesResult.success) {
        setBalances(balancesResult.data);
      }
      
      // Fetch applications
      let url = `http://localhost:5000/api/leaves/applications?year=${selectedYear}`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      
      const appsResponse = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appsResult = await appsResponse.json();
      if (appsResult.success) {
        setApplications(appsResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/leaves/applications/${applicationId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Leave application cancelled successfully');
        fetchData();
      } else {
        toast.error(result.message || 'Failed to cancel application');
      }
    } catch (error) {
      console.error('Error cancelling application:', error);
      toast.error('Failed to cancel application');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: BanIcon }
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

  const totalAllocated = balances.reduce((sum, b) => sum + parseFloat(b.allocated), 0);
  const totalUsed = balances.reduce((sum, b) => sum + parseFloat(b.used), 0);
  const totalAvailable = balances.reduce((sum, b) => sum + parseFloat(b.available), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="w-8 h-8 mr-2 text-indigo-600" />
            My Leaves
          </h1>
          <p className="text-gray-600 mt-1">Manage your leave applications and view balance</p>
        </div>
        
        <button
          onClick={() => navigate('/apply-leave')}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Apply for Leave
        </button>
      </div>

      {/* Year Selector */}
      <div className="mb-6">
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

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Allocated</p>
          <p className="text-3xl font-bold text-gray-900">{totalAllocated}</p>
          <p className="text-xs text-gray-500 mt-1">days per year</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Used</p>
          <p className="text-3xl font-bold text-red-600">{totalUsed}</p>
          <p className="text-xs text-gray-500 mt-1">days used</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Available</p>
          <p className="text-3xl font-bold text-green-600">{totalAvailable}</p>
          <p className="text-xs text-gray-500 mt-1">days remaining</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Applications</p>
          <p className="text-3xl font-bold text-indigo-600">{applications.length}</p>
          <p className="text-xs text-gray-500 mt-1">this year</p>
        </div>
      </div>

      {/* Detailed Leave Balance */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Leave Balance Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {balances.map((balance) => (
                <tr key={balance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{balance.leave_type_name}</div>
                    <div className="text-sm text-gray-500">{balance.code}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{balance.allocated}</td>
                  <td className="px-6 py-4 text-red-600 font-semibold">{balance.used}</td>
                  <td className="px-6 py-4 text-yellow-600">{balance.pending}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold text-lg">{balance.available}</td>
                  <td className="px-6 py-4">
                    {balance.is_paid ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✓ Paid</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">⚠️ Unpaid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Applications */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
          
          {/* Filter */}
          <div className="flex space-x-2">
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
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leave applications found</p>
            <button
              onClick={() => navigate('/apply-leave')}
              className="mt-4 text-indigo-600 hover:text-indigo-800"
            >
              Apply for your first leave
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.leave_type_name}
                      </h3>
                      {getStatusBadge(application.status)}
                      {!application.is_paid && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          ⚠️ Affects Salary
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600">Application No.</p>
                        <p className="font-mono font-semibold">{application.application_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold">{application.total_days} day(s)</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">From</p>
                        <p className="font-semibold">{new Date(application.start_date).toLocaleDateString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">To</p>
                        <p className="font-semibold">{new Date(application.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-gray-600 text-sm">Reason:</p>
                      <p className="text-gray-900">{application.reason}</p>
                    </div>
                    
                    {application.review_comments && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600">Admin Comment:</p>
                        <p className="text-sm text-gray-900">{application.review_comments}</p>
                        {application.reviewed_by_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            By {application.reviewed_by_name} on {new Date(application.reviewed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {application.status === 'pending' && (
                      <button
                        onClick={() => handleCancelApplication(application.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeaves;

