import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const TakeSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  useEffect(() => {
    if (survey && survey.duration_minutes && timeLeft === null) {
      setTimeLeft(survey.duration_minutes * 60); // Convert to seconds
    }
  }, [survey]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchSurvey = async () => {
    try {
      const token = localStorage.getItem('token');
      const [surveyRes, questionsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/surveys/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/surveys/${id}/questions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const surveyData = await surveyRes.json();
      const questionsData = await questionsRes.json();

      if (surveyData.success && questionsData.success) {
        setSurvey(surveyData.data);
        setQuestions(questionsData.data);
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError('Failed to load survey');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Auto-save
    saveAnswer(questionId, answer);
  };

  const saveAnswer = async (questionId, answer) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/survey-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          survey_id: id,
          question_id: questionId,
          answer_text: answer
        })
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Submit all answers
      for (const [questionId, answer] of Object.entries(answers)) {
        await fetch('http://localhost:5000/api/survey-responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            survey_id: id,
            question_id: questionId,
            answer_text: answer
          })
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/surveys');
      }, 3000);
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to submit responses');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (!survey || questions.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your response has been recorded. Thank you for participating!
          </p>
          {survey.type === 'quiz' && (
            <p className="text-sm text-gray-500">
              Your results will be available once the teacher grades your responses.
            </p>
          )}
          <button
            onClick={() => navigate('/surveys')}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const questionOptions = question.options ? JSON.parse(question.options) : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/surveys')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Surveys
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            <p className="text-gray-600 mt-1">{survey.description}</p>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <ClockIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <span className={`font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {question.question_text}
          {question.is_required && <span className="text-red-600 ml-1">*</span>}
        </h2>

        {survey.type === 'quiz' && question.marks && (
          <p className="text-sm text-gray-600 mb-4">Marks: {question.marks}</p>
        )}

        <div className="space-y-3">
          {question.question_type === 'multiple_choice' && (
            <div className="space-y-2">
              {questionOptions.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[question.id] === option
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.question_type === 'true_false' && (
            <div className="space-y-2">
              {['True', 'False'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[question.id] === option
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.question_type === 'short_answer' && (
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your answer"
            />
          )}

          {question.question_type === 'essay' && (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your answer"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Previous
        </button>

        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-8 h-8 rounded-full ${
                idx === currentQuestion
                  ? 'bg-indigo-600 text-white'
                  : answers[questions[idx].id]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            Next
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      {/* Question Overview */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">Question Status:</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                answers[q.id]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              Q{idx + 1}: {answers[q.id] ? 'Answered' : 'Unanswered'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TakeSurvey;
