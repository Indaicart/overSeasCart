const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * POST /api/survey-responses/start/:surveyId
 * Start a new survey/quiz response
 */
router.post('/start/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.id;

    // Check if survey exists and is published
    const survey = await db('surveys')
      .where('id', surveyId)
      .where('status', 'published')
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found or not available'
      });
    }

    // Check if user has already taken it
    const existingResponse = await db('survey_responses')
      .where('survey_id', surveyId)
      .where('user_id', userId)
      .first();

    if (existingResponse && !survey.allow_retake) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed this survey'
      });
    }

    // Create new response
    const [response] = await db('survey_responses')
      .insert({
        survey_id: surveyId,
        user_id: userId,
        status: 'in_progress',
        total_marks: survey.total_marks
      })
      .returning('*');

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Start survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start survey'
    });
  }
});

/**
 * POST /api/survey-responses/:responseId/answer
 * Save answer to a question
 */
router.post('/:responseId/answer', async (req, res) => {
  try {
    const { responseId } = req.params;
    const { question_id, answer_text, answer_data } = req.body;
    const userId = req.user.id;

    // Verify response belongs to user
    const response = await db('survey_responses')
      .where('id', responseId)
      .where('user_id', userId)
      .first();

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Get question details
    const question = await db('survey_questions')
      .where('id', question_id)
      .where('survey_id', response.survey_id)
      .first();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if answer already exists
    const existingAnswer = await db('survey_answers')
      .where('response_id', responseId)
      .where('question_id', question_id)
      .first();

    if (existingAnswer) {
      // Update existing answer
      await db('survey_answers')
        .where('id', existingAnswer.id)
        .update({
          answer_text,
          answer_data: answer_data ? JSON.stringify(answer_data) : null,
          updated_at: db.fn.now()
        });
    } else {
      // Insert new answer
      await db('survey_answers').insert({
        response_id: responseId,
        question_id: question_id,
        answer_text,
        answer_data: answer_data ? JSON.stringify(answer_data) : null,
        marks_total: question.marks
      });
    }

    res.json({
      success: true,
      message: 'Answer saved'
    });
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save answer'
    });
  }
});

/**
 * POST /api/survey-responses/:responseId/submit
 * Submit completed survey/quiz
 */
router.post('/:responseId/submit', async (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = req.user.id;

    // Verify response belongs to user
    const response = await db('survey_responses')
      .where('id', responseId)
      .where('user_id', userId)
      .first();

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Get survey details
    const survey = await db('surveys')
      .where('id', response.survey_id)
      .first();

    // If it's a quiz, auto-grade objective questions
    if (survey.type === 'quiz') {
      await autoGradeResponse(responseId);
    }

    // Update response status
    await db('survey_responses')
      .where('id', responseId)
      .update({
        status: survey.type === 'quiz' ? 'graded' : 'submitted',
        submitted_at: db.fn.now(),
        updated_at: db.fn.now()
      });

    // Get final response with scores
    const finalResponse = await db('survey_responses')
      .where('id', responseId)
      .first();

    res.json({
      success: true,
      data: finalResponse,
      message: survey.type === 'quiz' ? 'Quiz submitted and auto-graded' : 'Survey submitted successfully'
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit response'
    });
  }
});

/**
 * GET /api/survey-responses/:responseId/result
 * Get response result
 */
router.get('/:responseId/result', async (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = req.user.id;

    const response = await db('survey_responses')
      .join('surveys', 'survey_responses.survey_id', 'surveys.id')
      .where('survey_responses.id', responseId)
      .where('survey_responses.user_id', userId)
      .first(
        'survey_responses.*',
        'surveys.title as survey_title',
        'surveys.type as survey_type',
        'surveys.show_results_immediately'
      );

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    if (!response.show_results_immediately && response.status !== 'graded') {
      return res.status(403).json({
        success: false,
        message: 'Results not available yet'
      });
    }

    // Get all answers with questions
    const answers = await db('survey_answers')
      .join('survey_questions', 'survey_answers.question_id', 'survey_questions.id')
      .where('survey_answers.response_id', responseId)
      .select(
        'survey_answers.*',
        'survey_questions.question_text',
        'survey_questions.question_type',
        'survey_questions.marks',
        'survey_questions.correct_answer',
        'survey_questions.options'
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
    console.error('Get result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch result'
    });
  }
});

/**
 * GET /api/survey-responses/my-responses
 * Get all responses by current user
 */
router.get('/my-responses/list', async (req, res) => {
  try {
    const userId = req.user.id;

    const responses = await db('survey_responses')
      .join('surveys', 'survey_responses.survey_id', 'surveys.id')
      .where('survey_responses.user_id', userId)
      .orderBy('survey_responses.created_at', 'desc')
      .select(
        'survey_responses.*',
        'surveys.title as survey_title',
        'surveys.type as survey_type',
        'surveys.total_marks'
      );

    res.json({
      success: true,
      data: responses
    });
  } catch (error) {
    console.error('Get my responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch responses'
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Auto-grade objective questions in a quiz
 */
async function autoGradeResponse(responseId) {
  try {
    // Get all answers for this response
    const answers = await db('survey_answers')
      .join('survey_questions', 'survey_answers.question_id', 'survey_questions.id')
      .where('survey_answers.response_id', responseId)
      .select(
        'survey_answers.*',
        'survey_questions.question_type',
        'survey_questions.correct_answer',
        'survey_questions.correct_answers',
        'survey_questions.marks'
      );

    let totalScore = 0;

    for (const answer of answers) {
      let marksObtained = 0;
      let isCorrect = false;

      // Auto-grade based on question type
      if (answer.question_type === 'multiple_choice' || answer.question_type === 'true_false' || answer.question_type === 'dropdown') {
        if (answer.answer_text === answer.correct_answer) {
          marksObtained = answer.marks;
          isCorrect = true;
        }
      } else if (answer.question_type === 'checkbox') {
        // For checkbox, compare arrays
        const userAnswers = answer.answer_data ? (typeof answer.answer_data === 'string' ? JSON.parse(answer.answer_data) : answer.answer_data) : [];
        const correctAnswers = answer.correct_answers ? (typeof answer.correct_answers === 'string' ? JSON.parse(answer.correct_answers) : answer.correct_answers) : [];
        
        if (JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort())) {
          marksObtained = answer.marks;
          isCorrect = true;
        }
      }
      // Short/long answers need manual grading

      totalScore += marksObtained;

      // Update answer with marks
      await db('survey_answers')
        .where('id', answer.id)
        .update({
          marks_obtained: marksObtained,
          is_correct: isCorrect
        });
    }

    // Get total marks
    const response = await db('survey_responses')
      .where('id', responseId)
      .first();

    const percentage = response.total_marks > 0 ? (totalScore / response.total_marks) * 100 : 0;

    // Get survey to check passing marks
    const survey = await db('surveys')
      .where('id', response.survey_id)
      .first();

    const passed = survey.passing_marks ? totalScore >= survey.passing_marks : null;

    // Update response with score
    await db('survey_responses')
      .where('id', responseId)
      .update({
        score: totalScore,
        percentage: percentage.toFixed(2),
        passed,
        graded_at: db.fn.now()
      });

  } catch (error) {
    console.error('Auto-grade error:', error);
    throw error;
  }
}

module.exports = router;
