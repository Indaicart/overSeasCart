import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const MyChildren = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyChildren();
  }, []);

  const fetchMyChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/parent/children', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setChildren(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setError('Failed to fetch children information');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (gpa) => {
    if (gpa >= 9) return 'text-green-600';
    if (gpa >= 7.5) return 'text-blue-600';
    if (gpa >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const viewChildDetails = (childId) => {
    navigate(`/parent/child/${childId}/overview`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserGroupIcon className="w-8 h-8 mr-2 text-indigo-600" />
          My Children
        </h1>
        <p className="text-gray-600 mt-2">View your children's academic performance and activities</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Children</p>
              <p className="text-3xl font-bold text-indigo-600">{children.length}</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-indigo-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average GPA</p>
              <p className="text-3xl font-bold text-green-600">
                {children.length > 0
                  ? (children.reduce((sum, c) => sum + (c.gpa || 0), 0) / children.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <AcademicCapIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-3xl font-bold text-blue-600">
                {children.length > 0
                  ? (children.reduce((sum, c) => sum + (c.attendance_percentage || 0), 0) / children.length).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <CalendarIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Children Cards */}
      <div className="space-y-6">
        {children.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No children linked to your account</p>
            <p className="text-sm text-gray-400 mt-2">Please contact the school administrator</p>
          </div>
        ) : (
          children.map((child, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Child Info */}
                  <div className="flex items-start mb-4 md:mb-0">
                    <div className="bg-indigo-100 rounded-full p-4 mr-4">
                      <UserGroupIcon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {child.name || 'Student Name'}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {child.class_name || 'Class N/A'}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Roll No: {child.roll_number || 'N/A'}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Admission: {child.admission_number || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between md:justify-start gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">GPA</p>
                        <p className={`text-2xl font-bold ${getGradeColor(child.gpa || 0)}`}>
                          {child.gpa || '0.0'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Attendance</p>
                        <p className={`text-2xl font-bold ${getAttendanceColor(child.attendance_percentage || 0)}`}>
                          {child.attendance_percentage || '0'}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Rank</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {child.class_rank || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button
                      onClick={() => navigate(`/parent/child/${child.id}/grades`)}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <ChartBarIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Grades</span>
                    </button>
                    <button
                      onClick={() => navigate(`/parent/child/${child.id}/attendance`)}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <CalendarIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Attendance</span>
                    </button>
                    <button
                      onClick={() => navigate(`/parent/child/${child.id}/fees`)}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <CurrencyDollarIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Fees</span>
                    </button>
                    <button
                      onClick={() => navigate(`/parent/child/${child.id}/timetable`)}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <CalendarIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Timetable</span>
                    </button>
                    <button
                      onClick={() => navigate(`/parent/child/${child.id}/assignments`)}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <AcademicCapIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Assignments</span>
                    </button>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="mt-4">
                  <button
                    onClick={() => viewChildDetails(child.id)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Full Details
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Alerts */}
      {children.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-600 mr-3">🔴</span>
              <div>
                <p className="font-medium text-red-900">Fee Payment Due</p>
                <p className="text-sm text-red-700">Term 2 fee payment is due on Oct 15, 2024</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600 mr-3">🟡</span>
              <div>
                <p className="font-medium text-yellow-900">Parent-Teacher Meeting</p>
                <p className="text-sm text-yellow-700">PTM scheduled for Oct 18, 2024</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600 mr-3">🟢</span>
              <div>
                <p className="font-medium text-green-900">Excellent Performance</p>
                <p className="text-sm text-green-700">Your child scored A+ in Mathematics test</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyChildren;
