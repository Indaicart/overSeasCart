import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyDollarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FeePayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  useEffect(() => {
    fetchPendingFees();
    loadRazorpayScript();
  }, []);

  const fetchPendingFees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/fees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        // Filter fees with pending amounts
        const pendingFees = result.data.filter(fee => fee.total_amount > fee.paid_amount);
        setFees(pendingFees);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fees');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async (fee) => {
    setSelectedFee(fee);
    setPaymentInProgress(true);

    try {
      const token = localStorage.getItem('token');
      
      // Calculate pending amount
      const pendingAmount = fee.total_amount - fee.paid_amount;
      
      // Create Razorpay order
      const orderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: pendingAmount,
          currency: 'INR',
          payment_type: 'student_fee',
          description: `Fee payment for ${fee.fee_type} - ${fee.academic_year}`,
          student_id: fee.student_id,
          fee_id: fee.id,
          metadata: {
            fee_type: fee.fee_type,
            academic_year: fee.academic_year,
            due_date: fee.due_date
          }
        })
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      // Razorpay options
      const options = {
        key: orderResult.data.key,
        amount: orderResult.data.amount * 100, // Amount in paise
        currency: orderResult.data.currency,
        name: 'School Management System',
        description: `Fee payment for ${fee.fee_type}`,
        order_id: orderResult.data.orderId,
        handler: async function (response) {
          // Payment successful, verify it
          await verifyPayment(response);
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        notes: {
          student_id: fee.student_id,
          fee_id: fee.id
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            setPaymentInProgress(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
      setPaymentInProgress(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      
      const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature
        })
      });

      const verifyResult = await verifyResponse.json();

      if (verifyResult.success) {
        toast.success('Payment successful!');
        setPaymentInProgress(false);
        
        // Refresh fees list
        fetchPendingFees();
        
        // Navigate to receipt page
        setTimeout(() => {
          navigate(`/payment-receipt/${verifyResult.data.payment.id}`);
        }, 2000);
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Payment verification failed');
      setPaymentInProgress(false);
    }
  };

  const getPendingAmount = (fee) => {
    return fee.total_amount - fee.paid_amount;
  };

  const getPaymentStatus = (fee) => {
    if (fee.paid_amount === 0) return 'Unpaid';
    if (fee.paid_amount < fee.total_amount) return 'Partial';
    return 'Paid';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CurrencyDollarIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Fee Payment
        </h1>
        <p className="text-gray-600 mt-1">Pay your pending fees securely using Razorpay</p>
      </div>

      {/* Payment in Progress Overlay */}
      {paymentInProgress && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800 font-medium">Payment in progress... Please complete the payment.</p>
          </div>
        </div>
      )}

      {/* Pending Fees List */}
      {fees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h2>
          <p className="text-gray-600">You have no pending fee payments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {fees.map((fee) => {
            const pendingAmount = getPendingAmount(fee);
            const status = getPaymentStatus(fee);
            
            return (
              <div key={fee.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{fee.fee_type}</h3>
                      <p className="text-sm text-gray-600 mt-1">Academic Year: {fee.academic_year}</p>
                      {fee.due_date && (
                        <p className="text-sm text-gray-600">Due Date: {new Date(fee.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">₹{fee.total_amount.toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs text-green-600 mb-1">Paid Amount</p>
                      <p className="text-xl font-bold text-green-700">₹{fee.paid_amount.toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-xs text-red-600 mb-1">Pending Amount</p>
                      <p className="text-xl font-bold text-red-700">₹{pendingAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {fee.description && (
                    <p className="text-sm text-gray-600 mb-4">{fee.description}</p>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/payment-history?feeId=${fee.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      View Payment History
                    </button>
                    
                    <button
                      onClick={() => handlePayNow(fee)}
                      disabled={paymentInProgress}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        paymentInProgress
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {paymentInProgress ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💳 Accepted Payment Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-white rounded-lg p-3 mb-2">
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">Credit/Debit Card</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-3 mb-2">
              <span className="text-2xl">🏦</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">Net Banking</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-3 mb-2">
              <span className="text-2xl">📱</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">UPI</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-3 mb-2">
              <span className="text-2xl">👛</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">Wallets</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            🔒 Secure payments powered by <strong>Razorpay</strong> (Test Mode)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeePayment;

