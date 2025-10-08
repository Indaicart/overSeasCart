const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Basic counts
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      activeStudents,
      totalParents
    ] = await Promise.all([
      db('students').count('* as count').first(),
      db('teachers').count('* as count').first(),
      db('classes').count('* as count').first(),
      db('subjects').count('* as count').first(),
      db('students').where('status', 'active').count('* as count').first(),
      db('parents').count('* as count').first()
    ]);

    // Attendance statistics for current month
    const attendanceStats = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .select(
        db.raw('COUNT(*) as total_records'),
        db.raw('COUNT(CASE WHEN status = \'present\' THEN 1 END) as present_count'),
        db.raw('COUNT(CASE WHEN status = \'absent\' THEN 1 END) as absent_count'),
        db.raw('COUNT(CASE WHEN status = \'late\' THEN 1 END) as late_count')
      )
      .where('attendance.date', '>=', startOfMonth)
      .where('attendance.date', '<=', endOfMonth)
      .first();

    // Fee collection statistics
    const feeStats = await db('fees')
      .select(
        db.raw('COUNT(*) as total_fees'),
        db.raw('SUM(amount) as total_amount'),
        db.raw('COUNT(CASE WHEN status = \'paid\' THEN 1 END) as paid_count'),
        db.raw('SUM(CASE WHEN status = \'paid\' THEN amount ELSE 0 END) as paid_amount'),
        db.raw('COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending_count'),
        db.raw('SUM(CASE WHEN status = \'pending\' THEN amount ELSE 0 END) as pending_amount'),
        db.raw('COUNT(CASE WHEN status = \'overdue\' THEN 1 END) as overdue_count'),
        db.raw('SUM(CASE WHEN status = \'overdue\' THEN amount ELSE 0 END) as overdue_amount')
      )
      .first();

    // Recent activities
    const recentStudents = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .select('students.id', 'users.first_name', 'users.last_name', 'students.admission_date')
      .orderBy('students.created_at', 'desc')
      .limit(5);

    const recentTeachers = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .select('teachers.id', 'users.first_name', 'users.last_name', 'teachers.joining_date')
      .orderBy('teachers.created_at', 'desc')
      .limit(5);

    // Class-wise student distribution
    const classDistribution = await db('students')
      .join('classes', 'students.class_id', 'classes.id')
      .select(
        'classes.name as class_name',
        'classes.code as class_code',
        db.raw('COUNT(*) as student_count')
      )
      .where('students.status', 'active')
      .groupBy('classes.id', 'classes.name', 'classes.code')
      .orderBy('classes.grade_level', 'asc');

    res.json({
      overview: {
        totalStudents: parseInt(totalStudents.count),
        activeStudents: parseInt(activeStudents.count),
        totalTeachers: parseInt(totalTeachers.count),
        totalClasses: parseInt(totalClasses.count),
        totalSubjects: parseInt(totalSubjects.count),
        totalParents: parseInt(totalParents.count)
      },
      attendance: {
        totalRecords: parseInt(attendanceStats.total_records),
        presentCount: parseInt(attendanceStats.present_count),
        absentCount: parseInt(attendanceStats.absent_count),
        lateCount: parseInt(attendanceStats.late_count),
        attendanceRate: attendanceStats.total_records > 0 
          ? Math.round(((parseInt(attendanceStats.present_count) + parseInt(attendanceStats.late_count)) / parseInt(attendanceStats.total_records)) * 10000) / 100
          : 0
      },
      fees: {
        totalFees: parseInt(feeStats.total_fees),
        totalAmount: parseFloat(feeStats.total_amount),
        paidCount: parseInt(feeStats.paid_count),
        paidAmount: parseFloat(feeStats.paid_amount),
        pendingCount: parseInt(feeStats.pending_count),
        pendingAmount: parseFloat(feeStats.pending_amount),
        overdueCount: parseInt(feeStats.overdue_count),
        overdueAmount: parseFloat(feeStats.overdue_amount),
        collectionRate: feeStats.total_amount > 0 
          ? Math.round((parseFloat(feeStats.paid_amount) / parseFloat(feeStats.total_amount)) * 10000) / 100
          : 0
      },
      recentActivities: {
        students: recentStudents.map(student => ({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          admissionDate: student.admission_date
        })),
        teachers: recentTeachers.map(teacher => ({
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          joiningDate: teacher.joining_date
        }))
      },
      classDistribution: classDistribution.map(cls => ({
        className: cls.class_name,
        classCode: cls.class_code,
        studentCount: parseInt(cls.student_count)
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get attendance trends
router.get('/attendance-trends', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const trends = await db('attendance')
      .select(
        'date',
        db.raw('COUNT(*) as total_records'),
        db.raw('COUNT(CASE WHEN status = \'present\' THEN 1 END) as present_count'),
        db.raw('COUNT(CASE WHEN status = \'absent\' THEN 1 END) as absent_count'),
        db.raw('COUNT(CASE WHEN status = \'late\' THEN 1 END) as late_count')
      )
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .groupBy('date')
      .orderBy('date', 'asc');

    res.json(trends.map(trend => ({
      date: trend.date,
      totalRecords: parseInt(trend.total_records),
      presentCount: parseInt(trend.present_count),
      absentCount: parseInt(trend.absent_count),
      lateCount: parseInt(trend.late_count),
      attendanceRate: trend.total_records > 0 
        ? Math.round(((parseInt(trend.present_count) + parseInt(trend.late_count)) / parseInt(trend.total_records)) * 10000) / 100
        : 0
    })));
  } catch (error) {
    console.error('Get attendance trends error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance trends' });
  }
});

// Get grade distribution
router.get('/grade-distribution', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;

    let query = db('grades');

    if (classId) {
      query = query.join('students', 'grades.student_id', 'students.id')
        .where('students.class_id', classId);
    }
    if (subjectId) {
      query = query.where('grades.subject_id', subjectId);
    }
    if (startDate) {
      query = query.where('grades.assessment_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('grades.assessment_date', '<=', endDate);
    }

    const distribution = await query
      .select(
        'grade_letter',
        db.raw('COUNT(*) as count'),
        db.raw('AVG(percentage) as average_percentage')
      )
      .groupBy('grade_letter')
      .orderBy('grade_letter', 'asc');

    res.json(distribution.map(item => ({
      grade: item.grade_letter,
      count: parseInt(item.count),
      averagePercentage: Math.round(parseFloat(item.average_percentage) * 100) / 100
    })));
  } catch (error) {
    console.error('Get grade distribution error:', error);
    res.status(500).json({ message: 'Failed to fetch grade distribution' });
  }
});

// Get top performing students
router.get('/top-students', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { limit = 10, classId, subjectId } = req.query;

    let query = db('grades')
      .join('students', 'grades.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id');

    if (classId) {
      query = query.where('students.class_id', classId);
    }
    if (subjectId) {
      query = query.where('grades.subject_id', subjectId);
    }

    const topStudents = await query
      .select(
        'students.id',
        'students.student_id',
        'users.first_name',
        'users.last_name',
        'classes.name as class_name',
        'classes.code as class_code',
        db.raw('AVG(grades.percentage) as average_percentage'),
        db.raw('AVG(grades.gpa) as average_gpa'),
        db.raw('COUNT(*) as total_assessments')
      )
      .groupBy('students.id', 'students.student_id', 'users.first_name', 'users.last_name', 'classes.name', 'classes.code')
      .orderBy('average_percentage', 'desc')
      .limit(parseInt(limit));

    res.json(topStudents.map(student => ({
      id: student.id,
      studentId: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      className: student.class_name,
      classCode: student.class_code,
      averagePercentage: Math.round(parseFloat(student.average_percentage) * 100) / 100,
      averageGPA: Math.round(parseFloat(student.average_gpa) * 100) / 100,
      totalAssessments: parseInt(student.total_assessments)
    })));
  } catch (error) {
    console.error('Get top students error:', error);
    res.status(500).json({ message: 'Failed to fetch top students' });
  }
});

// Get fee collection trends
router.get('/fee-trends', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - parseInt(months));

    const trends = await db('fees')
      .select(
        db.raw('DATE_TRUNC(\'month\', created_at) as month'),
        db.raw('COUNT(*) as total_fees'),
        db.raw('SUM(amount) as total_amount'),
        db.raw('COUNT(CASE WHEN status = \'paid\' THEN 1 END) as paid_count'),
        db.raw('SUM(CASE WHEN status = \'paid\' THEN amount ELSE 0 END) as paid_amount')
      )
      .where('created_at', '>=', startDate)
      .where('created_at', '<=', endDate)
      .groupBy(db.raw('DATE_TRUNC(\'month\', created_at)'))
      .orderBy('month', 'asc');

    res.json(trends.map(trend => ({
      month: trend.month,
      totalFees: parseInt(trend.total_fees),
      totalAmount: parseFloat(trend.total_amount),
      paidCount: parseInt(trend.paid_count),
      paidAmount: parseFloat(trend.paid_amount),
      collectionRate: trend.total_amount > 0 
        ? Math.round((parseFloat(trend.paid_amount) / parseFloat(trend.total_amount)) * 10000) / 100
        : 0
    })));
  } catch (error) {
    console.error('Get fee trends error:', error);
    res.status(500).json({ message: 'Failed to fetch fee trends' });
  }
});

// Get teacher workload
router.get('/teacher-workload', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const workload = await db('timetable')
      .join('teachers', 'timetable.teacher_id', 'teachers.id')
      .join('users', 'teachers.user_id', 'users.id')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .join('classes', 'timetable.class_id', 'classes.id')
      .select(
        'teachers.id',
        'users.first_name',
        'users.last_name',
        'teachers.department',
        db.raw('COUNT(DISTINCT timetable.class_id) as classes_count'),
        db.raw('COUNT(DISTINCT timetable.subject_id) as subjects_count'),
        db.raw('COUNT(*) as total_periods'),
        db.raw('COUNT(DISTINCT timetable.day_of_week) as days_per_week')
      )
      .where('timetable.is_active', true)
      .groupBy('teachers.id', 'users.first_name', 'users.last_name', 'teachers.department')
      .orderBy('total_periods', 'desc');

    res.json(workload.map(teacher => ({
      id: teacher.id,
      name: `${teacher.first_name} ${teacher.last_name}`,
      department: teacher.department,
      classesCount: parseInt(teacher.classes_count),
      subjectsCount: parseInt(teacher.subjects_count),
      totalPeriods: parseInt(teacher.total_periods),
      daysPerWeek: parseInt(teacher.days_per_week)
    })));
  } catch (error) {
    console.error('Get teacher workload error:', error);
    res.status(500).json({ message: 'Failed to fetch teacher workload' });
  }
});

module.exports = router;
