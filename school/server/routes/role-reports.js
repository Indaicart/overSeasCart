const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * GET /api/role-reports/student/dashboard
 * Get student's personal analytics
 */
router.get('/student/dashboard', async (req, res) => {
  try {
    const { userId, schoolId, role } = req.user;

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get student info
    const student = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('users.id', userId)
      .where('users.school_id', schoolId)
      .select('students.*', 'users.name', 'users.email', 'classes.name as class_name')
      .first();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get grades with subject info
    const grades = await db('grades')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .where('grades.student_id', student.id)
      .select(
        'subjects.name as subject_name',
        'grades.marks_obtained',
        'grades.total_marks',
        'grades.grade',
        'grades.exam_type',
        'grades.created_at'
      )
      .orderBy('grades.created_at', 'desc');

    // Calculate overall average
    const totalMarks = grades.reduce((sum, g) => sum + (g.marks_obtained || 0), 0);
    const totalPossible = grades.reduce((sum, g) => sum + (g.total_marks || 0), 0);
    const overallAverage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0;

    // Subject-wise average
    const subjectPerformance = {};
    grades.forEach(g => {
      if (!subjectPerformance[g.subject_name]) {
        subjectPerformance[g.subject_name] = { total: 0, possible: 0, count: 0 };
      }
      subjectPerformance[g.subject_name].total += g.marks_obtained || 0;
      subjectPerformance[g.subject_name].possible += g.total_marks || 0;
      subjectPerformance[g.subject_name].count += 1;
    });

    const subjectAverages = Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject,
      average: ((data.total / data.possible) * 100).toFixed(1),
      assessments: data.count
    }));

    // Get attendance
    const [attendanceStats] = await db.raw(`
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
      FROM attendance
      WHERE student_id = ?
    `, [student.id]);

    const attendanceData = attendanceStats.rows ? attendanceStats.rows[0] : attendanceStats[0];

    // Get recent attendance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttendance = await db('attendance')
      .where('student_id', student.id)
      .where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0])
      .select('date', 'status')
      .orderBy('date', 'desc');

    // Get fee status
    const feeStatus = await db('fees')
      .where('student_id', student.id)
      .select('status', 'amount', 'due_date', 'description')
      .orderBy('due_date', 'desc');

    const totalFees = feeStatus.reduce((sum, f) => sum + parseFloat(f.amount), 0);
    const paidFees = feeStatus.filter(f => f.status === 'paid').reduce((sum, f) => sum + parseFloat(f.amount), 0);
    const pendingFees = totalFees - paidFees;

    // Get class ranking (approximate)
    const classStudents = await db('students')
      .join('grades', 'students.id', 'grades.student_id')
      .where('students.class_id', student.class_id)
      .select('students.id')
      .avg('grades.marks_obtained as avg_marks')
      .groupBy('students.id')
      .orderBy('avg_marks', 'desc');

    const studentRank = classStudents.findIndex(s => s.id === student.id) + 1;

    res.json({
      success: true,
      data: {
        student: {
          name: student.name,
          email: student.email,
          class: student.class_name,
          rollNumber: student.roll_number
        },
        academic: {
          overallAverage: parseFloat(overallAverage),
          subjectAverages,
          totalAssessments: grades.length,
          recentGrades: grades.slice(0, 5),
          classRank: studentRank,
          totalStudentsInClass: classStudents.length
        },
        attendance: {
          percentage: parseFloat(attendanceData.attendance_percentage) || 0,
          totalDays: parseInt(attendanceData.total_days) || 0,
          presentDays: parseInt(attendanceData.present_days) || 0,
          absentDays: parseInt(attendanceData.absent_days) || 0,
          lateDays: parseInt(attendanceData.late_days) || 0,
          recentAttendance
        },
        fees: {
          totalFees: parseFloat(totalFees),
          paidFees: parseFloat(paidFees),
          pendingFees: parseFloat(pendingFees),
          feeDetails: feeStatus
        }
      }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student dashboard'
    });
  }
});

/**
 * GET /api/role-reports/parent/dashboard
 * Get parent's children analytics
 */
router.get('/parent/dashboard', async (req, res) => {
  try {
    const { userId, schoolId, role } = req.user;

    if (role !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get parent info
    const parent = await db('parents')
      .join('users', 'parents.user_id', 'users.id')
      .where('users.id', userId)
      .where('users.school_id', schoolId)
      .select('parents.*', 'users.name', 'users.email')
      .first();

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Get children
    const children = await db('student_parents')
      .join('students', 'student_parents.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('student_parents.parent_id', parent.id)
      .select(
        'students.id as student_id',
        'users.name as student_name',
        'users.email as student_email',
        'classes.name as class_name',
        'students.roll_number'
      );

    // Get data for each child
    const childrenData = await Promise.all(children.map(async (child) => {
      // Grades
      const grades = await db('grades')
        .join('subjects', 'grades.subject_id', 'subjects.id')
        .where('grades.student_id', child.student_id)
        .select(
          'subjects.name as subject_name',
          'grades.marks_obtained',
          'grades.total_marks',
          'grades.grade'
        );

      const totalMarks = grades.reduce((sum, g) => sum + (g.marks_obtained || 0), 0);
      const totalPossible = grades.reduce((sum, g) => sum + (g.total_marks || 0), 0);
      const average = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0;

      // Attendance
      const [attendanceStats] = await db.raw(`
        SELECT 
          COUNT(*) as total_days,
          COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
          ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
        FROM attendance
        WHERE student_id = ?
      `, [child.student_id]);

      const attendance = attendanceStats.rows ? attendanceStats.rows[0] : attendanceStats[0];

      // Fees
      const feeStatus = await db('fees')
        .where('student_id', child.student_id)
        .select('status', 'amount');

      const totalFees = feeStatus.reduce((sum, f) => sum + parseFloat(f.amount), 0);
      const paidFees = feeStatus.filter(f => f.status === 'paid').reduce((sum, f) => sum + parseFloat(f.amount), 0);
      const pendingFees = totalFees - paidFees;

      return {
        ...child,
        academic: {
          average: parseFloat(average),
          totalAssessments: grades.length,
          subjectGrades: grades
        },
        attendance: {
          percentage: parseFloat(attendance.attendance_percentage) || 0,
          totalDays: parseInt(attendance.total_days) || 0,
          presentDays: parseInt(attendance.present_days) || 0
        },
        fees: {
          totalFees: parseFloat(totalFees),
          paidFees: parseFloat(paidFees),
          pendingFees: parseFloat(pendingFees)
        }
      };
    }));

    res.json({
      success: true,
      data: {
        parent: {
          name: parent.name,
          email: parent.email
        },
        children: childrenData
      }
    });
  } catch (error) {
    console.error('Parent dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parent dashboard'
    });
  }
});

/**
 * GET /api/role-reports/class-teacher/dashboard
 * Get class teacher's class analytics
 */
router.get('/class-teacher/dashboard', async (req, res) => {
  try {
    const { userId, schoolId, role } = req.user;

    if (role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get teacher's assigned class
    const teacher = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .leftJoin('classes', 'teachers.id', 'classes.class_teacher_id')
      .where('users.id', userId)
      .where('users.school_id', schoolId)
      .select('teachers.*', 'classes.id as class_id', 'classes.name as class_name')
      .first();

    if (!teacher || !teacher.class_id) {
      return res.status(404).json({
        success: false,
        message: 'No class assigned to this teacher'
      });
    }

    // Get students in the class
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('students.class_id', teacher.class_id)
      .select(
        'students.id',
        'users.name',
        'students.roll_number',
        'users.email'
      )
      .orderBy('students.roll_number');

    // Get class average
    const [classStats] = await db.raw(`
      SELECT 
        AVG(g.marks_obtained) as avg_marks,
        AVG(g.total_marks) as avg_total
      FROM grades g
      JOIN students s ON g.student_id = s.id
      WHERE s.class_id = ?
    `, [teacher.class_id]);

    const classAverage = classStats.rows ? classStats.rows[0] : classStats[0];
    const overallAverage = classAverage.avg_total > 0 
      ? ((classAverage.avg_marks / classAverage.avg_total) * 100).toFixed(1) 
      : 0;

    // Get attendance stats
    const [attendanceStats] = await db.raw(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_rate
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE s.class_id = ?
    `, [teacher.class_id]);

    const attendance = attendanceStats.rows ? attendanceStats.rows[0] : attendanceStats[0];

    // Get top performers
    const topPerformers = await db.raw(`
      SELECT 
        u.name,
        s.roll_number,
        AVG(g.marks_obtained) as avg_marks
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN grades g ON s.id = g.student_id
      WHERE s.class_id = ?
      GROUP BY u.name, s.roll_number
      ORDER BY avg_marks DESC
      LIMIT 5
    `, [teacher.class_id]);

    // Get low attendance students
    const lowAttendance = await db.raw(`
      SELECT 
        u.name,
        s.roll_number,
        COUNT(*) as total_days,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN attendance a ON s.id = a.student_id
      WHERE s.class_id = ?
      GROUP BY u.name, s.roll_number
      HAVING attendance_percentage < 75
      ORDER BY attendance_percentage ASC
    `, [teacher.class_id]);

    // Get subject-wise performance
    const subjectPerformance = await db('grades')
      .join('students', 'grades.student_id', 'students.id')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .where('students.class_id', teacher.class_id)
      .select('subjects.name as subject_name')
      .avg('grades.marks_obtained as avg_marks')
      .groupBy('subjects.name');

    res.json({
      success: true,
      data: {
        class: {
          name: teacher.class_name,
          totalStudents: students.length,
          overallAverage: parseFloat(overallAverage),
          attendanceRate: parseFloat(attendance.attendance_rate) || 0
        },
        students: students.map(s => ({
          id: s.id,
          name: s.name,
          rollNumber: s.roll_number,
          email: s.email
        })),
        topPerformers: (topPerformers.rows || topPerformers).map(p => ({
          name: p.name,
          rollNumber: p.roll_number,
          average: parseFloat(p.avg_marks).toFixed(1)
        })),
        lowAttendance: (lowAttendance.rows || lowAttendance).map(s => ({
          name: s.name,
          rollNumber: s.roll_number,
          attendancePercentage: parseFloat(s.attendance_percentage)
        })),
        subjectPerformance: subjectPerformance.map(s => ({
          subject: s.subject_name,
          average: parseFloat(s.avg_marks).toFixed(1)
        }))
      }
    });
  } catch (error) {
    console.error('Class teacher dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class teacher dashboard'
    });
  }
});

/**
 * GET /api/role-reports/subject-teacher/dashboard  
 * Get subject teacher's subject analytics
 */
router.get('/subject-teacher/dashboard', async (req, res) => {
  try {
    const { userId, schoolId, role } = req.user;

    if (role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get teacher info and subjects
    const teacher = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .where('users.id', userId)
      .where('users.school_id', schoolId)
      .select('teachers.*', 'users.name')
      .first();

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Get subjects taught by this teacher
    const subjects = await db('class_subjects')
      .join('subjects', 'class_subjects.subject_id', 'subjects.id')
      .join('classes', 'class_subjects.class_id', 'classes.id')
      .where('class_subjects.teacher_id', teacher.id)
      .select(
        'subjects.id as subject_id',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classes.id as class_id',
        'classes.name as class_name'
      )
      .distinct();

    // Get unique subjects
    const uniqueSubjects = {};
    subjects.forEach(s => {
      if (!uniqueSubjects[s.subject_id]) {
        uniqueSubjects[s.subject_id] = {
          id: s.subject_id,
          name: s.subject_name,
          code: s.subject_code,
          classes: []
        };
      }
      uniqueSubjects[s.subject_id].classes.push({
        id: s.class_id,
        name: s.class_name
      });
    });

    // Get analytics for each subject
    const subjectAnalytics = await Promise.all(
      Object.values(uniqueSubjects).map(async (subject) => {
        // Get all students and their performance
        const classIds = subject.classes.map(c => c.id);
        
        const performance = await db('grades')
          .join('students', 'grades.student_id', 'students.id')
          .join('users', 'students.user_id', 'users.id')
          .join('classes', 'students.class_id', 'classes.id')
          .where('grades.subject_id', subject.id)
          .whereIn('students.class_id', classIds)
          .select(
            'users.name as student_name',
            'students.roll_number',
            'classes.name as class_name',
            'grades.marks_obtained',
            'grades.total_marks',
            'grades.grade'
          );

        const totalMarks = performance.reduce((sum, p) => sum + (p.marks_obtained || 0), 0);
        const totalPossible = performance.reduce((sum, p) => sum + (p.total_marks || 0), 0);
        const average = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0;

        // Grade distribution
        const gradeDistribution = {};
        performance.forEach(p => {
          gradeDistribution[p.grade] = (gradeDistribution[p.grade] || 0) + 1;
        });

        // Top performers
        const studentPerformance = {};
        performance.forEach(p => {
          const key = `${p.student_name}-${p.roll_number}`;
          if (!studentPerformance[key]) {
            studentPerformance[key] = {
              name: p.student_name,
              rollNumber: p.roll_number,
              class: p.class_name,
              total: 0,
              possible: 0
            };
          }
          studentPerformance[key].total += p.marks_obtained || 0;
          studentPerformance[key].possible += p.total_marks || 0;
        });

        const topPerformers = Object.values(studentPerformance)
          .map(s => ({
            ...s,
            average: ((s.total / s.possible) * 100).toFixed(1)
          }))
          .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
          .slice(0, 5);

        return {
          subject: subject.name,
          code: subject.code,
          classes: subject.classes,
          totalStudents: performance.length,
          average: parseFloat(average),
          totalAssessments: performance.length,
          gradeDistribution,
          topPerformers
        };
      })
    );

    res.json({
      success: true,
      data: {
        teacher: {
          name: teacher.name,
          subject: teacher.subject
        },
        subjects: subjectAnalytics
      }
    });
  } catch (error) {
    console.error('Subject teacher dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject teacher dashboard'
    });
  }
});

module.exports = router;
