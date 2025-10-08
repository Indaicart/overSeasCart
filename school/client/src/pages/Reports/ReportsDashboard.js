import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const ReportsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [dashboard, attendance, grades, fees, enrollment] = await Promise.all([
        fetch('http://localhost:5000/api/reports/dashboard', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/reports/attendance', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/reports/grades', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/reports/fees', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/reports/enrollment', { headers }).then(r => r.json())
      ]);

      if (dashboard.success) setDashboardStats(dashboard.data);
      if (attendance.success) setAttendanceData(attendance.data);
      if (grades.success) setGradeData(grades.data);
      if (fees.success) setFeeData(fees.data);
      if (enrollment.success) setEnrollmentData(enrollment.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ChartBarIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive insights and data visualization
        </p>
      </div>

      {/* Overview Stats Cards */}
      {activeTab === 'overview' && dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalStudents}</p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalTeachers}</p>
              </div>
              <AcademicCapIcon className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.attendanceRate}%</p>
              </div>
              <CalendarIcon className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Fees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{dashboardStats.pendingFees.toLocaleString()}</p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'grades', label: 'Grades' },
            { id: 'fees', label: 'Fees' },
            { id: 'enrollment', label: 'Enrollment' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Enrollment by Class */}
          {enrollmentData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Students by Class</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData.byClass}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4F46E5" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Grade Distribution */}
          {gradeData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeData.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ grade, count }) => `${grade}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="grade"
                    >
                      {gradeData.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Fee Status */}
              {feeData && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Collection Status</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={feeData.statusSummary}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, total }) => `${status}: ₹${total}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="status"
                      >
                        {feeData.statusSummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && attendanceData && (
        <div className="space-y-6">
          {/* Attendance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {attendanceData.statusCounts.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 capitalize">{stat.status}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.count}</p>
              </div>
            ))}
          </div>

          {/* Class-wise Attendance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Attendance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData.classWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" name="Attendance Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Low Attendance Students */}
          {attendanceData.lowAttendance && attendanceData.lowAttendance.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ArrowTrendingDownIcon className="w-5 h-5 mr-2 text-red-600" />
                Students with Low Attendance (&lt; 75%)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.lowAttendance.map((student, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.student_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.class_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.present_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.total_days}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            {student.attendance_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && gradeData && (
        <div className="space-y-6">
          {/* Subject-wise Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Average Marks</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData.subjectWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg_marks" fill="#10B981" name="Average Marks" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            {gradeData.topPerformers && gradeData.topPerformers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-600" />
                  Top Performers
                </h2>
                <div className="space-y-3">
                  {gradeData.topPerformers.slice(0, 5).map((student, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{student.student_name}</p>
                        <p className="text-sm text-gray-600">{student.class_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{parseFloat(student.avg_marks).toFixed(1)}</p>
                        <p className="text-xs text-gray-500">{student.total_assessments} assessments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failing Students */}
            {gradeData.failingStudents && gradeData.failingStudents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ArrowTrendingDownIcon className="w-5 h-5 mr-2 text-red-600" />
                  Students Needing Attention
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {gradeData.failingStudents.slice(0, 5).map((student, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{student.student_name}</p>
                        <p className="text-sm text-gray-600">{student.class_name} - {student.subject_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{student.marks_obtained}/{student.total_marks}</p>
                        <p className="text-xs text-red-600">{student.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && feeData && (
        <div className="space-y-6">
          {/* Fee Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feeData.statusSummary.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 capitalize">{stat.status}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{parseFloat(stat.total).toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.count} transactions</p>
              </div>
            ))}
          </div>

          {/* Monthly Collection Trend */}
          {feeData.monthlyTrend && feeData.monthlyTrend.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Collection Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={feeData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="collected" stroke="#4F46E5" name="Collected" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Fee Defaulters */}
          {feeData.defaulters && feeData.defaulters.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Defaulters</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeData.defaulters.map((defaulter, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{defaulter.student_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{defaulter.class_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">₹{defaulter.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(defaulter.due_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{defaulter.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enrollment Tab */}
      {activeTab === 'enrollment' && enrollmentData && (
        <div className="space-y-6">
          {/* Enrollment by Class */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Students by Class</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData.byClass}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={enrollmentData.byGender}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ gender, count }) => `${gender || 'Not Specified'}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="gender"
                  >
                    {enrollmentData.byGender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Classes</span>
                  <span className="text-2xl font-bold text-indigo-600">{enrollmentData.byClass.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Students</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {enrollmentData.byClass.reduce((sum, cls) => sum + parseInt(cls.count), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Avg. Students/Class</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {Math.round(enrollmentData.byClass.reduce((sum, cls) => sum + parseInt(cls.count), 0) / enrollmentData.byClass.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
