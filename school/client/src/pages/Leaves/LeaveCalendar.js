import React, { useState, useEffect } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LeaveCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, [selectedMonth, selectedYear]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:5000/api/leaves/calendar?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setLeaves(result.data);
      }
    } catch (error) {
      console.error('Error fetching leave calendar:', error);
      toast.error('Failed to load leave calendar');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getLeavesByDate = (date) => {
    return leaves.filter(leave => {
      const leaveStart = new Date(leave.start_date);
      const leaveEnd = new Date(leave.end_date);
      const currentDate = new Date(selectedYear, selectedMonth - 1, date);
      
      return currentDate >= leaveStart && currentDate <= leaveEnd;
    });
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDate(null);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    const weeks = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const dayLeaves = getLeavesByDate(date);
      const isToday = 
        date === new Date().getDate() &&
        selectedMonth === new Date().getMonth() + 1 &&
        selectedYear === new Date().getFullYear();
      const isSelected = selectedDate === date;

      days.push(
        <div
          key={date}
          onClick={() => setSelectedDate(date)}
          className={`p-2 min-h-[80px] border border-gray-200 cursor-pointer transition-colors ${
            isToday ? 'bg-indigo-50 border-indigo-300' : 'hover:bg-gray-50'
          } ${isSelected ? 'ring-2 ring-indigo-600' : ''}`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
            {date}
          </div>
          {dayLeaves.length > 0 && (
            <div className="space-y-1">
              {dayLeaves.slice(0, 2).map(leave => (
                <div
                  key={leave.id}
                  className={`text-xs px-2 py-1 rounded truncate ${
                    leave.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                  title={`${leave.teacher_name} - ${leave.leave_type_name}`}
                >
                  {leave.teacher_name.split(' ')[0]}
                </div>
              ))}
              {dayLeaves.length > 2 && (
                <div className="text-xs text-gray-500 px-2">
                  +{dayLeaves.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Split days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <div key={`week-${i}`} className="grid grid-cols-7">
          {days.slice(i, i + 7)}
        </div>
      );
    }

    return weeks;
  };

  const selectedDateLeaves = selectedDate ? getLeavesByDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Leave Calendar
        </h1>
        <p className="text-gray-600 mt-1">View staff leaves and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* Month Navigation */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900">
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
              </h2>
              
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                <span className="text-gray-600">Approved</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
                <span className="text-gray-600">Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-indigo-50 border border-indigo-300 rounded mr-2"></div>
                <span className="text-gray-600">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Leaves for Selected Date */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate
                ? `Leaves on ${selectedDate} ${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })}`
                : 'Select a date'}
            </h2>

            {!selectedDate ? (
              <p className="text-gray-500 text-center py-8">
                Click on a date to view leaves
              </p>
            ) : selectedDateLeaves.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No leaves on this date
              </p>
            ) : (
              <div className="space-y-4">
                {selectedDateLeaves.map(leave => (
                  <div
                    key={leave.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{leave.teacher_name}</h3>
                        <p className="text-sm text-gray-600">EMP-{leave.employee_id}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          leave.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{leave.leave_type_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{leave.total_days} day(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span className="font-medium">
                          {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {leave.reason && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600">Reason:</p>
                        <p className="text-sm text-gray-900">{leave.reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Leaves:</span>
                <span className="font-semibold text-gray-900">{leaves.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Approved:</span>
                <span className="font-semibold text-green-600">
                  {leaves.filter(l => l.status === 'approved').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-yellow-600">
                  {leaves.filter(l => l.status === 'pending').length}
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Staff on leave today:</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {getLeavesByDate(new Date().getDate()).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;

