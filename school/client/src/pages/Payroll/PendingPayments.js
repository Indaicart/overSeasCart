import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, XCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PendingPayments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPendingPayments();
  }, [month, year]);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payroll/pending-payments?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (teacherId) => {
    navigate(`/payroll/process-payment/${teacherId}`, {
      state: { month, year }
    });
  };

  const handleViewSlip = (paymentId) => {
    navigate(`/payroll/salary-slip/${paymentId}`);
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

  const pendingCount = data?.payments.filter(p => p.is_pending).length || 0;
  const paidCount = data?.payments.filter(p => !p.is_pending).length || 0;
  const totalAmount = data?.payments.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0) || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ClockIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Pending Salary Payments
        </h1>
        <p className="text-gray-600 mt-1">{data?.month_name} {data?.year}</p>
      </div>

      {/* Month/Year Selector */}
      <div className="mb-6 flex items-center space-x-4">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>
              {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 font-semibold">Pending Payments</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-900 font-semibold">Paid</p>
          <p className="text-3xl font-bold text-green-600">{paidCount}</p>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-indigo-900 font-semibold">Total Amount</p>
          <p className="text-3xl font-bold text-indigo-600">₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.payments.map((payment) => (
                <tr key={payment.teacher_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{payment.first_name} {payment.last_name}</p>
                      <p className="text-sm text-gray-500">EMP-{payment.employee_id}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">₹{parseFloat(payment.net_salary).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Net salary</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {payment.is_pending ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center w-fit">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Pending
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center w-fit">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        {payment.payment_status === 'partial' ? 'Partial' : 'Paid'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    {payment.has_bank_details ? (
                      <div className="text-sm">
                        <p className="text-gray-900">{payment.bank_name}</p>
                        <p className="text-gray-500">XXXX{payment.account_number?.slice(-4)}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-red-600 flex items-center">
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Not configured
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    {payment.is_pending ? (
                      <button
                        onClick={() => handlePayNow(payment.teacher_id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewSlip(payment.payment_id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                      >
                        View Slip
                      </button>
                    )}
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

export default PendingPayments;

