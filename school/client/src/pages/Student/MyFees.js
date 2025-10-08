import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const MyFees = () => {
  const { user } = useAuth();
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyFees();
  }, []);

  const fetchMyFees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/fees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFeeData(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      setError('Failed to fetch fee information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (paymentId) => {
    alert('Payment gateway integration will be implemented');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const totalFees = feeData?.total_fees || 50000;
  const paidAmount = feeData?.paid_amount || 30000;
  const pendingAmount = totalFees - paidAmount;
  const paymentHistory = feeData?.payment_history || [];
  const upcomingPayments = feeData?.upcoming_payments || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CurrencyDollarIcon className="w-8 h-8 mr-2 text-indigo-600" />
          My Fees
        </h1>
        <p className="text-gray-600 mt-2">View fee structure and payment history</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Fee Summary */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Fee Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-indigo-100 text-sm">Total Annual Fees</p>
            <p className="text-3xl font-bold">₹{totalFees.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Paid Amount</p>
            <p className="text-3xl font-bold text-green-300">₹{paidAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Pending Amount</p>
            <p className="text-3xl font-bold text-yellow-300">₹{pendingAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-white bg-opacity-20 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-green-400 h-full transition-all duration-500"
              style={{ width: `${(paidAmount / totalFees) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm mt-2">
            {((paidAmount / totalFees) * 100).toFixed(1)}% paid
          </p>
        </div>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
          <div className="flex items-start">
            <ClockIcon className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">Upcoming Payments</h3>
              {upcomingPayments.map((payment, index) => (
                <div key={index} className="mb-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-yellow-900">{payment.description || 'Term Fee'}</p>
                    <p className="text-sm text-yellow-700">Due: {payment.due_date || 'Oct 15, 2024'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-yellow-900">₹{payment.amount?.toLocaleString() || '20,000'}</p>
                    <button
                      onClick={() => handlePayNow(payment.id)}
                      className="mt-2 px-4 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No payment history available
                  </td>
                </tr>
              ) : (
                paymentHistory.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.description || 'Tuition Fee'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{payment.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center text-sm">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">Paid</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <DocumentArrowDownIcon className="w-5 h-5 mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Structure Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Tuition Fee</span>
            <span className="font-semibold">₹35,000</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Development Fee</span>
            <span className="font-semibold">₹5,000</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Lab Fee</span>
            <span className="font-semibold">₹3,000</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Library Fee</span>
            <span className="font-semibold">₹2,000</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Sports Fee</span>
            <span className="font-semibold">₹3,000</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Misc. Charges</span>
            <span className="font-semibold">₹2,000</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t-2 flex justify-between text-lg font-bold">
          <span>Total Annual Fee</span>
          <span className="text-indigo-600">₹{totalFees.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default MyFees;
