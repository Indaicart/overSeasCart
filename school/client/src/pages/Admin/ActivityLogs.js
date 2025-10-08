import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    startDate: '',
    endDate: ''
  });

  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`http://localhost:5000/api/activity-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setLogs(result.data.logs);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.message || 'Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );

      const response = await fetch(`http://localhost:5000/api/activity-logs/summary?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setSummary(result.data);
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('Are you sure you want to delete activity logs older than 90 days?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/activity-logs/cleanup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ days: 90 })
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(`Deleted ${result.data.deleted} old logs`);
        fetchLogs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to cleanup logs');
      }
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      setError('Failed to cleanup logs');
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'login': return 'bg-purple-100 text-purple-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ClockIcon className="w-8 h-8 mr-2 text-indigo-600" />
            Activity Logs
          </h1>
          <p className="text-gray-600 mt-2">
            Track all user activities and system events
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSummary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <ChartBarIcon className="w-5 h-5 mr-2" />
            View Summary
          </button>
          <button
            onClick={handleCleanup}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Cleanup Old Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && summary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-600 text-sm font-medium">Total Logs</p>
                  <p className="text-3xl font-bold text-blue-900">{summary.totalLogs}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 text-sm font-medium">Actions</p>
                  <p className="text-3xl font-bold text-green-900">{summary.actionCounts.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-600 text-sm font-medium">Resources</p>
                  <p className="text-3xl font-bold text-purple-900">{summary.resourceCounts.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Top Actions</h3>
                  <div className="space-y-2">
                    {summary.actionCounts.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm capitalize">{item.action}</span>
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Top Resources</h3>
                  <div className="space-y-2">
                    {summary.resourceCounts.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm capitalize">{item.resource_type}</span>
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Most Active Users</h3>
                <div className="space-y-2">
                  {summary.topUsers.slice(0, 5).map((user, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className="text-sm font-semibold">{user.activity_count} activities</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSummary(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FunnelIcon className="w-5 h-5 mr-2 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
            <select
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Resources</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="attendance">Attendance</option>
              <option value="grade">Grade</option>
              <option value="fee">Fee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No activity logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                      <div className="text-sm text-gray-500">{log.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {log.resource_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
