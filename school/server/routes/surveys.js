const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== ADMIN ROUTES (Create/Manage Surveys) ====================

/**
 * GET /api/surveys/manage
 * Get all surveys created by school admin
 */
router.get('/manage', requireAdmin, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const surveys = await db('surveys')
      .join('users as creators', 'surveys.created_by', 'creators.id')
      .where('surveys.school_id', schoolId)
      .orderBy('surveys.created_at', 'desc')
      .select(
        'surveys.*',
        'creators.name as creator_name'
      );

    // Get response counts for each survey
    const surveysWithStats = await Promise.all(
      surveys.map(async (survey) => {
        const responseStats = await db('survey_responses')
          .where('survey_id', survey.id)
          .count('* as total')
          .count(db.raw('CASE WHEN status = ? THEN 1 END as submitted', ['submitted']))
          .first();

        const questionCount = await db('survey_questions')
          .where('survey_id', survey.id)
          .count('* as count')
          .first();

        return {
          ...survey,
          total_responses: parseInt(responseStats.total || 0),
          submitted_responses: parseInt(responseStats.submitted || 0),
          question_count: parseInt(questionCount.count || 0)
        };
      })
    );

    res.json({
      success: true,
      data: surveysWithStats
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch surveys'
    });
  }
});

/**
 * POST /api/surveys
 * Create a new survey or quiz
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      target_audience,
      target_classes,
      target_students,
      total_marks,
      passing_marks,
      duration_minutes,
      shuffle_questions,
      show_results_immediately,
      allow_retake,
      start_date,
      end_date,
      is_anonymous,
      is_mandatory,
      questions
    } = req.body;

    const schoolId = req.user.schoolId;
    const userId = req.user.id;

    // Create survey
    const [survey] = await db('surveys')
      .insert({
        school_id: schoolId,
        created_by: userId,
        title,
        description,
        type,
        target_audience,
        target_classes: target_classes || null,
        target_students: target_students || null,
        total_marks: type === 'quiz' ? total_marks : null,
        passing_marks: type === 'quiz' ? passing_marks : null,
        duration_minutes,
        shuffle_questions: shuffle_questions || false,
        show_results_immediately: show_results_immediately !== false,
        allow_retake: allow_retake || false,
        start_date,
        end_date,
        is_anonymous: is_anonymous || false,
        is_mandatory: is_mandatory || false,
        status: 'draft'
      })
      .returning('*');

    // Create questions
    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map((q, index) => ({
        survey_id: survey.id,
        order: index + 1,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options ? JSON.stringify(q.options) : null,
        marks: type === 'quiz' ? q.marks : null,
        correct_answer: type === 'quiz' ? q.correct_answer : null,
        correct_answers: type === 'quiz' && q.correct_answers ? JSON.stringify(q.correct_answers) : null,
        is_required: q.is_required !== false,
        help_text: q.help_text
      }));

      await db('survey_questions').insert(questionsToInsert);
    }

    res.json({
      success: true,
      data: survey,
      message: `${type === 'quiz' ? 'Quiz' : 'Survey'} created successfully`
    });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create survey'
    });
  }
});

/**
 * GET /api/surveys/:id
 * Get survey details with questions
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const survey = await db('surveys')
      .where('id', id)
      .where('school_id', schoolId)
      .first('*');

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    const questions = await db('survey_questions')
      .where('survey_id', id)
      .orderBy('order', 'asc')
      .select('*');

    res.json({
      success: true,
      data: {
        ...survey,
        questions: questions.map(q => ({
          ...q,
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null,
          correct_answers: q.correct_answers ? (typeof q.correct_answers === 'string' ? JSON.parse(q.correct_answers) : q.correct_answers) : null
        }))
      }
    });
  } catch (error) {
    console.error('Get survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch survey'
    });
  }
});

/**
 * PUT /api/surveys/:id
 * Update survey
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;
    const updateData = req.body;

    // Check if survey exists and belongs to school
    const survey = await db('surveys')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Update survey
    await db('surveys')
      .where('id', id)
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Survey updated successfully'
    });
  } catch (error) {
    console.error('Update survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update survey'
    });
  }
});

/**
 * POST /api/surveys/:id/publish
 * Publish a draft survey
 */
router.post('/:id/publish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const survey = await db('surveys')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check if survey has questions
    const questionCount = await db('survey_questions')
      .where('survey_id', id)
      .count('* as count')
      .first();

    if (parseInt(questionCount.count) === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish survey without questions'
      });
    }

    await db('surveys')
      .where('id', id)
      .update({
        status: 'published',
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Survey published successfully'
    });
  } catch (error) {
    console.error('Publish survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish survey'
    });
  }
});

/**
 * DELETE /api/surveys/:id
 * Delete survey
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const survey = await db('surveys')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    await db('surveys').where('id', id).delete();

    res.json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete survey'
    });
  }
});

// ==================== USER ROUTES (Take Surveys) ====================

/**
 * GET /api/surveys/available
 * Get surveys available for current user to take
 */
router.get('/available/list', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const schoolId = req.user.schoolId;

    // Get user's class if student or teacher
    let userClassIds = [];
    if (userRole === 'student') {
      const student = await db('students')
        .where('user_id', userId)
        .first('class_id');
      if (student && student.class_id) {
        userClassIds = [student.class_id];
      }
    }

    // Build query for available surveys
    let query = db('surveys')
      .where('school_id', schoolId)
      .where('status', 'published')
      .where(function() {
        this.whereNull('start_date')
          .orWhere('start_date', '<=', db.fn.now());
      })
      .where(function() {
        this.whereNull('end_date')
          .orWhere('end_date', '>=', db.fn.now());
      });

    // Filter by target audience
    query = query.where(function() {
      this.where('target_audience', 'all')
        .orWhere('target_audience', userRole + 's')
        .orWhere('target_audience', 'both');
    });

    const surveys = await query.select('surveys.*');

    // Filter out surveys user has already completed (if retake not allowed)
    const availableSurveys = await Promise.all(
      surveys.map(async (survey) => {
        const existingResponse = await db('survey_responses')
          .where('survey_id', survey.id)
          .where('user_id', userId)
          .where('status', 'submitted')
          .first();

        const questionCount = await db('survey_questions')
          .where('survey_id', survey.id)
          .count('* as count')
          .first();

        const canTake = !existingResponse || survey.allow_retake;

        return {
          ...survey,
          question_count: parseInt(questionCount.count || 0),
          has_taken: !!existingResponse,
          can_take: canTake,
          user_response_id: existingResponse?.id || null
        };
      })
    );

    res.json({
      success: true,
      data: availableSurveys.filter(s => s.can_take)
    });
  } catch (error) {
    console.error('Get available surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available surveys'
    });
  }
});

module.exports = router;
