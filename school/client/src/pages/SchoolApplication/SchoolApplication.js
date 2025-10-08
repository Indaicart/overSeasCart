import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

const SchoolApplication = () => {
  const [formData, setFormData] = useState({
    schoolInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      website: ''
    },
    requirements: {
      estimatedStudents: '',
      estimatedTeachers: '',
      estimatedClasses: '',
      neededFeatures: [],
      budgetRange: '',
      preferredPlan: '',
      trialPeriod: 30
    },
    contactInfo: {
      contactPerson: '',
      position: '',
      email: '',
      phone: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch available plans
  const { data: plans } = useQuery('subscription-plans', async () => {
    const response = await axios.get('/api/school-applications/plans');
    return response.data;
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        neededFeatures: prev.requirements.neededFeatures.includes(feature)
          ? prev.requirements.neededFeatures.filter(f => f !== feature)
          : [...prev.requirements.neededFeatures, feature]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/school-applications/apply', formData);
      
      if (response.data.message) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Application submission error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Application Submitted!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Thank you for your interest in our school management system. 
              We'll review your application and get back to you within 2-3 business days.
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            School Application
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Apply to use our comprehensive school management system
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>School Info</span>
            <span>Requirements</span>
            <span>Contact Info</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          {/* Step 1: School Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">School Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolInfo.name}
                  onChange={(e) => handleInputChange('schoolInfo', 'name', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  School Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.schoolInfo.email}
                  onChange={(e) => handleInputChange('schoolInfo', 'email', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.schoolInfo.phone}
                  onChange={(e) => handleInputChange('schoolInfo', 'phone', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  School Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.schoolInfo.address}
                  onChange={(e) => handleInputChange('schoolInfo', 'address', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.schoolInfo.website}
                  onChange={(e) => handleInputChange('schoolInfo', 'website', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Requirements & Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Students *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.requirements.estimatedStudents}
                    onChange={(e) => handleInputChange('requirements', 'estimatedStudents', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Teachers *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.requirements.estimatedTeachers}
                    onChange={(e) => handleInputChange('requirements', 'estimatedTeachers', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Classes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.requirements.estimatedClasses}
                    onChange={(e) => handleInputChange('requirements', 'estimatedClasses', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Needed Features
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Advanced Analytics',
                    'Fee Management',
                    'Parent Portal',
                    'Custom Branding',
                    'API Access',
                    'Multi-campus Support',
                    'White-label Solution',
                    'Priority Support'
                  ].map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requirements.neededFeatures.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Budget Range (Monthly)
                </label>
                <select
                  value={formData.requirements.budgetRange}
                  onChange={(e) => handleInputChange('requirements', 'budgetRange', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="0-50">$0 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-200">$100 - $200</option>
                  <option value="200+">$200+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Plan
                </label>
                <select
                  value={formData.requirements.preferredPlan}
                  onChange={(e) => handleInputChange('requirements', 'preferredPlan', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Let us recommend</option>
                  {plans?.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.monthlyPrice}/month
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactInfo.contactPerson}
                  onChange={(e) => handleInputChange('contactInfo', 'contactPerson', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Position/Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactInfo.position}
                  onChange={(e) => handleInputChange('contactInfo', 'position', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolApplication;
