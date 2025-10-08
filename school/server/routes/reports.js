const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * GET /api/reports/dashboard
 * Get dashboard overview statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { schoolId } = req.user;

    // Get overall stats
    const [studentCount] = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .count('* as count');

    const [teacherCount] = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .count('* as count');

    const [classCount] = await db('classes')
      .where('school_id', schoolId)
      .count('* as count');

    // Get today's attendance rate
    const today = new Date().toISOString().split('T')[0];
    const [totalStudentsToday] = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .count('* as count');

    const [presentToday] = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .where('attendance.date', today)
      .where('attendance.status', 'present')
      .count('* as count');

    const attendanceRate = totalStudentsToday.count > 0 
      ? ((presentToday.count / totalStudentsToday.count) * 100).toFixed(1)
      : 0;

    // Get pending fees
    const [pendingFees] = await db('fees')
      .join('students', 'fees.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .where('fees.status', 'pending')
      .sum('fees.amount as total');

    // Get collected fees this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const [collectedThisMonth] = await db('fees')
      .join('students', 'fees.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .where('fees.status', 'paid')
      .where('fees.updated_at', '>=', firstDayOfMonth)
      .sum('fees.amount as total');

    res.json({
      success: true,
      data: {
        totalStudents: parseInt(studentCount.count),
        totalTeachers: parseInt(teacherCount.count),
        totalClasses: parseInt(classCount.count),
        attendanceRate: parseFloat(attendanceRate),
        pendingFees: parseFloat(pendingFees.total) || 0,
        collectedThisMonth: parseFloat(collectedThisMonth.total) || 0
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

/**
 * GET /api/reports/attendance
 * Get attendance report with trends
 */
router.get('/attendance', async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { startDate, endDate, classId } = req.query;

    let query = db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('users.school_id', schoolId);

    if (startDate) query = query.where('attendance.date', '>=', startDate);
    if (endDate) query = query.where('attendance.date', '<=', endDate);
    if (classId) query = query.where('students.class_id', classId);

    // Get attendance by status
    const statusCounts = await query.clone()
      .select('attendance.status')
      .count('* as count')
      .groupBy('attendance.status');

    // Get attendance trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendData = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .where('attendance.date', '>=', thirtyDaysAgo.toISOString().split('T')[0])
      .select('attendance.date', 'attendance.status')
      .count('* as count')
      .groupBy('attendance.date', 'attendance.status')
      .orderBy('attendance.date');

    // Get class-wise attendance
    const classWise = await query.clone()
      .select('classes.id', 'classes.name', 'attendance.status')
      .count('* as count')
      .groupBy('classes.id', 'classes.name', 'attendance.status');

    // Get students with low attendance
    const lowAttendance = await db.raw(`
      SELECT 
        u.name as student_name,
        c.name as class_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(*) as total_days,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE u.school_id = ?
      GROUP BY u.name, c.name
      HAVING attendance_percentage < 75
      ORDER BY attendance_percentage ASC
      LIMIT 10
    `, [schoolId]);

    res.json({
      success: true,
      data: {
        statusCounts,
        trendData,
        classWise,
        lowAttendance: lowAttendance.rows || lowAttendance
      }
    });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report'
    });
  }
});

/**
 * GET /api/reports/grades
 * Get grade distribution and performance report
 */
router.get('/grades', async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId, subjectId } = req.query;

    let query = db('grades')
      .join('students', 'grades.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('users.school_id', schoolId);

    if (classId) query = query.where('students.class_id', classId);
    if (subjectId) query = query.where('grades.subject_id', subjectId);

    // Get grade distribution
    const gradeDistribution = await query.clone()
      .select('grades.grade')
      .count('* as count')
      .groupBy('grades.grade');

    // Get subject-wise average
    const subjectWise = await query.clone()
      .select('subjects.name as subject_name')
      .avg('grades.marks_obtained as avg_marks')
      .groupBy('subjects.name');

    // Get class-wise average
    const classWise = await query.clone()
      .select('classes.name as class_name')
      .avg('grades.marks_obtained as avg_marks')
      .groupBy('classes.name');

    // Get top performers
    const topPerformers = await db.raw(`
      SELECT 
        u.name as student_name,
        c.name as class_name,
        AVG(g.marks_obtained) as avg_marks,
        COUNT(*) as total_assessments
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE u.school_id = ?
      GROUP BY u.name, c.name
      ORDER BY avg_marks DESC
      LIMIT 10
    `, [schoolId]);

    // Get failing students
    const failingStudents = await db.raw(`
      SELECT 
        u.name as student_name,
        c.name as class_name,
        sub.name as subject_name,
        g.marks_obtained,
        g.total_marks,
        g.grade
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      JOIN subjects sub ON g.subject_id = sub.id
      WHERE u.school_id = ? AND g.grade IN ('F', 'Fail')
      ORDER BY g.marks_obtained ASC
      LIMIT 20
    `, [schoolId]);

    res.json({
      success: true,
      data: {
        gradeDistribution,
        subjectWise,
        classWise,
        topPerformers: topPerformers.rows || topPerformers,
        failingStudents: failingStudents.rows || failingStudents
      }
    });
  } catch (error) {
    console.error('Grade report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade report'
    });
  }
});

/**
 * GET /api/reports/fees
 * Get fee collection report
 */
router.get('/fees', async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { startDate, endDate } = req.query;

    let query = db('fees')
      .join('students', 'fees.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('users.school_id', schoolId);

    if (startDate) query = query.where('fees.due_date', '>=', startDate);
    if (endDate) query = query.where('fees.due_date', '<=', endDate);

    // Get status-wise summary
    const statusSummary = await query.clone()
      .select('fees.status')
      .sum('fees.amount as total')
      .count('* as count')
      .groupBy('fees.status');

    // Get monthly collection trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrend = await db.raw(`
      SELECT 
        TO_CHAR(f.updated_at, 'YYYY-MM') as month,
        SUM(f.amount) as collected
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE u.school_id = ? 
        AND f.status = 'paid'
        AND f.updated_at >= ?
      GROUP BY TO_CHAR(f.updated_at, 'YYYY-MM')
      ORDER BY month
    `, [schoolId, twelveMonthsAgo.toISOString()]);

    // Get class-wise collection
    const classWise = await query.clone()
      .select('classes.name as class_name', 'fees.status')
      .sum('fees.amount as total')
      .groupBy('classes.name', 'fees.status');

    // Get defaulters (pending fees)
    const defaulters = await query.clone()
      .select(
        'users.name as student_name',
        'classes.name as class_name',
        'fees.amount',
        'fees.due_date',
        'fees.description'
      )
      .where('fees.status', 'pending')
      .where('fees.due_date', '<', new Date().toISOString().split('T')[0])
      .orderBy('fees.due_date');

    res.json({
      success: true,
      data: {
        statusSummary,
        monthlyTrend: monthlyTrend.rows || monthlyTrend,
        classWise,
        defaulters
      }
    });
  } catch (error) {
    console.error('Fee report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee report'
    });
  }
});

/**
 * GET /api/reports/enrollment
 * Get student enrollment trends
 */
router.get('/enrollment', async (req, res) => {
  try {
    const { schoolId } = req.user;

    // Get enrollment by class
    const byClass = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('users.school_id', schoolId)
      .select('classes.name as class_name')
      .count('* as count')
      .groupBy('classes.name')
      .orderBy('classes.name');

    // Get enrollment by gender
    const byGender = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .select('students.gender')
      .count('* as count')
      .groupBy('students.gender');

    // Get enrollment trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const enrollmentTrend = await db.raw(`
      SELECT 
        TO_CHAR(u.created_at, 'YYYY-MM') as month,
        COUNT(*) as new_students
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.school_id = ? AND u.created_at >= ?
      GROUP BY TO_CHAR(u.created_at, 'YYYY-MM')
      ORDER BY month
    `, [schoolId, twelveMonthsAgo.toISOString()]);

    res.json({
      success: true,
      data: {
        byClass,
        byGender,
        enrollmentTrend: enrollmentTrend.rows || enrollmentTrend
      }
    });
  } catch (error) {
    console.error('Enrollment report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment report'
    });
  }
});

module.exports = router;
