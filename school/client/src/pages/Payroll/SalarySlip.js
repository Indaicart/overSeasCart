import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SalarySlip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [slip, setSlip] = useState(null);

  useEffect(() => {
    fetchSlip();
  }, [id]);

  const fetchSlip = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payroll/salary-slip/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setSlip(result.data);
      } else {
        toast.error('Salary slip not found');
        navigate('/payroll');
      }
    } catch (error) {
      console.error('Error fetching slip:', error);
      toast.error('Failed to load salary slip');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    const convert = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand ' + convert(n % 1000);
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh ' + convert(n % 100000);
      return convert(Math.floor(n / 10000000)) + ' Crore ' + convert(n % 10000000);
    };
    
    return convert(Math.floor(num)).trim() + ' Rupees Only';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading salary slip...</p>
        </div>
      </div>
    );
  }

  if (!slip) return null;

  const breakdown = slip.salary_breakdown || { earnings: {}, deductions: {}, attendance: {} };

  return (
    <div className="p-6">
      {/* Action Buttons (Hide on print) */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate(`/payroll/payment-history/${slip.teacher_id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to History
        </button>
        
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PrinterIcon className="w-5 h-5 mr-2" />
          Print Slip
        </button>
      </div>

      {/* Salary Slip */}
      <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{slip.school_name}</h1>
          {slip.school_address && (
            <p className="text-sm text-gray-600 mt-2">{slip.school_address}</p>
          )}
          <h2 className="text-xl font-semibold text-indigo-600 mt-4">SALARY SLIP</h2>
          <p className="text-sm text-gray-600 mt-1">
            {slip.month_name} {slip.payment_year}
          </p>
        </div>

        {/* Employee Details */}
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Employee Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{slip.first_name} {slip.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Employee ID:</span>
                <span className="font-medium">EMP-{slip.employee_id}</span>
              </div>
              {slip.designation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Designation:</span>
                  <span className="font-medium">{slip.designation}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Joining:</span>
                <span className="font-medium">{new Date(slip.date_of_joining).toLocaleDateString()}</span>
              </div>
              {slip.pan_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">PAN:</span>
                  <span className="font-medium font-mono">{slip.pan_number}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Payment Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Slip Number:</span>
                <span className="font-medium font-mono">{slip.slip_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-medium">{new Date(slip.payment_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{slip.payment_method === 'offline_cash' ? 'Cash' : 'Bank Transfer'}</span>
              </div>
              {slip.payment_method === 'online_transfer' && slip.bank_name && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">{slip.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium font-mono">XXXX{slip.account_number?.slice(-4)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Attendance */}
        {breakdown.attendance && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Attendance Summary:</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-600">Working Days</p>
                <p className="text-2xl font-bold text-gray-900">{breakdown.attendance.working_days || slip.working_days}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-green-600">{breakdown.attendance.present_days || slip.present_days}</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="text-gray-600">Leave Days</p>
                <p className="text-2xl font-bold text-red-600">{breakdown.attendance.leave_days || slip.leave_days}</p>
              </div>
            </div>
          </div>
        )}

        {/* Salary Breakdown */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 font-semibold text-gray-900">Earnings</th>
                <th className="text-right py-2 font-semibold text-gray-900">Amount (₹)</th>
                <th className="text-left py-2 font-semibold text-gray-900 pl-8">Deductions</th>
                <th className="text-right py-2 font-semibold text-gray-900">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Basic Salary</td>
                <td className="py-2 text-right">{breakdown.earnings?.basic_salary?.toLocaleString() || '-'}</td>
                <td className="py-2 text-gray-700 pl-8">PF</td>
                <td className="py-2 text-right">{breakdown.deductions?.pf?.toLocaleString() || '-'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">HRA</td>
                <td className="py-2 text-right">{breakdown.earnings?.hra?.toLocaleString() || '-'}</td>
                <td className="py-2 text-gray-700 pl-8">ESI</td>
                <td className="py-2 text-right">{breakdown.deductions?.esi?.toLocaleString() || '-'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">DA</td>
                <td className="py-2 text-right">{breakdown.earnings?.da?.toLocaleString() || '-'}</td>
                <td className="py-2 text-gray-700 pl-8">Professional Tax</td>
                <td className="py-2 text-right">{breakdown.deductions?.professional_tax?.toLocaleString() || '-'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">TA</td>
                <td className="py-2 text-right">{breakdown.earnings?.ta?.toLocaleString() || '-'}</td>
                <td className="py-2 text-gray-700 pl-8">TDS</td>
                <td className="py-2 text-right">{breakdown.deductions?.tds?.toLocaleString() || '-'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Medical Allowance</td>
                <td className="py-2 text-right">{breakdown.earnings?.medical_allowance?.toLocaleString() || '-'}</td>
                <td className="py-2 text-gray-700 pl-8">Other Deductions</td>
                <td className="py-2 text-right">{breakdown.deductions?.other_deductions?.toLocaleString() || '-'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Other Allowances</td>
                <td className="py-2 text-right">{breakdown.earnings?.other_allowances?.toLocaleString() || '-'}</td>
                <td className="py-2 text-gray-700 pl-8">Penalty</td>
                <td className="py-2 text-right">{breakdown.deductions?.penalty?.toLocaleString() || '-'}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-green-700 font-medium">Bonus</td>
                <td className="py-2 text-right text-green-700 font-medium">{breakdown.earnings?.bonus?.toLocaleString() || '-'}</td>
                <td className="py-2 pl-8"></td>
                <td className="py-2 text-right"></td>
              </tr>
              <tr className="border-t-2 border-gray-300 font-semibold">
                <td className="py-3 text-gray-900">Total Earnings</td>
                <td className="py-3 text-right text-gray-900">{breakdown.earnings?.total?.toLocaleString() || slip.gross_amount.toLocaleString()}</td>
                <td className="py-3 text-gray-900 pl-8">Total Deductions</td>
                <td className="py-3 text-right text-gray-900">{breakdown.deductions?.total?.toLocaleString() || slip.deductions.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Net Salary */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-indigo-900 font-semibold text-lg">Net Salary</p>
              <p className="text-indigo-700 text-sm mt-1">{numberToWords(slip.net_amount)}</p>
            </div>
            <p className="text-4xl font-bold text-indigo-600">₹{parseFloat(slip.net_amount).toLocaleString()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
          <p>This is a computer-generated salary slip and does not require a physical signature.</p>
          <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
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
          .bg-white {
            visibility: visible;
          }
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

export default SalarySlip;

