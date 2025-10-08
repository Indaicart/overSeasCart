import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request, 2: Verify, 3: Reset
  const [formData, setFormData] = useState({
    schoolCode: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devCode, setDevCode] = useState(''); // For development only

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          schoolCode: formData.schoolCode
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(result.message);
        if (result.resetCode) {
          setDevCode(result.resetCode); // Show code in development
        }
        setStep(2);
      } else {
        setError(result.message || 'Failed to request password reset');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/password-reset/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          schoolCode: formData.schoolCode,
          code: formData.code
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Code verified! Please enter your new password.');
        setStep(3);
      } else {
        setError(result.message || 'Invalid or expired code');
      }
    } catch (error) {
      console.error('Code verification error:', error);
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/password-reset/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          schoolCode: formData.schoolCode,
          code: formData.code,
          newPassword: formData.newPassword
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <KeyIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            {step === 1 && 'Enter your details to receive a reset code'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Create a new password'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {devCode && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
            <strong>Development Mode:</strong> Your reset code is <strong>{devCode}</strong>
          </div>
        )}

        {/* Step 1: Request Reset */}
        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolCode}
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your school code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center mx-auto"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
