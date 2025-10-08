import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClockIcon, ArrowLeftIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentHistory = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch teacher
      const teacherResponse = await fetch(`http://localhost:5000/api/teachers/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const teacherResult = await teacherResponse.json();
      if (teacherResult.success) {
        setTeacher(teacherResult.data);
      }
      
      // Fetch payment history
      const paymentsResponse = await fetch(`http://localhost:5000/api/payroll/payment-history/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const paymentsResult = await paymentsResponse.json();
      if (paymentsResult.success) {
        setPayments(paymentsResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    const icons = {
      paid: CheckCircleIcon,
      partial: ClockIcon,
      pending: ClockIcon,
      failed: XCircleIcon
    };
    
    const Icon = icons[status] || ClockIcon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]} flex items-center w-fit`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.payment_status === filter);

  const totalPaid = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.paid_amount || 0), 0);

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
        <button
          onClick={() => navigate('/payroll')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Staff List
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ClockIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Payment History
        </h1>
        {teacher && (
          <p className="text-gray-600 mt-1">
            {teacher.first_name} {teacher.last_name} • EMP-{teacher.employee_id}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Paid</p>
          <p className="text-3xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Paid Count</p>
          <p className="text-3xl font-bold text-indigo-600">
            {payments.filter(p => p.payment_status === 'paid').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex space-x-2">
        {['all', 'paid', 'partial', 'pending'].map((status) => (
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

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No payments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {payment.month_name} {payment.payment_year}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Slip: {payment.slip_number}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{parseFloat(payment.net_amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Net Amount</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Gross Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{parseFloat(payment.gross_amount).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Deductions</p>
                    <p className="text-sm font-semibold text-red-600">
                      ₹{parseFloat(payment.deductions).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Paid Amount</p>
                    <p className="text-sm font-semibold text-green-600">
                      ₹{parseFloat(payment.paid_amount).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(payment.payment_status)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Method: {payment.payment_method === 'offline_cash' ? '💵 Cash' : '💳 Online'}</span>
                    {payment.payment_date && (
                      <span>Paid: {new Date(payment.payment_date).toLocaleDateString()}</span>
                    )}
                    {payment.paid_by_name && (
                      <span>By: {payment.paid_by_name}</span>
                    )}
                  </div>
                  
                  {payment.payment_status === 'paid' && (
                    <button
                      onClick={() => navigate(`/payroll/salary-slip/${payment.id}`)}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      View Slip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

