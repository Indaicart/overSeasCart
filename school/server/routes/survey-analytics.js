const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/survey-analytics/:surveyId/overview
 * Get overview analytics for a survey
 */
router.get('/:surveyId/overview', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const schoolId = req.user.schoolId;

    // Verify survey belongs to school
    const survey = await db('surveys')
      .where('id', surveyId)
      .where('school_id', schoolId)
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Get response statistics
    const responseStats = await db('survey_responses')
      .where('survey_id', surveyId)
      .select(
        db.raw('COUNT(*) as total_responses'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as submitted', ['submitted']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as in_progress', ['in_progress']),
        db.raw('AVG(CASE WHEN percentage IS NOT NULL THEN percentage END) as avg_percentage'),
        db.raw('MAX(percentage) as highest_score'),
        db.raw('MIN(percentage) as lowest_score')
      )
      .first();

    // Get pass/fail stats for quizzes
    let passFailStats = null;
    if (survey.type === 'quiz' && survey.passing_marks) {
      passFailStats = await db('survey_responses')
        .where('survey_id', surveyId)
        .where('status', 'graded')
        .select(
          db.raw('COUNT(CASE WHEN passed = true THEN 1 END) as passed'),
          db.raw('COUNT(CASE WHEN passed = false THEN 1 END) as failed')
        )
        .first();
    }

    // Get completion rate by target audience
    const audienceStats = await db('survey_responses')
      .join('users', 'survey_responses.user_id', 'users.id')
      .where('survey_responses.survey_id', surveyId)
      .select(
        'users.role',
        db.raw('COUNT(*) as count'),
        db.raw('COUNT(CASE WHEN survey_responses.status = ? THEN 1 END) as submitted', ['submitted'])
      )
      .groupBy('users.role');

    // Get question count
    const questionCount = await db('survey_questions')
      .where('survey_id', surveyId)
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: {
        survey,
        stats: {
          total_responses: parseInt(responseStats.total_responses || 0),
          submitted: parseInt(responseStats.submitted || 0),
          in_progress: parseInt(responseStats.in_progress || 0),
          completion_rate: responseStats.total_responses > 0 
            ? ((parseInt(responseStats.submitted || 0) / parseInt(responseStats.total_responses)) * 100).toFixed(1)
            : 0,
          avg_percentage: responseStats.avg_percentage ? parseFloat(responseStats.avg_percentage).toFixed(2) : null,
          highest_score: responseStats.highest_score ? parseFloat(responseStats.highest_score).toFixed(2) : null,
          lowest_score: responseStats.lowest_score ? parseFloat(responseStats.lowest_score).toFixed(2) : null,
          question_count: parseInt(questionCount.count || 0)
        },
        passFailStats: passFailStats ? {
          passed: parseInt(passFailStats.passed || 0),
          failed: parseInt(passFailStats.failed || 0),
          pass_rate: (parseInt(passFailStats.passed || 0) + parseInt(passFailStats.failed || 0)) > 0
            ? ((parseInt(passFailStats.passed || 0) / (parseInt(passFailStats.passed || 0) + parseInt(passFailStats.failed || 0))) * 100).toFixed(1)
            : 0
        } : null,
        audienceStats
      }
    });
  } catch (error) {
    console.error('Get survey overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch survey overview'
    });
  }
});

/**
 * GET /api/survey-analytics/:surveyId/responses
 * Get all responses for a survey
 */
router.get('/:surveyId/responses', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const schoolId = req.user.schoolId;

    // Verify survey belongs to school
    const survey = await db('surveys')
      .where('id', surveyId)
      .where('school_id', schoolId)
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Get all responses with user details
    const responses = await db('survey_responses')
      .join('users', 'survey_responses.user_id', 'users.id')
      .leftJoin('students', 'users.id', 'students.user_id')
      .leftJoin('teachers', 'users.id', 'teachers.user_id')
      .where('survey_responses.survey_id', surveyId)
      .orderBy('survey_responses.submitted_at', 'desc')
      .select(
        'survey_responses.*',
        'users.name as user_name',
        'users.email as user_email',
        'users.role as user_role',
        'students.roll_number as student_roll_number',
        'teachers.employee_id as teacher_employee_id'
      );

    res.json({
      success: true,
      data: responses
    });
  } catch (error) {
    console.error('Get survey responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch responses'
    });
  }
});

/**
 * GET /api/survey-analytics/:surveyId/question/:questionId
 * Get analytics for a specific question
 */
router.get('/:surveyId/question/:questionId', async (req, res) => {
  try {
    const { surveyId, questionId } = req.params;
    const schoolId = req.user.schoolId;

    // Verify survey belongs to school
    const survey = await db('surveys')
      .where('id', surveyId)
      .where('school_id', schoolId)
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Get question details
    const question = await db('survey_questions')
      .where('id', questionId)
      .where('survey_id', surveyId)
      .first();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Get all answers for this question
    const answers = await db('survey_answers')
      .join('survey_responses', 'survey_answers.response_id', 'survey_responses.id')
      .where('survey_answers.question_id', questionId)
      .where('survey_responses.status', 'submitted')
      .select('survey_answers.*');

    // Calculate statistics based on question type
    let statistics = {};

    if (question.question_type === 'multiple_choice' || question.question_type === 'dropdown' || question.question_type === 'true_false') {
      // Count responses for each option
      const optionCounts = {};
      const options = question.options ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options) : [];
      
      options.forEach(opt => {
        optionCounts[opt] = 0;
      });

      answers.forEach(answer => {
        if (answer.answer_text) {
          optionCounts[answer.answer_text] = (optionCounts[answer.answer_text] || 0) + 1;
        }
      });

      statistics = {
        type: 'options',
        data: Object.entries(optionCounts).map(([option, count]) => ({
          option,
          count,
          percentage: answers.length > 0 ? ((count / answers.length) * 100).toFixed(1) : 0
        }))
      };
    } else if (question.question_type === 'checkbox') {
      // Count each checkbox option
      const optionCounts = {};
      const options = question.options ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options) : [];
      
      options.forEach(opt => {
        optionCounts[opt] = 0;
      });

      answers.forEach(answer => {
        const selectedOptions = answer.answer_data ? (typeof answer.answer_data === 'string' ? JSON.parse(answer.answer_data) : answer.answer_data) : [];
        selectedOptions.forEach(opt => {
          optionCounts[opt] = (optionCounts[opt] || 0) + 1;
        });
      });

      statistics = {
        type: 'checkbox',
        data: Object.entries(optionCounts).map(([option, count]) => ({
          option,
          count,
          percentage: answers.length > 0 ? ((count / answers.length) * 100).toFixed(1) : 0
        }))
      };
    } else if (question.question_type === 'rating') {
      // Calculate average rating
      const ratings = answers.map(a => parseFloat(a.answer_text)).filter(r => !isNaN(r));
      const avgRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2) : 0;

      statistics = {
        type: 'rating',
        average: avgRating,
        total_responses: ratings.length
      };
    } else {
      // For text answers, just list them
      statistics = {
        type: 'text',
        responses: answers.map(a => ({
          answer: a.answer_text,
          submitted_at: a.created_at
        }))
      };
    }

    // For quizzes, add correctness stats
    let correctnessStats = null;
    if (survey.type === 'quiz' && question.correct_answer) {
      const correctCount = answers.filter(a => a.is_correct).length;
      const incorrectCount = answers.filter(a => !a.is_correct && a.is_correct !== null).length;
      
      correctnessStats = {
        correct: correctCount,
        incorrect: incorrectCount,
        accuracy: answers.length > 0 ? ((correctCount / answers.length) * 100).toFixed(1) : 0
      };
    }

    res.json({
      success: true,
      data: {
        question: {
          ...question,
          options: question.options ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options) : null
        },
        total_responses: answers.length,
        statistics,
        correctnessStats
      }
    });
  } catch (error) {
    console.error('Get question analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question analytics'
    });
  }
});

/**
 * GET /api/survey-analytics/:surveyId/individual/:responseId
 * Get individual response details
 */
router.get('/:surveyId/individual/:responseId', async (req, res) => {
  try {
    const { surveyId, responseId } = req.params;
    const schoolId = req.user.schoolId;

    // Verify survey belongs to school
    const survey = await db('surveys')
      .where('id', surveyId)
      .where('school_id', schoolId)
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Get response with user details
    const response = await db('survey_responses')
      .join('users', 'survey_responses.user_id', 'users.id')
      .where('survey_responses.id', responseId)
      .where('survey_responses.survey_id', surveyId)
      .first(
        'survey_responses.*',
        'users.name as user_name',
        'users.email as user_email',
        'users.role as user_role'
      );

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Get all answers with questions
    const answers = await db('survey_answers')
      .join('survey_questions', 'survey_answers.question_id', 'survey_questions.id')
      .where('survey_answers.response_id', responseId)
      .orderBy('survey_questions.order', 'asc')
      .select(
        'survey_answers.*',
        'survey_questions.question_text',
        'survey_questions.question_type',
        'survey_questions.options',
        'survey_questions.correct_answer',
        'survey_questions.marks as total_marks'
      );

    res.json({
      success: true,
      data: {
        response,
        answers: answers.map(a => ({
          ...a,
          answer_data: a.answer_data ? (typeof a.answer_data === 'string' ? JSON.parse(a.answer_data) : a.answer_data) : null,
          options: a.options ? (typeof a.options === 'string' ? JSON.parse(a.options) : a.options) : null
        }))
      }
    });
  } catch (error) {
    console.error('Get individual response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch response details'
    });
  }
});

/**
 * POST /api/survey-analytics/:surveyId/individual/:responseId/grade
 * Manually grade a response (for subjective questions)
 */
router.post('/:surveyId/individual/:responseId/grade', async (req, res) => {
  try {
    const { surveyId, responseId } = req.params;
    const { answers, overall_feedback } = req.body;
    const schoolId = req.user.schoolId;
    const graderId = req.user.id;

    // Verify survey belongs to school
    const survey = await db('surveys')
      .where('id', surveyId)
      .where('school_id', schoolId)
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Update each answer with grades
    let totalScore = 0;
    for (const answerGrade of answers) {
      await db('survey_answers')
        .where('id', answerGrade.answer_id)
        .update({
          marks_obtained: answerGrade.marks_obtained,
          feedback: answerGrade.feedback,
          updated_at: db.fn.now()
        });
      
      totalScore += answerGrade.marks_obtained || 0;
    }

    // Calculate percentage
    const percentage = survey.total_marks > 0 ? (totalScore / survey.total_marks) * 100 : 0;
    const passed = survey.passing_marks ? totalScore >= survey.passing_marks : null;

    // Update response
    await db('survey_responses')
      .where('id', responseId)
      .update({
        score: totalScore,
        percentage: percentage.toFixed(2),
        passed,
        feedback: overall_feedback,
        graded_by: graderId,
        graded_at: db.fn.now(),
        status: 'graded',
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Response graded successfully'
    });
  } catch (error) {
    console.error('Grade response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade response'
    });
  }
});

module.exports = router;
