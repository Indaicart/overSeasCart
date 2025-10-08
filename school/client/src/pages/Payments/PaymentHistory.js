import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState({
    status: searchParams.get('status') || 'all',
    payment_type: searchParams.get('payment_type') || 'all'
  });

  useEffect(() => {
    fetchPaymentHistory();
  }, [filter]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams();
      if (filter.status !== 'all') queryParams.append('status', filter.status);
      if (filter.payment_type !== 'all') queryParams.append('payment_type', filter.payment_type);
      
      const response = await fetch(`http://localhost:5000/api/payments/history?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPayments(result.data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'refunded':
        return <ArrowPathIcon className="w-6 h-6 text-yellow-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewReceipt = (paymentId) => {
    navigate(`/payment-receipt/${paymentId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ClockIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Payment History
        </h1>
        <p className="text-gray-600 mt-1">View all your payment transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <select
              value={filter.payment_type}
              onChange={(e) => setFilter({ ...filter, payment_type: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="student_fee">Student Fee</option>
              <option value="admission_fee">Admission Fee</option>
              <option value="school_subscription">School Subscription</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h2>
          <p className="text-gray-600">You haven't made any payments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div className="mr-4">
                      {getStatusIcon(payment.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {payment.payment_type.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receipt: {payment.receipt_number}
                      </p>
                      {payment.description && (
                        <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{payment.currency}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {payment.payment_method ? 
                        payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1) 
                        : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Payment Date</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {payment.payment_date ? formatDate(payment.payment_date) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Transaction ID</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                      {payment.razorpay_payment_id || 'N/A'}
                    </p>
                  </div>
                </div>

                {payment.status === 'refunded' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Refunded:</strong> ₹{payment.refund_amount?.toLocaleString()} on {formatDate(payment.refund_date)}
                    </p>
                    {payment.refund_reason && (
                      <p className="text-xs text-yellow-700 mt-1">Reason: {payment.refund_reason}</p>
                    )}
                  </div>
                )}

                {payment.status === 'failed' && payment.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {payment.error_message}
                    </p>
                  </div>
                )}

                {payment.status === 'success' && (
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={() => viewReceipt(payment.id)}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      View Receipt
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

