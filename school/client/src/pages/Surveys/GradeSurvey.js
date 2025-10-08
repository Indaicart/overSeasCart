import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const GradeSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResponses();
  }, [id]);

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/survey-responses/survey/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setResponses(result.data);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleGrade = async (responseId) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/survey-responses/${responseId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          marks_obtained: grades[responseId],
          feedback: feedback[responseId]
        })
      });

      if (response.ok) {
        setSuccess('Grade saved successfully');
        fetchResponses();
      }
    } catch (error) {
      setError('Failed to save grade');
    } finally {
      setLoading(false);
    }
  };

  // Group responses by student
  const groupedResponses = responses.reduce((acc, resp) => {
    if (!acc[resp.user_id]) {
      acc[resp.user_id] = {
        userName: resp.user_name,
        userEmail: resp.user_email,
        responses: []
      };
    }
    acc[resp.user_id].responses.push(resp);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/surveys')} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Surveys
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Grade Responses</h1>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedResponses).map(([userId, data]) => (
          <div key={userId} className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{data.userName}</h3>
              <p className="text-sm text-gray-600">{data.userEmail}</p>
            </div>

            <div className="space-y-4">
              {data.responses.map((resp) => (
                <div key={resp.id} className="border-t border-gray-200 pt-4">
                  <p className="font-medium text-gray-900 mb-2">{resp.question_text}</p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-gray-800">{resp.answer_text}</p>
                  </div>

                  {(resp.question_type === 'short_answer' || resp.question_type === 'essay') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marks (out of {resp.marks || 10})
                        </label>
                        <input
                          type="number"
                          max={resp.marks || 10}
                          value={grades[resp.id] || ''}
                          onChange={(e) => setGrades({ ...grades, [resp.id]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feedback
                        </label>
                        <input
                          type="text"
                          value={feedback[resp.id] || ''}
                          onChange={(e) => setFeedback({ ...feedback, [resp.id]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {resp.question_type === 'multiple_choice' || resp.question_type === 'true_false' ? (
                    <div className="mt-2">
                      {resp.answer_text === resp.correct_answer ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          ✓ Correct ({resp.marks} marks)
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                          ✗ Incorrect (0 marks)
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGrade(resp.id)}
                      disabled={loading}
                      className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                      Save Grade
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedResponses).length === 0 && (
          <div className="text-center py-8 text-gray-500">No responses yet</div>
        )}
      </div>
    </div>
  );
};

export default GradeSurvey;
