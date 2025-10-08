const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Middleware to ensure only students can access
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Students only.'
    });
  }
  next();
};

// Apply authentication and student check to all routes
router.use(authenticateToken);
router.use(requireStudent);

// ==================== MY GRADES ====================

/**
 * GET /api/student/grades
 * Get student's grades across all subjects
 */
router.get('/grades', async (req, res) => {
  try {
    const { term } = req.query;
    const studentId = req.user.id;

    let query = db('grades')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .join('users as teachers', 'subjects.teacher_id', 'teachers.id')
      .where('grades.student_id', studentId)
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

    // Calculate additional metrics
    const formattedGrades = grades.map(grade => ({
      ...grade,
      exam_score: grade.exam_score || 0,
      assignment_score: grade.assignment_score || 0,
      project_score: grade.project_score || 0,
      percentage: calculateTotalPercentage(grade)
    }));

    res.json({
      success: true,
      data: formattedGrades
    });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades'
    });
  }
});

// ==================== MY ATTENDANCE ====================

/**
 * GET /api/student/attendance
 * Get student's attendance records
 */
router.get('/attendance', async (req, res) => {
  try {
    const { month, year } = req.query;
    const studentId = req.user.id;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Get attendance records
    const records = await db('attendance')
      .where('student_id', studentId)
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
        records,
        summary
      }
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
});

// ==================== MY FEES ====================

/**
 * GET /api/student/fees
 * Get student's fee information
 */
router.get('/fees', async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's fee structure (from students table or fees table)
    const feeInfo = await db('students')
      .where('user_id', studentId)
      .first('total_fees', 'paid_fees');

    // Get payment history from payments table
    const paymentHistory = await db('payments')
      .join('students', 'payments.student_id', 'students.id')
      .where('students.user_id', studentId)
      .where('payments.payment_type', 'fee')
      .orderBy('payments.payment_date', 'desc')
      .select('payments.*');

    // Calculate upcoming payments
    const totalFees = feeInfo?.total_fees || 50000;
    const paidAmount = feeInfo?.paid_fees || 30000;
    const pendingAmount = totalFees - paidAmount;

    const upcomingPayments = pendingAmount > 0 ? [
      {
        id: 1,
        description: 'Term 2 Fee',
        amount: pendingAmount,
        due_date: '2024-10-15'
      }
    ] : [];

    res.json({
      success: true,
      data: {
        total_fees: totalFees,
        paid_amount: paidAmount,
        pending_amount: pendingAmount,
        payment_history: paymentHistory,
        upcoming_payments: upcomingPayments
      }
    });
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee information'
    });
  }
});

// ==================== MY TIMETABLE ====================

/**
 * GET /api/student/timetable
 * Get student's class timetable
 */
router.get('/timetable', async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's class
    const student = await db('students')
      .where('user_id', studentId)
      .first('class_id');

    if (!student || !student.class_id) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get timetable for the student's class
    const timetable = await db('timetable')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .join('users as teachers', 'subjects.teacher_id', 'teachers.id')
      .where('timetable.class_id', student.class_id)
      .orderBy('timetable.day_of_week')
      .orderBy('timetable.start_time')
      .select(
        'timetable.*',
        'subjects.name as subject_name',
        'teachers.name as teacher_name'
      );

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Get student timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable'
    });
  }
});

// ==================== MY ASSIGNMENTS ====================

/**
 * GET /api/student/assignments
 * Get student's assignments
 */
router.get('/assignments', async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's assignments
    // For now, returning mock data. In production, this would query an assignments table
    const assignments = [
      {
        id: 1,
        title: 'Mathematics - Chapter 5 Problems',
        subject_name: 'Mathematics',
        teacher_name: 'Mr. Kumar',
        description: 'Solve problems 1-20 from Chapter 5',
        due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'pending',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 2,
        title: 'Science - Lab Report',
        subject_name: 'Science',
        teacher_name: 'Dr. Patel',
        description: 'Submit detailed lab report for Experiment 3',
        due_date: new Date(Date.now() + 6 * 86400000).toISOString(), // 6 days
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
      },
      {
        id: 4,
        title: 'History Project',
        subject_name: 'Social Studies',
        teacher_name: 'Mr. Singh',
        description: 'Create a presentation on Indian Independence',
        due_date: new Date(Date.now() - 1 * 86400000).toISOString(),
        status: 'submitted',
        submitted_at: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
});

/**
 * POST /api/student/assignments/:id/submit
 * Submit an assignment
 */
router.post('/assignments/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const { fileUrl } = req.body;

    // In production, this would update the assignments table
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment'
    });
  }
});

// ==================== MY DOCUMENTS ====================

/**
 * GET /api/student/documents
 * Get student's documents
 */
router.get('/documents', async (req, res) => {
  try {
    const studentId = req.user.id;

    // For now, returning mock data. In production, this would query a documents table
    const documents = [
      {
        id: 1,
        title: 'Science Fair Participation Certificate',
        description: 'Certificate for participating in Annual Science Fair 2024',
        category: 'certificates',
        file_type: 'PDF',
        file_size: '1.2 MB',
        file_url: '/documents/cert_science_fair_2024.pdf',
        created_at: '2024-09-15T00:00:00Z'
      },
      {
        id: 2,
        title: 'Merit Certificate - Term 1',
        description: 'Academic excellence certificate for Term 1',
        category: 'certificates',
        file_type: 'PDF',
        file_size: '850 KB',
        file_url: '/documents/cert_merit_term1.pdf',
        created_at: '2024-08-10T00:00:00Z'
      },
      {
        id: 3,
        title: 'Grade 10 - Term 1 Report Card',
        description: 'Academic performance report for first term',
        category: 'reports',
        file_type: 'PDF',
        file_size: '2.5 MB',
        file_url: '/documents/report_grade10_term1.pdf',
        created_at: '2024-08-20T00:00:00Z'
      },
      {
        id: 4,
        title: 'Grade 9 - Final Report Card',
        description: 'Final year performance report',
        category: 'reports',
        file_type: 'PDF',
        file_size: '2.8 MB',
        file_url: '/documents/report_grade9_final.pdf',
        created_at: '2024-03-30T00:00:00Z'
      },
      {
        id: 5,
        title: 'Student ID Card 2024-25',
        description: 'Valid student identification card',
        category: 'id_cards',
        file_type: 'PDF',
        file_size: '500 KB',
        file_url: '/documents/id_card_2024.pdf',
        created_at: '2024-07-01T00:00:00Z'
      },
      {
        id: 6,
        title: 'Mathematics - Formula Sheet',
        description: 'Important formulas for Class 10',
        category: 'materials',
        file_type: 'PDF',
        file_size: '1.5 MB',
        file_url: '/materials/math_formulas.pdf',
        created_at: '2024-06-15T00:00:00Z'
      },
      {
        id: 7,
        title: 'Science - Chapter 5 Notes',
        description: 'Detailed notes for Biology Chapter 5',
        category: 'materials',
        file_type: 'PDF',
        file_size: '3.2 MB',
        file_url: '/materials/science_ch5_notes.pdf',
        created_at: '2024-09-01T00:00:00Z'
      }
    ];

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get student documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// ==================== DASHBOARD SUMMARY ====================

/**
 * GET /api/student/dashboard-summary
 * Get summary data for student dashboard
 */
router.get('/dashboard-summary', async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get GPA
    const grades = await db('grades')
      .where('student_id', studentId)
      .select('*');
    
    const avgPercentage = grades.length > 0
      ? grades.reduce((sum, g) => sum + (calculateTotalPercentage(g) || 0), 0) / grades.length
      : 0;
    const gpa = (avgPercentage / 10).toFixed(2);

    // Get attendance percentage
    const attendanceRecords = await db('attendance')
      .where('student_id', studentId)
      .select('status');
    
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const attendancePercentage = attendanceRecords.length > 0
      ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
      : 0;

    // Get pending assignments count (mock)
    const pendingAssignments = 3;

    // Get upcoming events (mock)
    const upcomingEvents = [
      { title: 'Mid-term Exams', date: '2024-10-10' },
      { title: 'Sports Day', date: '2024-10-20' },
      { title: 'Fee Payment Due', date: '2024-10-15' }
    ];

    res.json({
      success: true,
      data: {
        gpa,
        attendance_percentage: attendancePercentage,
        pending_assignments: pendingAssignments,
        upcoming_events: upcomingEvents
      }
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary'
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
