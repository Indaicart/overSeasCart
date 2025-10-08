import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChartBarIcon, UserGroupIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const SurveyResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const [surveyRes, analyticsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/surveys/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/survey-analytics/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const surveyData = await surveyRes.json();
      const analyticsData = await analyticsRes.json();

      if (surveyData.success) setSurvey(surveyData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/survey-responses/survey/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        // Convert to CSV
        const headers = ['Student', 'Question', 'Answer', 'Marks', 'Feedback'];
        const rows = result.data.map(r => [
          r.user_name,
          r.question_text,
          r.answer_text,
          r.marks_obtained || '',
          r.feedback || ''
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survey-${id}-results.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return <div className="p-6"><div className="text-center py-8">Loading...</div></div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/surveys')} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Surveys
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{survey?.title}</h1>
            <p className="text-gray-600 mt-1">{survey?.description}</p>
          </div>
          <button onClick={exportResults} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <UserGroupIcon className="w-8 h-8 text-indigo-600 mb-2" />
          <p className="text-sm text-gray-600">Total Responses</p>
          <p className="text-3xl font-bold text-gray-900">{analytics?.totalResponses || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <ChartBarIcon className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-sm text-gray-600">Unique Users</p>
          <p className="text-3xl font-bold text-gray-900">{analytics?.uniqueUsers || 0}</p>
        </div>

        {survey?.type === 'quiz' && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.averageScore?.toFixed(1) || 0}%</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.passRate?.toFixed(1) || 0}%</p>
            </div>
          </>
        )}
      </div>

      {/* Question Analytics */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Question-wise Analysis</h2>
        
        {analytics?.questionAnalytics?.map((qa, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Q{index + 1}: {qa.question_text}
            </h3>

            {(qa.question_type === 'multiple_choice' || qa.question_type === 'true_false') && (
              <div className="space-y-3">
                {Object.entries(qa.answerDistribution || {}).map(([answer, count]) => {
                  const percentage = (count / (analytics?.totalResponses || 1)) * 100;
                  const isCorrect = answer === qa.correct_answer;
                  
                  return (
                    <div key={answer} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={isCorrect ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                          {answer} {isCorrect && '✓'}
                        </span>
                        <span className="text-gray-600">{count} responses ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isCorrect ? 'bg-green-600' : 'bg-indigo-600'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(qa.question_type === 'short_answer' || qa.question_type === 'essay') && (
              <div>
                <p className="text-sm text-gray-600 mb-2">{qa.responseCount} responses received</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                  {qa.sampleResponses?.slice(0, 5).map((resp, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-800">{resp.answer_text}</p>
                      {resp.marks_obtained !== null && (
                        <p className="text-xs text-gray-600 mt-1">
                          Score: {resp.marks_obtained}/{qa.marks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {survey?.type === 'quiz' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Average Score: <span className="font-semibold text-gray-900">{qa.averageMarks?.toFixed(1) || 0}</span> / {qa.marks}
                </p>
              </div>
            )}
          </div>
        ))}

        {!analytics?.questionAnalytics || analytics.questionAnalytics.length === 0 && (
          <div className="text-center py-8 text-gray-500">No responses yet</div>
        )}
      </div>

      {/* Top Performers (for quizzes) */}
      {survey?.type === 'quiz' && analytics?.topPerformers && analytics.topPerformers.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performers</h2>
          <div className="space-y-3">
            {analytics.topPerformers.map((performer, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{performer.name}</p>
                  <p className="text-sm text-gray-600">{performer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{performer.score}%</p>
                  <p className="text-sm text-gray-600">{performer.totalMarks} / {survey.total_marks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyResults;
