import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    day_type: 'full_day',
    reason: '',
    contact_during_leave: '',
    is_emergency: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch leave types
      const typesResponse = await fetch('http://localhost:5000/api/leaves/types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const typesResult = await typesResponse.json();
      if (typesResult.success) {
        setLeaveTypes(typesResult.data);
      }
      
      // Fetch balances
      const balancesResponse = await fetch('http://localhost:5000/api/leaves/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const balancesResult = await balancesResponse.json();
      if (balancesResult.success) {
        setBalances(balancesResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    
    if (end < start) return 0;
    
    if (formData.day_type === 'first_half' || formData.day_type === 'second_half') {
      return 0.5;
    }
    
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const getSelectedBalance = () => {
    if (!formData.leave_type_id) return null;
    return balances.find(b => b.leave_type_id === parseInt(formData.leave_type_id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const totalDays = calculateDays();
    if (totalDays <= 0) {
      toast.error('Invalid date range');
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/leaves/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Leave application submitted successfully!');
        navigate('/my-leaves');
      } else {
        toast.error(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error('Failed to submit leave application');
    } finally {
      setSubmitting(false);
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

  const totalDays = calculateDays();
  const selectedBalance = getSelectedBalance();
  const selectedLeaveType = leaveTypes.find(lt => lt.id === parseInt(formData.leave_type_id));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/my-leaves')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to My Leaves
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <DocumentTextIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Apply for Leave
        </h1>
        <p className="text-gray-600 mt-1">Submit a new leave application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="leave_type_id"
                  value={formData.leave_type_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.code}) - {type.is_paid ? '✓ Paid' : '⚠️ Unpaid'}
                    </option>
                  ))}
                </select>
                {selectedLeaveType && (
                  <p className="mt-1 text-sm text-gray-500">{selectedLeaveType.description}</p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Day Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day Type
                </label>
                <select
                  name="day_type"
                  value={formData.day_type}
                  onChange={handleChange}
                  disabled={!selectedLeaveType?.allow_half_day}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="full_day">Full Day</option>
                  {selectedLeaveType?.allow_half_day && (
                    <>
                      <option value="first_half">First Half</option>
                      <option value="second_half">Second Half</option>
                    </>
                  )}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Please provide a brief reason for your leave..."
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number During Leave
                </label>
                <input
                  type="tel"
                  name="contact_during_leave"
                  value={formData.contact_during_leave}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="9876543210"
                />
              </div>

              {/* Emergency Leave */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_emergency"
                  checked={formData.is_emergency}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  This is an emergency leave
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/my-leaves')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 rounded-lg text-white font-medium ${
                  submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Summary & Balance */}
        <div className="lg:col-span-1">
          {/* Leave Summary */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-6">
            <h2 className="text-lg font-semibold mb-4">Leave Summary</h2>
            
            {formData.start_date && formData.end_date ? (
              <div className="space-y-3">
                <div>
                  <p className="text-indigo-100 text-sm">Total Days</p>
                  <p className="text-3xl font-bold">{totalDays}</p>
                </div>
                
                <div className="pt-3 border-t border-indigo-400">
                  <p className="text-indigo-100 text-sm">From</p>
                  <p className="font-semibold">{new Date(formData.start_date).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <p className="text-indigo-100 text-sm">To</p>
                  <p className="font-semibold">{new Date(formData.end_date).toLocaleDateString()}</p>
                </div>
                
                {selectedLeaveType && (
                  <div className="pt-3 border-t border-indigo-400">
                    <p className="text-indigo-100 text-sm">Type</p>
                    <p className="font-semibold">{selectedLeaveType.name}</p>
                    {!selectedLeaveType.is_paid && (
                      <p className="text-yellow-200 text-xs mt-1 flex items-center">
                        ⚠️ Unpaid - Will affect salary
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-indigo-100 text-sm">Select dates to see summary</p>
            )}
          </div>

          {/* Leave Balance */}
          {selectedBalance && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Balance</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Allocated:</span>
                  <span className="font-semibold">{selectedBalance.allocated} days</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-semibold text-red-600">{selectedBalance.used} days</span>
                </div>
                
                {selectedBalance.pending > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-semibold text-yellow-600">{selectedBalance.pending} days</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-semibold">Available:</span>
                    <span className="text-xl font-bold text-green-600">{selectedBalance.available} days</span>
                  </div>
                </div>
                
                {totalDays > selectedBalance.available && selectedLeaveType?.is_paid && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      ⚠️ Insufficient balance! You have only {selectedBalance.available} days available.
                    </p>
                  </div>
                )}
                
                {selectedBalance.carried_forward > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      ℹ️ {selectedBalance.carried_forward} days carried forward from last year
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;

