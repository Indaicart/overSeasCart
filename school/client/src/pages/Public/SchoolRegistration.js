import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckIcon, 
  XMarkIcon, 
  BuildingOfficeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const SchoolRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: School Info, 2: Plan Selection, 3: Payment, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [schoolData, setSchoolData] = useState({
    schoolName: '',
    schoolEmail: '',
    schoolPhone: '',
    schoolAddress: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    estimatedStudents: '',
    estimatedTeachers: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingCycle: 'monthly' // monthly or annual
  });

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
    }
  };

  const handleSchoolDataChange = (e) => {
    setSchoolData({
      ...schoolData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentDataChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    const {
      schoolName, schoolEmail, schoolPhone, schoolAddress,
      adminFirstName, adminLastName, adminEmail, adminPassword, confirmPassword,
      estimatedStudents, estimatedTeachers
    } = schoolData;

    if (!schoolName || !schoolEmail || !schoolPhone || !schoolAddress) {
      setError('Please fill in all school information');
      return false;
    }

    if (!adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
      setError('Please fill in all admin information');
      return false;
    }

    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (adminPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!estimatedStudents || !estimatedTeachers) {
      setError('Please provide estimated numbers');
      return false;
    }

    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    const { cardNumber, cardName, expiryDate, cvv } = paymentData;

    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setError('Please fill in all payment information');
      return false;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      return false;
    }

    if (cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    setError('');

    try {
      // Submit registration with payment
      const response = await fetch('http://localhost:5000/api/schools/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          school: {
            name: schoolData.schoolName,
            email: schoolData.schoolEmail,
            phone: schoolData.schoolPhone,
            address: schoolData.schoolAddress,
            estimated_students: parseInt(schoolData.estimatedStudents),
            estimated_teachers: parseInt(schoolData.estimatedTeachers)
          },
          admin: {
            first_name: schoolData.adminFirstName,
            last_name: schoolData.adminLastName,
            email: schoolData.adminEmail,
            password: schoolData.adminPassword
          },
          subscription: {
            plan_name: selectedPlan.name,
            billing_cycle: paymentData.billingCycle
          },
          payment: {
            card_number: paymentData.cardNumber.replace(/\s/g, ''),
            card_name: paymentData.cardName,
            expiry_date: paymentData.expiryDate,
            cvv: paymentData.cvv
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep(4); // Success step
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanPrice = (plan) => {
    return paymentData.billingCycle === 'annual' 
      ? plan.annual_price 
      : plan.monthly_price;
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {[1, 2, 3].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= stepNumber 
                ? 'bg-indigo-600 border-indigo-600 text-white' 
                : 'bg-white border-gray-300 text-gray-500'
            }`}>
              {step > stepNumber ? (
                <CheckIcon className="w-6 h-6" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>
            {stepNumber < 3 && (
              <div className={`w-24 h-1 ${
                step > stepNumber ? 'bg-indigo-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className={step >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
          School Info
        </span>
        <span className={step >= 2 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
          Choose Plan
        </span>
        <span className={step >= 3 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
          Payment
        </span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BuildingOfficeIcon className="w-6 h-6 mr-2 text-indigo-600" />
          School Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Name *
            </label>
            <input
              type="text"
              name="schoolName"
              value={schoolData.schoolName}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="ABC International School"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Email *
            </label>
            <input
              type="email"
              name="schoolEmail"
              value={schoolData.schoolEmail}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="contact@school.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Phone *
            </label>
            <input
              type="tel"
              name="schoolPhone"
              value={schoolData.schoolPhone}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Address *
            </label>
            <textarea
              name="schoolAddress"
              value={schoolData.schoolAddress}
              onChange={handleSchoolDataChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="123 Education Street, City, State, ZIP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Students *
            </label>
            <input
              type="number"
              name="estimatedStudents"
              value={schoolData.estimatedStudents}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Teachers *
            </label>
            <input
              type="number"
              name="estimatedTeachers"
              value={schoolData.estimatedTeachers}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="50"
              min="1"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserGroupIcon className="w-6 h-6 mr-2 text-indigo-600" />
          Admin Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="adminFirstName"
              value={schoolData.adminFirstName}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="adminLastName"
              value={schoolData.adminLastName}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Doe"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email *
            </label>
            <input
              type="email"
              name="adminEmail"
              value={schoolData.adminEmail}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="admin@school.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="adminPassword"
              value={schoolData.adminPassword}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Minimum 6 characters"
              minLength="6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={schoolData.confirmPassword}
              onChange={handleSchoolDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Re-enter password"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
        <p className="text-gray-600">Select the subscription plan that best fits your school's needs</p>
        
        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <span className={`text-sm ${paymentData.billingCycle === 'monthly' ? 'font-semibold text-indigo-600' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setPaymentData({...paymentData, billingCycle: paymentData.billingCycle === 'monthly' ? 'annual' : 'monthly'})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              paymentData.billingCycle === 'annual' ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              paymentData.billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <span className={`text-sm ${paymentData.billingCycle === 'annual' ? 'font-semibold text-indigo-600' : 'text-gray-500'}`}>
            Annual <span className="text-green-600 text-xs">(Save 20%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const features = JSON.parse(plan.features || '[]');
          const isSelected = selectedPlan?.id === plan.id;
          const price = getPlanPrice(plan);
          
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                </div>
              )}
              
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-indigo-600">${price}</span>
                  <span className="text-gray-600">/{paymentData.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start text-sm">
                  <UserGroupIcon className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0" />
                  <span>{plan.max_students} Students</span>
                </li>
                <li className="flex items-start text-sm">
                  <AcademicCapIcon className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0" />
                  <span>{plan.max_teachers} Teachers</span>
                </li>
                <li className="flex items-start text-sm">
                  <DocumentTextIcon className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0" />
                  <span>{plan.storage_gb}GB Storage</span>
                </li>
              </ul>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Features:</p>
                <ul className="space-y-2">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-xs text-gray-600">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
          <p className="text-indigo-900">
            <strong>{selectedPlan.name}</strong> plan selected - 
            <strong> ${getPlanPrice(selectedPlan)}</strong> billed {paymentData.billingCycle}
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <CreditCardIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Information</h3>
        <p className="text-gray-600">Complete your subscription to {selectedPlan?.name} plan</p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium">{selectedPlan?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Billing Cycle:</span>
            <span className="font-medium capitalize">{paymentData.billingCycle}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">School:</span>
            <span className="font-medium">{schoolData.schoolName}</span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-indigo-600 text-xl">
                ${getPlanPrice(selectedPlan)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number *
            </label>
            <input
              type="text"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                setPaymentData({...paymentData, cardNumber: value});
              }}
              maxLength="19"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name *
            </label>
            <input
              type="text"
              name="cardName"
              value={paymentData.cardName}
              onChange={handlePaymentDataChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="text"
                name="expiryDate"
                value={paymentData.expiryDate}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }
                  setPaymentData({...paymentData, expiryDate: value});
                }}
                maxLength="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                name="cvv"
                value={paymentData.cvv}
                onChange={handlePaymentDataChange}
                maxLength="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a demo payment form. In production, use a secure payment gateway like Stripe, PayPal, or Square.
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center py-12">
      <div className="mb-6">
        <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to SchoolMS! 🎉
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Your school has been successfully registered and your subscription is now active.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
        <ul className="text-left space-y-3 text-sm text-gray-700">
          <li className="flex items-start">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Check your email for login credentials and setup instructions</span>
          </li>
          <li className="flex items-start">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Login to your admin dashboard</span>
          </li>
          <li className="flex items-start">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Add internal admins if needed</span>
          </li>
          <li className="flex items-start">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Start adding teachers and students</span>
          </li>
          <li className="flex items-start">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Configure your school settings and preferences</span>
          </li>
        </ul>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">SchoolMS</h1>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {step < 4 && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Register Your School
            </h2>
            <p className="text-gray-600">
              Join hundreds of schools using SchoolMS to manage their operations
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto">
          {step < 4 && renderStepIndicator()}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
              <XMarkIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step Content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistration;
