import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const SurveyList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, closed

  useEffect(() => {
    fetchSurveys();
  }, [filter]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/surveys?status=${filter !== 'all' ? filter : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setSurveys(result.data);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this survey/quiz?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/surveys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchSurveys();
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const badges = {
      survey: 'bg-blue-100 text-blue-800',
      quiz: 'bg-purple-100 text-purple-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const getTargetAudience = (targetRoles) => {
    try {
      const roles = JSON.parse(targetRoles);
      return roles.join(', ');
    } catch {
      return targetRoles;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DocumentTextIcon className="w-8 h-8 mr-2 text-indigo-600" />
            Surveys & Quizzes
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage surveys and quizzes for students and teachers
          </p>
        </div>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <button
            onClick={() => navigate('/surveys/create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'closed'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Surveys List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-gray-500">Loading...</div>
        ) : surveys.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No surveys found. Create your first survey or quiz!
          </div>
        ) : (
          surveys.map((survey) => (
            <div key={survey.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadge(survey.type)}`}>
                        {survey.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(survey.status)}`}>
                        {survey.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{survey.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{survey.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    <span>{survey.question_count || 0} questions</span>
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-1" />
                    <span>{survey.response_count || 0} responses</span>
                  </div>
                  {survey.type === 'quiz' && survey.total_marks && (
                    <div className="flex items-center">
                      <ChartBarIcon className="w-4 h-4 mr-1" />
                      <span>{survey.total_marks} marks</span>
                    </div>
                  )}
                </div>

                {/* Target Audience */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Target Audience</p>
                  <p className="text-sm text-gray-700 capitalize">{getTargetAudience(survey.target_roles)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {user.role === 'student' || user.role === 'teacher' ? (
                    <button
                      onClick={() => navigate(`/surveys/${survey.id}/take`)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      disabled={survey.status !== 'active'}
                    >
                      {survey.type === 'quiz' ? 'Take Quiz' : 'Take Survey'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/surveys/${survey.id}/results`)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center"
                      >
                        <ChartBarIcon className="w-4 h-4 mr-1" />
                        View Results
                      </button>
                      <button
                        onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SurveyList;
