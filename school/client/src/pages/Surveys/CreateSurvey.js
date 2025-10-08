import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CreateSurvey = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'survey',
    target_roles: [],
    total_marks: '',
    duration_minutes: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const [questions, setQuestions] = useState([]);

  const handleBasicInfoChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      marks: formData.type === 'quiz' ? 1 : null,
      is_required: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.description || formData.target_roles.length === 0) {
        setError('Please fill in all required fields');
        return false;
      }
    } else if (step === 2) {
      if (questions.length === 0) {
        setError('Please add at least one question');
        return false;
      }
      for (const q of questions) {
        if (!q.question_text) {
          setError('All questions must have text');
          return false;
        }
        if ((q.question_type === 'multiple_choice' || q.question_type === 'true_false') && 
            q.options.some(opt => !opt)) {
          setError('All options must be filled');
          return false;
        }
        if (formData.type === 'quiz' && (q.question_type === 'multiple_choice' || q.question_type === 'true_false') && !q.correct_answer) {
          setError('Please set correct answers for all questions');
          return false;
        }
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Create survey
      const surveyResponse = await fetch('http://localhost:5000/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          target_roles: JSON.stringify(formData.target_roles),
          total_marks: formData.type === 'quiz' ? parseInt(formData.total_marks) : null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
        })
      });

      const surveyResult = await surveyResponse.json();
      
      if (!surveyResult.success) {
        throw new Error(surveyResult.message || 'Failed to create survey');
      }

      const surveyId = surveyResult.data.id;

      // Add questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await fetch('http://localhost:5000/api/surveys/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            survey_id: surveyId,
            question_text: q.question_text,
            question_type: q.question_type,
            options: (q.question_type === 'multiple_choice' || q.question_type === 'true_false') 
              ? JSON.stringify(q.options) 
              : null,
            correct_answer: q.correct_answer || null,
            marks: q.marks || null,
            order_number: i + 1,
            is_required: q.is_required
          })
        });
      }

      setSuccess('Survey/Quiz created successfully!');
      setTimeout(() => {
        navigate('/surveys');
      }, 2000);
    } catch (error) {
      console.error('Create survey error:', error);
      setError(error.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">
          Create {formData.type === 'quiz' ? 'Quiz' : 'Survey'}
        </h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {s}
                </div>
                <p className="text-xs mt-2 text-gray-600">
                  {s === 1 ? 'Basic Info' : s === 2 ? 'Questions' : 'Review'}
                </p>
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-4 ${step > s ? 'bg-indigo-600' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
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

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleBasicInfoChange('type', 'survey')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'survey'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <h3 className="font-semibold">Survey</h3>
                <p className="text-sm text-gray-600">Collect feedback</p>
              </button>
              <button
                type="button"
                onClick={() => handleBasicInfoChange('type', 'quiz')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'quiz'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <h3 className="font-semibold">Quiz</h3>
                <p className="text-sm text-gray-600">Test knowledge</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleBasicInfoChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleBasicInfoChange('description', e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <div className="space-y-2">
              {['student', 'teacher', 'parent'].map(role => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.target_roles.includes(role)}
                    onChange={() => handleTargetRoleToggle(role)}
                    className="mr-2"
                  />
                  <span className="capitalize">{role}s</span>
                </label>
              ))}
            </div>
          </div>

          {formData.type === 'quiz' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={formData.total_marks}
                  onChange={(e) => handleBasicInfoChange('total_marks', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter total marks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleBasicInfoChange('duration_minutes', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter duration"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleBasicInfoChange('start_date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleBasicInfoChange('end_date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Next: Add Questions
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Questions */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Questions</h2>
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No questions added yet. Click "Add Question" to start.
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={q.question_text}
                          onChange={(e) => updateQuestion(q.id, 'question_text', e.target.value)}
                          rows="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter question"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type *
                        </label>
                        <select
                          value={q.question_type}
                          onChange={(e) => updateQuestion(q.id, 'question_type', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      {q.question_type === 'multiple_choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options *
                          </label>
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center mb-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateQuestionOption(q.id, optIndex, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              {q.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(q.id, optIndex)}
                                  className="ml-2 text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(q.id)}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                      {q.question_type === 'true_false' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                          </label>
                          <div className="space-y-2">
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">True</div>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">False</div>
                          </div>
                        </div>
                      )}

                      {formData.type === 'quiz' && (q.question_type === 'multiple_choice' || q.question_type === 'true_false') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer *
                          </label>
                          <select
                            value={q.correct_answer}
                            onChange={(e) => updateQuestion(q.id, 'correct_answer', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select correct answer</option>
                            {q.question_type === 'true_false' ? (
                              <>
                                <option value="True">True</option>
                                <option value="False">False</option>
                              </>
                            ) : (
                              q.options.map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                              ))
                            )}
                          </select>
                        </div>
                      )}

                      {formData.type === 'quiz' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marks
                          </label>
                          <input
                            type="number"
                            value={q.marks || ''}
                            onChange={(e) => updateQuestion(q.id, 'marks', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter marks"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Review & Submit</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold capitalize">{formData.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Audience</p>
                  <p className="font-semibold capitalize">{formData.target_roles.join(', ')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Title</p>
                <p className="font-semibold">{formData.title}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">{formData.description}</p>
              </div>

              {formData.type === 'quiz' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Marks</p>
                    <p className="font-semibold">{formData.total_marks || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{formData.duration_minutes ? `${formData.duration_minutes} minutes` : 'Not set'}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">Questions</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold">{questions.length} question(s) added</p>
                  <ul className="mt-2 space-y-1">
                    {questions.map((q, idx) => (
                      <li key={q.id} className="text-sm text-gray-600">
                        {idx + 1}. {q.question_text.substring(0, 50)}...
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center disabled:opacity-50"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Create Survey'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSurvey;
