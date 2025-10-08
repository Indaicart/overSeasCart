import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const StaffSalaryList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payroll/staff-list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setStaff(result.data);
      }
    } catch (error) {
      console.error('Error fetching staff list:', error);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureSalary = (teacherId) => {
    navigate(`/payroll/configure/${teacherId}`);
  };

  const handleProcessPayment = (teacherId) => {
    navigate(`/payroll/process-payment/${teacherId}`);
  };

  const handleViewPayments = (teacherId) => {
    navigate(`/payroll/payment-history/${teacherId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="w-8 h-8 mr-2 text-indigo-600" />
            HR & Payroll Management
          </h1>
          <p className="text-gray-600 mt-1">Manage staff salaries and process payments</p>
        </div>
        
        <button
          onClick={() => navigate('/payroll/pending-payments')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Process Payments
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">Total Staff</p>
          <p className="text-3xl font-bold mt-1">{staff.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">Salary Configured</p>
          <p className="text-3xl font-bold mt-1">
            {staff.filter(s => s.salary_configured).length}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-yellow-100 text-sm">Payments Made</p>
          <p className="text-3xl font-bold mt-1">
            {staff.reduce((sum, s) => sum + parseInt(s.payments_made || 0), 0)}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm">Total Monthly Salary</p>
          <p className="text-3xl font-bold mt-1">
            ₹{staff.reduce((sum, s) => sum + parseFloat(s.net_salary || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Staff Members</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-500">EMP-{member.employee_id}</p>
                      <p className="text-xs text-gray-400">
                        Joined: {new Date(member.date_of_joining).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <p className="text-gray-900">{member.email}</p>
                      <p className="text-gray-500">{member.phone}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.salary_configured ? (
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{parseFloat(member.net_salary).toLocaleString()}/mo
                        </p>
                        <p className="text-xs text-gray-500">
                          Gross: ₹{parseFloat(member.gross_salary).toLocaleString()}
                        </p>
                        {member.bank_name && (
                          <p className="text-xs text-blue-600">{member.bank_name}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not configured</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.salary_configured ? (
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-700">Configured</p>
                          <p className="text-xs text-gray-500">
                            {member.payments_made} payments made
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-sm text-red-700">Not configured</span>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleConfigureSalary(member.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Configure Salary"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      
                      {member.salary_configured && (
                        <>
                          <button
                            onClick={() => handleProcessPayment(member.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Process Payment"
                          >
                            <CurrencyDollarIcon className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleViewPayments(member.id)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                          >
                            History
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffSalaryList;

