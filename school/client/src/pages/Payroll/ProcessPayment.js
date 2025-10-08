import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProcessPayment = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [salary, setSalary] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('offline');
  const [formData, setFormData] = useState({
    payment_month: new Date().getMonth() + 1,
    payment_year: new Date().getFullYear(),
    working_days: 26,
    present_days: 26,
    leave_days: 0,
    bonus: 0,
    penalty: 0,
    paid_amount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
    loadRazorpayScript();
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
      
      // Fetch salary config
      const salaryResponse = await fetch(`http://localhost:5000/api/payroll/salary-config/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const salaryResult = await salaryResponse.json();
      if (salaryResult.success) {
        setSalary(salaryResult.data);
        setFormData(prev => ({ ...prev, paid_amount: salaryResult.data.net_salary }));
      } else {
        toast.error('Salary not configured for this staff');
        navigate('/payroll');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const calculateNetAmount = () => {
    if (!salary) return 0;
    
    const { working_days, present_days, bonus, penalty } = formData;
    let netAmount = salary.net_salary;
    
    // Pro-rate if present days < working days
    if (working_days > 0 && present_days < working_days) {
      netAmount = (netAmount / working_days) * present_days;
    }
    
    // Add bonus, subtract penalty
    netAmount = netAmount + parseFloat(bonus) - parseFloat(penalty);
    
    return Math.max(0, netAmount);
  };

  const handleOfflinePayment = async () => {
    if (formData.paid_amount <= 0) {
      toast.error('Please enter paid amount');
      return;
    }
    
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/payroll/process-offline-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacher_id: parseInt(teacherId),
          ...formData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        navigate(`/payroll/payment-history/${teacherId}`);
      } else {
        toast.error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Offline payment error:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!salary.bank_name || !salary.account_number) {
      toast.error('Bank details not configured for this staff member');
      return;
    }
    
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      // Step 1: Initiate payment
      const orderResponse = await fetch('http://localhost:5000/api/payroll/initiate-online-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacher_id: parseInt(teacherId),
          payment_month: formData.payment_month,
          payment_year: formData.payment_year,
          working_days: formData.working_days,
          present_days: formData.present_days,
          leave_days: formData.leave_days,
          bonus: formData.bonus,
          penalty: formData.penalty
        })
      });
      
      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to initiate payment');
      }
      
      const orderData = orderResult.data;
      
      // Step 2: Open Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: 'INR',
        order_id: orderData.orderId,
        name: 'Salary Payment',
        description: `Salary for ${orderData.teacher.name}`,
        notes: {
          teacher_name: orderData.teacher.name,
          employee_id: orderData.teacher.employee_id,
          bank_name: orderData.bank_details.bank_name,
          account: orderData.bank_details.account_number
        },
        prefill: {
          name: orderData.teacher.name
        },
        theme: {
          color: '#4F46E5'
        },
        handler: async function(response) {
          // Step 3: Complete payment
          try {
            const completeResponse = await fetch('http://localhost:5000/api/payroll/complete-online-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                salary_payment_id: orderData.salaryPaymentId,
                razorpay_payment_id: response.razorpay_payment_id
              })
            });
            
            const completeResult = await completeResponse.json();
            
            if (completeResult.success) {
              toast.success('Salary paid successfully!');
              navigate(`/payroll/payment-history/${teacherId}`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Complete payment error:', error);
            toast.error('Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Online payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setProcessing(false);
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

  const netAmount = calculateNetAmount();
  const isPaidFull = formData.paid_amount >= netAmount;

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
          <CurrencyDollarIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Process Salary Payment
        </h1>
        {teacher && (
          <p className="text-gray-600 mt-1">
            {teacher.first_name} {teacher.last_name} • EMP-{teacher.employee_id}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Payment Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Period */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Period</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  name="payment_month"
                  value={formData.payment_month}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  name="payment_year"
                  value={formData.payment_year}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                <input
                  type="number"
                  name="working_days"
                  value={formData.working_days}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Present Days</label>
                <input
                  type="number"
                  name="present_days"
                  value={formData.present_days}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Days</label>
                <input
                  type="number"
                  name="leave_days"
                  value={formData.leave_days}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Bonus & Penalty */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjustments</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Bonus</label>
                <input
                  type="number"
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">Penalty</label>
                <input
                  type="number"
                  name="penalty"
                  value={formData.penalty}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('offline')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'offline'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BanknotesIcon className={`w-8 h-8 mx-auto mb-2 ${
                  paymentMethod === 'offline' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-gray-900">Offline Cash</p>
                <p className="text-xs text-gray-500 mt-1">Pay in cash/cheque</p>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'online'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className={`w-8 h-8 mx-auto mb-2 ${
                  paymentMethod === 'online' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-gray-900">Online Transfer</p>
                <p className="text-xs text-gray-500 mt-1">Pay via Razorpay</p>
              </button>
            </div>
          </div>

          {/* Offline Payment Fields */}
          {paymentMethod === 'offline' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Offline Payment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Paid <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="paid_amount"
                    value={formData.paid_amount}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder={netAmount.toFixed(2)}
                  />
                  {formData.paid_amount < netAmount && (
                    <p className="text-sm text-yellow-600 mt-1">
                      ⚠️ Partial payment: ₹{(netAmount - formData.paid_amount).toFixed(2)} remaining
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Payment notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Online Payment - Bank Details */}
          {paymentMethod === 'online' && salary && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h2>
              
              {salary.bank_name && salary.account_number ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-semibold">{salary.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-mono">XXXX{salary.account_number.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IFSC Code:</span>
                    <span className="font-mono">{salary.ifsc_code}</span>
                  </div>
                  {salary.account_holder_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Holder:</span>
                      <span className="font-semibold">{salary.account_holder_name}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-600">⚠️ Bank details not configured</p>
                  <button
                    onClick={() => navigate(`/payroll/configure/${teacherId}`)}
                    className="mt-2 text-indigo-600 hover:text-indigo-800"
                  >
                    Configure Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-100">Base Salary:</span>
                <span>₹{salary?.net_salary.toLocaleString()}</span>
              </div>
              
              {formData.present_days < formData.working_days && (
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-100">Pro-rated ({formData.present_days}/{formData.working_days} days):</span>
                  <span>₹{((salary?.net_salary / formData.working_days) * formData.present_days).toFixed(2)}</span>
                </div>
              )}
              
              {formData.bonus > 0 && (
                <div className="flex justify-between text-sm text-green-200">
                  <span>+ Bonus:</span>
                  <span>₹{formData.bonus.toLocaleString()}</span>
                </div>
              )}
              
              {formData.penalty > 0 && (
                <div className="flex justify-between text-sm text-red-200">
                  <span>- Penalty:</span>
                  <span>₹{formData.penalty.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t border-indigo-400 pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Net Amount:</span>
                  <span>₹{netAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {paymentMethod === 'offline' ? (
                <button
                  onClick={handleOfflinePayment}
                  disabled={processing}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    processing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {processing ? 'Processing...' : `Pay Cash: ₹${formData.paid_amount.toLocaleString()}`}
                </button>
              ) : (
                <button
                  onClick={handleOnlinePayment}
                  disabled={processing || !salary?.bank_name}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    processing || !salary?.bank_name
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {processing ? 'Processing...' : 'Pay via Razorpay'}
                </button>
              )}
              
              {isPaidFull && paymentMethod === 'offline' && (
                <div className="flex items-center justify-center text-green-200 text-sm">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Full payment
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessPayment;

