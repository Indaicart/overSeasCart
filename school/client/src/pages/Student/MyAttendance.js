import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline';

const MyAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMyAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/student/attendance?month=${selectedMonth + 1}&year=${selectedYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setAttendance(data.data.records || []);
        setSummary(data.data.summary || {});
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'absent':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'late':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="w-6 h-6 text-gray-300" />;
    }
  };

  const getAttendancePercentage = () => {
    const total = summary.total_days || 0;
    const present = summary.present_days || 0;
    return total > 0 ? ((present / total) * 100).toFixed(1) : 0;
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarDaysIcon className="w-8 h-8 mr-2 text-indigo-600" />
          My Attendance
        </h1>
        <p className="text-gray-600 mt-2">Track your attendance record and percentage</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall</p>
              <p className={`text-3xl font-bold ${getPercentageColor(getAttendancePercentage())}`}>
                {getAttendancePercentage()}%
              </p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-3xl font-bold text-green-600">
                {summary.present_days || 0}
              </p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-3xl font-bold text-red-600">
                {summary.absent_days || 0}
              </p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            <XCircleIcon className="w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-3xl font-bold text-yellow-600">
                {summary.late_days || 0}
              </p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            <ClockIcon className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          {monthNames.map((month, index) => (
            <option key={index} value={index}>{month}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
          <option value={2025}>2025</option>
        </select>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Attendance Records - {monthNames[selectedMonth]} {selectedYear}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Check-in Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No attendance records for this period
                  </td>
                </tr>
              ) : (
                attendance.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getAttendanceIcon(record.status)}
                        <span className="ml-2 text-sm font-medium capitalize">
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.check_in_time || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply for Leave Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => alert('Leave application functionality will be implemented')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apply for Leave
        </button>
      </div>
    </div>
  );
};

export default MyAttendance;
