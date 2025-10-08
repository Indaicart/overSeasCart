import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BuildingOfficeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  UserIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SchoolLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  // Step 1: School Verification
  const [step, setStep] = useState(1);
  const [schoolId, setSchoolId] = useState('');
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2: Login
  const [selectedLoginType, setSelectedLoginType] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Icon mapping
  const iconMap = {
    'shield': ShieldCheckIcon,
    'academic-cap': AcademicCapIcon,
    'user': UserIcon,
    'users': UserGroupIcon
  };

  // Step 1: Verify School ID
  const handleSchoolVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/school-login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId: schoolId.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setSchoolData(data.data);
        setStep(2);
      } else {
        setError(data.message || 'School verification failed');
      }
    } catch (error) {
      console.error('School verification error:', error);
      setError('Unable to verify school. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!selectedLoginType) {
      setLoginError('Please select a login type');
      return;
    }

    setLoginLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/school-login/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: schoolData.school.code,
          email: email.trim(),
          password,
          loginType: selectedLoginType
        })
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user data
        localStorage.setItem('token', data.data.token);
        await authLogin(data.data.token);
        navigate('/dashboard');
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Reset to Step 1
  const handleBackToSchoolSelect = () => {
    setStep(1);
    setSchoolData(null);
    setSelectedLoginType(null);
    setEmail('');
    setPassword('');
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BuildingOfficeIcon className="h-16 w-16 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          School Management System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 ? 'Enter your School ID to continue' : `Welcome to ${schoolData?.school.name}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-200">
          {/* STEP 1: School Verification */}
          {step === 1 && (
            <form onSubmit={handleSchoolVerification} className="space-y-6">
              <div>
                <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700">
                  School ID
                </label>
                <div className="mt-1 relative">
                  <input
                    id="schoolId"
                    name="schoolId"
                    type="text"
                    required
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value.toUpperCase())}
                    placeholder="e.g., GREVALHI784"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase"
                  />
                  <BuildingOfficeIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Enter the unique School ID provided by your school administration
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !schoolId.trim()}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Continue'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have a School ID?{' '}
                  <Link to="/school-registration" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Register Your School
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: Login Type Selection & Credentials */}
          {step === 2 && schoolData && (
            <div className="space-y-6">
              {/* School Info Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-start">
                  {schoolData.school.logo && (
                    <img
                      src={schoolData.school.logo}
                      alt={schoolData.school.name}
                      className="h-12 w-12 rounded-lg mr-3 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {schoolData.school.name}
                    </h3>
                    <p className="text-sm text-gray-600">ID: {schoolData.school.code}</p>
                    <div className="flex items-center mt-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-700">Verified School</span>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToSchoolSelect}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Change
                  </button>
                </div>

                {/* School Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded p-2">
                    <p className="text-lg font-bold text-indigo-600">{schoolData.stats.students}</p>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-lg font-bold text-indigo-600">{schoolData.stats.teachers}</p>
                    <p className="text-xs text-gray-600">Teachers</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-lg font-bold text-indigo-600">{schoolData.stats.classes}</p>
                    <p className="text-xs text-gray-600">Classes</p>
                  </div>
                </div>
              </div>

              {/* Login Type Selection */}
              {!selectedLoginType ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Select Login Type:</h4>
                  <div className="space-y-2">
                    {schoolData.availableLogins.map((loginType) => {
                      const IconComponent = iconMap[loginType.icon] || UserIcon;
                      return (
                        <button
                          key={loginType.type}
                          onClick={() => setSelectedLoginType(loginType.type)}
                          className="w-full flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                        >
                          <IconComponent className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 mr-3 flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 group-hover:text-indigo-700">
                              {loginType.label}
                            </p>
                            <p className="text-xs text-gray-500">{loginType.description}</p>
                          </div>
                          <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="bg-indigo-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      {(() => {
                        const loginTypeData = schoolData.availableLogins.find(l => l.type === selectedLoginType);
                        const IconComponent = iconMap[loginTypeData?.icon] || UserIcon;
                        return (
                          <>
                            <IconComponent className="h-5 w-5 text-indigo-600 mr-2" />
                            <span className="text-sm font-medium text-indigo-900">
                              {loginTypeData?.label} Login
                            </span>
                          </>
                        );
                      })()}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLoginType(null);
                        setEmail('');
                        setPassword('');
                        setLoginError('');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {loginError && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                        <div className="text-sm text-red-700">{loginError}</div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              )}

              <div className="mt-4 text-center">
                <a
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </a>
              </div>

              <button
                onClick={handleBackToSchoolSelect}
                className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 mt-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to School Selection
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2024 School Management System. All rights reserved.</p>
          <p className="mt-1">
            <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
            {' • '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolLogin;
