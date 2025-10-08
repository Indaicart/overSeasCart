import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/role-reports/parent/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching parent dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><div className="text-center py-12">Loading...</div></div>;
  }

  if (!data || !data.children || data.children.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          No children linked to your account. Please contact school admin.
        </div>
      </div>
    );
  }

  // Prepare comparison data
  const comparisonData = data.children.map(child => ({
    name: child.student_name.split(' ')[0],
    average: parseFloat(child.academic.average),
    attendance: parseFloat(child.attendance.percentage)
  }));

  // Get alerts
  const alerts = [];
  data.children.forEach(child => {
    if (child.attendance.percentage < 75) {
      alerts.push({
        type: 'warning',
        child: child.student_name,
        message: `Low attendance: ${child.attendance.percentage}%`
      });
    }
    if (child.fees.pendingFees > 0) {
      alerts.push({
        type: 'info',
        child: child.student_name,
        message: `Pending fees: ₹${child.fees.pendingFees.toLocaleString()}`
      });
    }
    if (child.academic.average < 50) {
      alerts.push({
        type: 'error',
        child: child.student_name,
        message: `Academic concern: ${child.academic.average}% average`
      });
    }
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserGroupIcon className="w-8 h-8 mr-2 text-indigo-600" />
          My Children Dashboard
        </h1>
        <p className="text-gray-600 mt-1">{data.parent.name}</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">Alerts & Notifications</h3>
              <div className="space-y-1">
                {alerts.slice(0, 5).map((alert, index) => (
                  <p key={index} className="text-sm text-yellow-800">
                    • <strong>{alert.child}:</strong> {alert.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Children Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data.children.map((child, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h3 className="text-xl font-bold">{child.student_name}</h3>
              <p className="text-indigo-100 text-sm">{child.class_name} • Roll No: {child.roll_number}</p>
            </div>

            {/* Metrics */}
            <div className="p-6 space-y-4">
              {/* Academic */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AcademicCapIcon className="w-5 h-5 text-indigo-600 mr-2" />
                  <span className="text-sm text-gray-600">Average</span>
                </div>
                <span className={`text-lg font-bold ${
                  child.academic.average >= 75 ? 'text-green-600' :
                  child.academic.average >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {child.academic.average}%
                </span>
              </div>

              {/* Attendance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Attendance</span>
                </div>
                <span className={`text-lg font-bold ${
                  child.attendance.percentage >= 90 ? 'text-green-600' :
                  child.attendance.percentage >= 75 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {child.attendance.percentage}%
                </span>
              </div>

              {/* Fees */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Pending Fees</span>
                </div>
                <span className={`text-lg font-bold ${
                  child.fees.pendingFees === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{child.fees.pendingFees.toLocaleString()}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Assessments:</span> {child.academic.totalAssessments}
                  </div>
                  <div>
                    <span className="font-medium">Present:</span> {child.attendance.presentDays}/{child.attendance.totalDays}
                  </div>
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => navigate(`/parent/child/${child.student_id}/grades`)}
                className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                View Detailed Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Charts */}
      {data.children.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Academic Comparison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#4F46E5" name="Average %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Comparison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#10B981" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Subject Performance */}
      {data.children.map((child, childIndex) => (
        <div key={childIndex} className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {child.student_name} - Subject Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {child.academic.subjectGrades.map((subject, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{subject.subject_name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {subject.marks_obtained}/{subject.total_marks}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    subject.grade === 'A+' || subject.grade === 'A' ? 'bg-green-100 text-green-800' :
                    subject.grade === 'B' || subject.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                    subject.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {subject.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">👥 Total Children</h3>
          <p className="text-3xl font-bold text-blue-600">{data.children.length}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📊 Overall Average</h3>
          <p className="text-3xl font-bold text-green-600">
            {(data.children.reduce((sum, c) => sum + parseFloat(c.academic.average), 0) / data.children.length).toFixed(1)}%
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">💰 Total Pending Fees</h3>
          <p className="text-3xl font-bold text-yellow-600">
            ₹{data.children.reduce((sum, c) => sum + c.fees.pendingFees, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
