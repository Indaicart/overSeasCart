import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CurrencyDollarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ConfigureSalary = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [formData, setFormData] = useState({
    basic_salary: '',
    hra: '',
    da: '',
    ta: '',
    medical_allowance: '',
    other_allowances: '',
    pf: '',
    esi: '',
    professional_tax: '',
    tds: '',
    other_deductions: '',
    payment_frequency: 'monthly',
    pay_day: 1,
    effective_from: new Date().toISOString().split('T')[0],
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    pan_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchTeacherAndSalary();
  }, [teacherId]);

  const fetchTeacherAndSalary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch teacher details
      const teacherResponse = await fetch(`http://localhost:5000/api/teachers/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const teacherResult = await teacherResponse.json();
      
      if (teacherResult.success) {
        setTeacher(teacherResult.data);
      }
      
      // Try to fetch existing salary config
      try {
        const salaryResponse = await fetch(`http://localhost:5000/api/payroll/salary-config/${teacherId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const salaryResult = await salaryResponse.json();
        
        if (salaryResult.success) {
          setFormData({
            ...salaryResult.data,
            effective_from: new Date(salaryResult.data.effective_from).toISOString().split('T')[0]
          });
        }
      } catch (error) {
        // No existing config, use defaults
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateGrossSalary = () => {
    const earnings = [
      'basic_salary', 'hra', 'da', 'ta', 'medical_allowance', 'other_allowances'
    ];
    return earnings.reduce((sum, key) => sum + parseFloat(formData[key] || 0), 0);
  };

  const calculateDeductions = () => {
    const deductions = [
      'pf', 'esi', 'professional_tax', 'tds', 'other_deductions'
    ];
    return deductions.reduce((sum, key) => sum + parseFloat(formData[key] || 0), 0);
  };

  const calculateNetSalary = () => {
    return calculateGrossSalary() - calculateDeductions();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.basic_salary) {
      toast.error('Basic salary is required');
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/payroll/salary-config', {
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
        toast.success('Salary configured successfully!');
        navigate('/payroll');
      } else {
        toast.error(result.message || 'Failed to configure salary');
      }
    } catch (error) {
      console.error('Error saving salary:', error);
      toast.error('Failed to save salary configuration');
    } finally {
      setSaving(false);
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

  const grossSalary = calculateGrossSalary();
  const totalDeductions = calculateDeductions();
  const netSalary = calculateNetSalary();

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
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 mr-2 text-indigo-600" />
              Configure Salary
            </h1>
            {teacher && (
              <p className="text-gray-600 mt-1">
                {teacher.first_name} {teacher.last_name} • EMP-{teacher.employee_id}
              </p>
            )}
          </div>
          
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white min-w-[250px]">
            <p className="text-indigo-100 text-sm">Net Monthly Salary</p>
            <p className="text-3xl font-bold mt-1">₹{netSalary.toLocaleString()}</p>
            <div className="mt-3 text-xs text-indigo-100 space-y-1">
              <p>Gross: ₹{grossSalary.toLocaleString()}</p>
              <p>Deductions: ₹{totalDeductions.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded mr-3"></span>
              Earnings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="30000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HRA (House Rent Allowance)
                </label>
                <input
                  type="number"
                  name="hra"
                  value={formData.hra}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DA (Dearness Allowance)
                </label>
                <input
                  type="number"
                  name="da"
                  value={formData.da}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="5000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TA (Travel Allowance)
                </label>
                <input
                  type="number"
                  name="ta"
                  value={formData.ta}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="2000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Allowance
                </label>
                <input
                  type="number"
                  name="medical_allowance"
                  value={formData.medical_allowance}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Allowances
                </label>
                <input
                  type="number"
                  name="other_allowances"
                  value={formData.other_allowances}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="2000"
                />
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-lg font-semibold text-green-700">
                  <span>Total Earnings:</span>
                  <span>₹{grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-8 bg-red-500 rounded mr-3"></span>
              Deductions
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PF (Provident Fund - 12%)
                </label>
                <input
                  type="number"
                  name="pf"
                  value={formData.pf}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="3600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ESI (Employee State Insurance)
                </label>
                <input
                  type="number"
                  name="esi"
                  value={formData.esi}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Tax
                </label>
                <input
                  type="number"
                  name="professional_tax"
                  value={formData.professional_tax}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TDS (Tax Deducted at Source)
                </label>
                <input
                  type="number"
                  name="tds"
                  value={formData.tds}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="2500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Deductions
                </label>
                <input
                  type="number"
                  name="other_deductions"
                  value={formData.other_deductions}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-lg font-semibold text-red-700">
                  <span>Total Deductions:</span>
                  <span>₹{totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Details (For Online Payments)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="State Bank of India"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="1234567890123456"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="SBIN0001234"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                name="account_holder_name"
                value={formData.account_holder_name}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="ABCDE1234F"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
              <input
                type="date"
                name="effective_from"
                value={formData.effective_from}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/payroll')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigureSalary;

