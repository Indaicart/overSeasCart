import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LeaveManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [initializingBalances, setInitializingBalances] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState({
    name: '',
    code: '',
    description: '',
    annual_quota: 12,
    is_paid: true,
    requires_approval: true,
    allow_half_day: true,
    can_carry_forward: false,
    max_carry_forward_days: 0,
    min_days_notice: 1,
    display_order: 0
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/leaves/types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLeaveTypes(result.data);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
      toast.error('Failed to load leave types');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeaveType = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/leaves/types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLeaveType)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Leave type created successfully');
        setShowAddModal(false);
        setNewLeaveType({
          name: '',
          code: '',
          description: '',
          annual_quota: 12,
          is_paid: true,
          requires_approval: true,
          allow_half_day: true,
          can_carry_forward: false,
          max_carry_forward_days: 0,
          min_days_notice: 1,
          display_order: 0
        });
        fetchLeaveTypes();
      } else {
        toast.error(result.message || 'Failed to create leave type');
      }
    } catch (error) {
      console.error('Error creating leave type:', error);
      toast.error('Failed to create leave type');
    }
  };

  const handleInitializeBalances = async () => {
    if (!window.confirm('This will initialize leave balances for all active staff members. Continue?')) {
      return;
    }
    
    try {
      setInitializingBalances(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/leaves/balance/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ year: new Date().getFullYear() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Failed to initialize balances');
      }
    } catch (error) {
      console.error('Error initializing balances:', error);
      toast.error('Failed to initialize leave balances');
    } finally {
      setInitializingBalances(false);
    }
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Leave Management
        </h1>
        <p className="text-gray-600 mt-1">Configure leave types and manage staff leave applications</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <button
          onClick={() => navigate('/leave-approvals')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">→</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Leave Approvals</h3>
          <p className="text-sm text-gray-600 mt-1">Review and approve pending leave requests</p>
        </button>

        <button
          onClick={() => navigate('/leave-calendar')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <CalendarIcon className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">→</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Leave Calendar</h3>
          <p className="text-sm text-gray-600 mt-1">View staff leaves on calendar</p>
        </button>

        <button
          onClick={handleInitializeBalances}
          disabled={initializingBalances}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left disabled:opacity-50"
        >
          <div className="flex items-center justify-between mb-2">
            <UserGroupIcon className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">⚙️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Initialize Balances</h3>
          <p className="text-sm text-gray-600 mt-1">
            {initializingBalances ? 'Initializing...' : 'Setup leave balances for all staff'}
          </p>
        </button>
      </div>

      {/* Leave Types */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Leave Types</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Leave Type
          </button>
        </div>

        {leaveTypes.length === 0 ? (
          <div className="p-12 text-center">
            <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leave types configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-800"
            >
              Add your first leave type
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Quota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaveTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{type.name}</div>
                        {type.description && (
                          <div className="text-sm text-gray-500">{type.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-mono rounded">
                        {type.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {type.annual_quota} days
                    </td>
                    <td className="px-6 py-4">
                      {type.is_paid ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          ✓ Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          ⚠️ Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {type.allow_half_day && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Half Day
                          </span>
                        )}
                        {type.can_carry_forward && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            Carry Forward
                          </span>
                        )}
                        {type.requires_approval && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Approval Req.
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Leave Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddLeaveType}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Add Leave Type</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newLeaveType.name}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Casual Leave"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newLeaveType.code}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, code: e.target.value.toUpperCase() })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="CL"
                      maxLength="10"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newLeaveType.description}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, description: e.target.value })}
                      rows="2"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Brief description of this leave type"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Quota (days)
                    </label>
                    <input
                      type="number"
                      value={newLeaveType.annual_quota}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, annual_quota: parseInt(e.target.value) })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min. Days Notice
                    </label>
                    <input
                      type="number"
                      value={newLeaveType.min_days_notice}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, min_days_notice: parseInt(e.target.value) })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Carry Forward Days
                    </label>
                    <input
                      type="number"
                      value={newLeaveType.max_carry_forward_days}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, max_carry_forward_days: parseInt(e.target.value) })}
                      disabled={!newLeaveType.can_carry_forward}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={newLeaveType.display_order}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, display_order: parseInt(e.target.value) })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newLeaveType.is_paid}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, is_paid: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Paid leave (won't affect salary)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newLeaveType.requires_approval}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, requires_approval: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Requires admin approval
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newLeaveType.allow_half_day}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, allow_half_day: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Allow half-day leaves
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newLeaveType.can_carry_forward}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, can_carry_forward: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Can carry forward to next year
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Leave Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;

