import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarIcon, ClockIcon, UserIcon, MapPinIcon } from '@heroicons/react/24/outline';

const MyTimetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchMyTimetable();
  }, []);

  const fetchMyTimetable = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/timetable', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTimetable(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const getTodaySchedule = () => {
    return timetable.filter(item => item.day_of_week === selectedDay);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const todaySchedule = getTodaySchedule();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="w-8 h-8 mr-2 text-indigo-600" />
          My Timetable
        </h1>
        <p className="text-gray-600 mt-2">View your daily class schedule</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Day Selector */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDay === index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Current Day Info */}
      <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold">{daysOfWeek[selectedDay]}</h2>
        <p className="text-indigo-100 mt-1">{new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p className="mt-3 text-lg">{todaySchedule.length} classes scheduled</p>
      </div>

      {/* Timetable */}
      <div className="space-y-4">
        {todaySchedule.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No classes scheduled for {daysOfWeek[selectedDay]}</p>
          </div>
        ) : (
          todaySchedule.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Time */}
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                      <ClockIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {item.start_time} - {item.end_time}
                      </p>
                      <p className="text-sm text-gray-500">
                        {calculateDuration(item.start_time, item.end_time)} minutes
                      </p>
                    </div>
                  </div>

                  {/* Subject & Details */}
                  <div className="flex-1 md:mx-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.subject_name || 'Subject'}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {item.teacher_name || 'Teacher'}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {item.room_number || 'Room TBA'}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCurrentClass(item.start_time, item.end_time)
                        ? 'bg-green-100 text-green-800'
                        : isUpcoming(item.start_time)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isCurrentClass(item.start_time, item.end_time)
                        ? 'In Progress'
                        : isUpcoming(item.start_time)
                        ? 'Upcoming'
                        : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Print Timetable
        </button>
        <button
          onClick={() => alert('Export functionality will be implemented')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Export to Calendar
        </button>
      </div>
    </div>
  );
};

// Helper functions
function calculateDuration(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
}

function isCurrentClass(startTime, endTime) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function isUpcoming(startTime) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMin] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  return currentMinutes < startMinutes;
}

export default MyTimetable;
