import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const SubjectAttendance = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    fetchSubjectData();
  }, [subjectId]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchSubjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/subject-teacher/subjects/${subjectId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setSubject(result.data.subject);
        // Get unique classes
        const uniqueClasses = [...new Set(result.data.students.map(s => s.className))];
        const classData = uniqueClasses.map((className, index) => ({
          id: `class-${index}`,
          name: className
        }));
        setClasses(classData);
        if (classData.length > 0) {
          setSelectedClass(classData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching subject data:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/subject-teacher/subjects/${subjectId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        const className = classes.find(c => c.id === selectedClass)?.name;
        const classStudents = result.data.students.filter(s => s.className === className);
        setStudents(classStudents);
        
        // Initialize attendance
        const initialAttendance = {};
        classStudents.forEach(student => {
          initialAttendance[student.id] = 'present';
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleCheckImport = async () => {
    setError('');
    setImportLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/subject-teacher/subjects/${subjectId}/class-attendance/${selectedClass}?date=${selectedDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const result = await response.json();
      if (result.success) {
        setImportData(result.data);
        setShowImportModal(true);
      } else {
        setError(result.message || 'No class teacher attendance found for this date');
      }
    } catch (error) {
      console.error('Error checking import:', error);
      setError('Failed to check class teacher attendance');
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    setError('');
    setImportLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/subject-teacher/subjects/${subjectId}/import-attendance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            classId: selectedClass,
            date: selectedDate
          })
        }
      );

      const result = await response.json();
      if (result.success) {
        setSuccess(result.message || 'Attendance imported successfully!');
        setShowImportModal(false);
        setTimeout(() => {
          navigate(`/teacher/subject/${subjectId}/students`);
        }, 2000);
      } else {
        setError(result.message || 'Failed to import attendance');
        setShowImportModal(false);
      }
    } catch (error) {
      console.error('Error importing attendance:', error);
      setError('Failed to import attendance');
      setShowImportModal(false);
    } finally {
      setImportLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        status: attendance[student.id] || 'absent',
        remarks: null
      }));

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/subject-teacher/subjects/${subjectId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          attendance: attendanceData
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Attendance marked successfully!');
        setTimeout(() => {
          navigate(`/teacher/subject/${subjectId}/students`);
        }, 2000);
      } else {
        setError(result.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/teacher/subject/${subjectId}/students`)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Students
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Mark Attendance - {subject?.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Subject Code: {subject?.code}
        </p>
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

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCheckImport}
            disabled={importLoading || !selectedClass || !selectedDate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            {importLoading ? 'Checking...' : 'Import from Class Teacher'}
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('present')}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('absent')}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
          >
            <XCircleIcon className="w-5 h-5 mr-2" />
            Mark All Absent
          </button>
        </div>

        {/* Info message */}
        <div className="mt-3 flex items-start text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 text-blue-500" />
          <p>
            <strong>Tip:</strong> Save time by importing attendance from the class teacher's daily record. 
            The class teacher should mark general attendance first, then you can import it for your subject.
          </p>
        </div>
      </div>

      {/* Attendance Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Students ({students.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No students found in this class</div>
            ) : (
              students.map((student, index) => (
                <div key={student.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">Roll No: {student.rollNumber}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          attendance[student.id] === 'present'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                        }`}
                      >
                        <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          attendance[student.id] === 'absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                        }`}
                      >
                        <XCircleIcon className="w-5 h-5 inline mr-1" />
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          attendance[student.id] === 'late'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                        }`}
                      >
                        <ClockIcon className="w-5 h-5 inline mr-1" />
                        Late
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{students.length}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              <p className="text-sm text-gray-600">Present</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
              <p className="text-sm text-gray-600">Late</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/teacher/subject/${subjectId}/students`)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || students.length === 0}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </form>

      {/* Import Confirmation Modal */}
      {showImportModal && importData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Import Attendance from Class Teacher
              </h3>
              
              {importData.canImport ? (
                <>
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                      ✓ {importData.message}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Preview:</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Roll No
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Student Name
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {importData.attendance.map((record, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {record.roll_number}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {record.student_name}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    record.status === 'present' ? 'bg-green-100 text-green-800' :
                                    record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Summary:</strong> {importData.attendance.length} students - 
                      {' '}{importData.attendance.filter(r => r.status === 'present').length} Present,
                      {' '}{importData.attendance.filter(r => r.status === 'absent').length} Absent,
                      {' '}{importData.attendance.filter(r => r.status === 'late').length} Late
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    This will import the attendance marked by the class teacher for {selectedDate}. 
                    Are you sure you want to proceed?
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportData(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      disabled={importLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importLoading ? 'Importing...' : 'Confirm Import'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      ⚠ {importData.message}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportData(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectAttendance;
