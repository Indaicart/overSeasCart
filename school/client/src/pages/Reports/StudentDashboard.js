import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/role-reports/student/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><div className="text-center py-12">Loading...</div></div>;
  }

  if (!data) {
    return <div className="p-6"><div className="text-center py-12 text-red-600">No data available</div></div>;
  }

  const attendanceData = [
    { name: 'Present', value: data.attendance.presentDays, color: '#10B981' },
    { name: 'Absent', value: data.attendance.absentDays, color: '#EF4444' },
    { name: 'Late', value: data.attendance.lateDays, color: '#F59E0B' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Academic Dashboard</h1>
        <p className="text-gray-600 mt-1">{data.student.name} - {data.student.class}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow p-6 text-white">
          <AcademicCapIcon className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Overall Average</p>
          <p className="text-3xl font-bold">{data.academic.overallAverage}%</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <CalendarIcon className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Attendance</p>
          <p className="text-3xl font-bold">{data.attendance.percentage}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <TrophyIcon className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Class Rank</p>
          <p className="text-3xl font-bold">{data.academic.classRank} / {data.academic.totalStudentsInClass}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
          <CurrencyDollarIcon className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Pending Fees</p>
          <p className="text-3xl font-bold">₹{data.fees.pendingFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.academic.subjectAverages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="average" fill="#4F46E5" name="Average %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Total Days: {data.attendance.totalDays}</p>
          </div>
        </div>

        {/* Recent Grades */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h2>
          <div className="space-y-3">
            {data.academic.recentGrades.map((grade, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{grade.subject_name}</p>
                  <p className="text-sm text-gray-600">{grade.exam_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">
                    {grade.marks_obtained}/{grade.total_marks}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                    grade.grade === 'B' || grade.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                    grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {grade.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Total Fees</span>
              <span className="text-xl font-bold text-gray-900">₹{data.fees.totalFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Paid</span>
              <span className="text-xl font-bold text-green-600">₹{data.fees.paidFees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-gray-700">Pending</span>
              <span className="text-xl font-bold text-red-600">₹{data.fees.pendingFees.toLocaleString()}</span>
            </div>
          </div>

          {data.fees.feeDetails.filter(f => f.status === 'pending').length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Upcoming Dues:</h3>
              <div className="space-y-2">
                {data.fees.feeDetails.filter(f => f.status === 'pending').slice(0, 3).map((fee, index) => (
                  <div key={index} className="text-sm p-2 bg-yellow-50 rounded">
                    <p className="font-medium">{fee.description}</p>
                    <p className="text-gray-600">₹{fee.amount} - Due: {new Date(fee.due_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">✅ Strengths</h3>
          {data.academic.subjectAverages
            .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
            .slice(0, 2)
            .map((subject, index) => (
              <p key={index} className="text-sm text-green-800">
                • {subject.subject}: {subject.average}%
              </p>
            ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Needs Improvement</h3>
          {data.academic.subjectAverages
            .sort((a, b) => parseFloat(a.average) - parseFloat(b.average))
            .slice(0, 2)
            .map((subject, index) => (
              <p key={index} className="text-sm text-yellow-800">
                • {subject.subject}: {subject.average}%
              </p>
            ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 Goals</h3>
          <p className="text-sm text-blue-800">
            {data.attendance.percentage < 75 
              ? `• Improve attendance to 75%+` 
              : data.attendance.percentage < 90
              ? `• Maintain good attendance (${data.attendance.percentage}%)`
              : `• Excellent attendance! Keep it up!`}
          </p>
          <p className="text-sm text-blue-800">
            {data.academic.overallAverage < 75
              ? `• Aim for 75%+ overall average`
              : `• Maintain ${data.academic.overallAverage}% average`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
