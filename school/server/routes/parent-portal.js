const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Middleware to ensure only parents can access
const requireParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Parents only.'
    });
  }
  next();
};

// Middleware to verify parent has access to specific child
const verifyChildAccess = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const userId = req.user.id;

    // Get parent ID from user ID
    const parent = await db('parents')
      .where('user_id', userId)
      .first('id');

    if (!parent) {
      return res.status(403).json({
        success: false,
        message: 'Parent record not found'
      });
    }

    // Check if this child belongs to this parent
    const relationship = await db('student_parents')
      .where('parent_id', parent.id)
      .where('student_id', childId)
      .first();

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this child\'s data'
      });
    }

    req.parentId = parent.id;
    next();
  } catch (error) {
    console.error('Verify child access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify access'
    });
  }
};

// Apply authentication and parent check to all routes
router.use(authenticateToken);
router.use(requireParent);

// ==================== GET ALL CHILDREN ====================

/**
 * GET /api/parent/children
 * Get all children linked to this parent
 */
router.get('/children', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get parent ID
    const parent = await db('parents')
      .where('user_id', userId)
      .first('id');

    if (!parent) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get all children linked to this parent
    const children = await db('student_parents')
      .join('students', 'student_parents.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('student_parents.parent_id', parent.id)
      .select(
        'students.id',
        'users.name',
        'students.roll_number',
        'students.admission_number',
        'classes.name as class_name',
        'student_parents.relationship'
      );

    // Get grades and attendance for each child
    const childrenWithStats = await Promise.all(
      children.map(async (child) => {
        // Get grades
        const grades = await db('grades')
          .where('student_id', child.id)
          .select('*');

        const avgPercentage = grades.length > 0
          ? grades.reduce((sum, g) => sum + (calculateTotalPercentage(g) || 0), 0) / grades.length
          : 0;
        const gpa = (avgPercentage / 10).toFixed(2);

        // Get attendance
        const attendanceRecords = await db('attendance')
          .where('student_id', child.id)
          .select('status');

        const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
        const attendance_percentage = attendanceRecords.length > 0
          ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
          : 0;

        // Get class rank (mock for now)
        const class_rank = Math.floor(Math.random() * 40) + 1;

        return {
          ...child,
          gpa: parseFloat(gpa),
          attendance_percentage: parseFloat(attendance_percentage),
          class_rank
        };
      })
    );

    res.json({
      success: true,
      data: childrenWithStats
    });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch children information'
    });
  }
});

// ==================== CHILD'S GRADES ====================

/**
 * GET /api/parent/child/:childId/grades
 * Get specific child's grades
 */
router.get('/child/:childId/grades', verifyChildAccess, async (req, res) => {
  try {
    const { childId } = req.params;
    const { term } = req.query;

    // Get child info
    const child = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('students.id', childId)
      .first(
        'students.id',
        'users.name',
        'students.roll_number',
        'classes.name as class_name'
      );

    // Get grades
    let query = db('grades')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .join('users as teachers', 'subjects.teacher_id', 'teachers.id')
      .where('grades.student_id', childId)
      .select(
        'grades.*',
        'subjects.name as subject_name',
        'teachers.name as teacher_name'
      )
      .orderBy('subjects.name');

    if (term && term !== 'all') {
      query = query.where('grades.term', term);
    }

    const grades = await query;

    const formattedGrades = grades.map(grade => ({
      ...grade,
      exam_score: grade.exam_score || 0,
      assignment_score: grade.assignment_score || 0,
      project_score: grade.project_score || 0,
      percentage: calculateTotalPercentage(grade)
    }));

    res.json({
      success: true,
      data: {
        child,
        grades: formattedGrades
      }
    });
  } catch (error) {
    console.error('Get child grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades'
    });
  }
});

// ==================== CHILD'S ATTENDANCE ====================

/**
 * GET /api/parent/child/:childId/attendance
 * Get specific child's attendance
 */
router.get('/child/:childId/attendance', verifyChildAccess, async (req, res) => {
  try {
    const { childId } = req.params;
    const { month, year } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Get child info
    const child = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('students.id', childId)
      .first(
        'students.id',
        'users.name',
        'students.roll_number',
        'classes.name as class_name'
      );

    // Get attendance records
    const records = await db('attendance')
      .where('student_id', childId)
      .whereRaw('EXTRACT(YEAR FROM date) = ?', [currentYear])
      .whereRaw('EXTRACT(MONTH FROM date) = ?', [currentMonth])
      .orderBy('date', 'desc');

    // Calculate summary
    const summary = {
      total_days: records.length,
      present_days: records.filter(r => r.status === 'present').length,
      absent_days: records.filter(r => r.status === 'absent').length,
      late_days: records.filter(r => r.status === 'late').length
    };

    res.json({
      success: true,
      data: {
        child,
        records,
        summary
      }
    });
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
});

// ==================== CHILD'S FEES ====================

/**
 * GET /api/parent/child/:childId/fees
 * Get specific child's fee information
 */
router.get('/child/:childId/fees', verifyChildAccess, async (req, res) => {
  try {
    const { childId } = req.params;

    // Get child info
    const child = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('students.id', childId)
      .first(
        'students.id',
        'users.name',
        'students.roll_number',
        'classes.name as class_name',
        'students.total_fees',
        'students.paid_fees'
      );

    // Get payment history
    const paymentHistory = await db('payments')
      .where('student_id', childId)
      .where('payment_type', 'fee')
      .orderBy('payment_date', 'desc')
      .select('*');

    const totalFees = child.total_fees || 50000;
    const paidAmount = child.paid_fees || 30000;

    res.json({
      success: true,
      data: {
        child: {
          id: child.id,
          name: child.name,
          roll_number: child.roll_number,
          class_name: child.class_name
        },
        fees: {
          total_fees: totalFees,
          paid_amount: paidAmount,
          pending_amount: totalFees - paidAmount,
          payment_history: paymentHistory
        }
      }
    });
  } catch (error) {
    console.error('Get child fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee information'
    });
  }
});

// ==================== CHILD'S TIMETABLE ====================

/**
 * GET /api/parent/child/:childId/timetable
 * Get specific child's timetable
 */
router.get('/child/:childId/timetable', verifyChildAccess, async (req, res) => {
  try {
    const { childId } = req.params;

    // Get child info
    const child = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('students.id', childId)
      .first(
        'students.id',
        'users.name',
        'students.roll_number',
        'students.class_id',
        'classes.name as class_name'
      );

    if (!child || !child.class_id) {
      return res.json({
        success: true,
        data: {
          child: {
            id: child?.id,
            name: child?.name,
            roll_number: child?.roll_number,
            class_name: child?.class_name
          },
          timetable: []
        }
      });
    }

    // Get timetable for the child's class
    const timetable = await db('timetable')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .join('users as teachers', 'subjects.teacher_id', 'teachers.id')
      .where('timetable.class_id', child.class_id)
      .orderBy('timetable.day_of_week')
      .orderBy('timetable.start_time')
      .select(
        'timetable.*',
        'subjects.name as subject_name',
        'teachers.name as teacher_name'
      );

    res.json({
      success: true,
      data: {
        child: {
          id: child.id,
          name: child.name,
          roll_number: child.roll_number,
          class_name: child.class_name
        },
        timetable
      }
    });
  } catch (error) {
    console.error('Get child timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable'
    });
  }
});

// ==================== CHILD'S ASSIGNMENTS ====================

/**
 * GET /api/parent/child/:childId/assignments
 * Get specific child's assignments
 */
router.get('/child/:childId/assignments', verifyChildAccess, async (req, res) => {
  try {
    const { childId } = req.params;

    // Get child info
    const child = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('students.id', childId)
      .first(
        'students.id',
        'users.name',
        'students.roll_number',
        'classes.name as class_name'
      );

    // Mock assignments data (would query assignments table in production)
    const assignments = [
      {
        id: 1,
        title: 'Mathematics - Chapter 5 Problems',
        subject_name: 'Mathematics',
        teacher_name: 'Mr. Kumar',
        description: 'Solve problems 1-20 from Chapter 5',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 2,
        title: 'Science - Lab Report',
        subject_name: 'Science',
        teacher_name: 'Dr. Patel',
        description: 'Submit detailed lab report for Experiment 3',
        due_date: new Date(Date.now() + 6 * 86400000).toISOString(),
        status: 'pending',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 3,
        title: 'English Essay - "Climate Change"',
        subject_name: 'English',
        teacher_name: 'Ms. Sharma',
        description: 'Write a 1000-word essay on climate change',
        due_date: new Date(Date.now() - 3 * 86400000).toISOString(),
        status: 'graded',
        submitted_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        grade: 'A+',
        score: 95,
        feedback: 'Excellent work! Well-researched and articulated.'
      }
    ];

    res.json({
      success: true,
      data: {
        child: {
          id: child.id,
          name: child.name,
          roll_number: child.roll_number,
          class_name: child.class_name
        },
        assignments
      }
    });
  } catch (error) {
    console.error('Get child assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

function calculateTotalPercentage(grade) {
  const examWeight = 0.5;
  const assignmentWeight = 0.3;
  const projectWeight = 0.2;

  const examScore = grade.exam_score || 0;
  const assignmentScore = grade.assignment_score || 0;
  const projectScore = grade.project_score || 0;

  return (examScore * examWeight) + (assignmentScore * assignmentWeight) + (projectScore * projectWeight);
}

module.exports = router;
