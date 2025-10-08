import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  PrinterIcon, 
  ArrowDownTrayIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/payments/receipt/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReceipt(result.data);
      } else {
        toast.error('Receipt not found');
        navigate('/payment-history');
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      toast.error('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return null;
  }

  const { receipt: payment, school, payer, student } = receipt;
  const breakdown = payment.metadata?.breakdown || {};

  return (
    <div className="p-6">
      {/* Action Buttons (Hide on print) */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate('/payment-history')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to History
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <PrinterIcon className="w-5 h-5 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Receipt */}
      <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-green-100">Your payment has been processed successfully</p>
        </div>

        {/* Receipt Content */}
        <div className="p-8">
          {/* School Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{school.name}</h2>
            {school.address && (
              <p className="text-sm text-gray-600">{school.address}</p>
            )}
            <p className="text-lg font-semibold text-indigo-600 mt-4">PAYMENT RECEIPT</p>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Receipt Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Receipt Number</p>
                  <p className="font-semibold text-gray-900">{payment.receipt_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Payment Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(payment.payment_date || payment.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Transaction ID</p>
                  <p className="font-mono text-xs text-gray-900 break-all">
                    {payment.razorpay_payment_id}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Payer Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{payer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{payer.email}</p>
                </div>
                {student && (
                  <div>
                    <p className="text-xs text-gray-600">Student</p>
                    <p className="font-semibold text-gray-900">
                      {student.name} (Roll: {student.roll_number})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Payment Type:</span>
                <span className="font-semibold text-gray-900">
                  {payment.payment_type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </div>
              {payment.description && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Description:</span>
                  <span className="font-semibold text-gray-900">{payment.description}</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Payment Method:</span>
                <span className="font-semibold text-gray-900">
                  {payment.payment_method ? 
                    payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1) 
                    : 'Online Payment'}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Amount Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {breakdown.baseAmount && (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Base Amount:</span>
                    <span className="font-semibold text-gray-900">
                      ₹{breakdown.baseAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Tax ({breakdown.taxPercent}%):</span>
                    <span className="font-semibold text-gray-900">
                      ₹{breakdown.taxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 my-3"></div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total Amount Paid:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{payment.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                This is a computer-generated receipt and does not require a signature.
              </p>
              <p className="text-xs text-gray-500">
                For any queries, please contact the school administration.
              </p>
            </div>
            
            {/* Powered by Razorpay */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                🔒 Secure payment powered by <strong>Razorpay</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-white,
          .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentReceipt;

