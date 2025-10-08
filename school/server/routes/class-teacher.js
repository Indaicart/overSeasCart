const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireTeacher } = require('../middleware/auth');

// Middleware to verify user is a class teacher and get their class
const getMyClass = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get teacher ID from user
    const teacher = await db('teachers')
      .where('user_id', userId)
      .first('id');

    if (!teacher) {
      return res.status(403).json({
        success: false,
        message: 'Teacher record not found'
      });
    }

    // Check if this teacher is assigned as a class teacher
    const myClass = await db('classes')
      .where('class_teacher_id', teacher.id)
      .first('*');

    if (!myClass) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned as a class teacher. Only class teachers have full access to student records.'
      });
    }

    req.teacherId = teacher.id;
    req.myClass = myClass;
    next();
  } catch (error) {
    console.error('Get my class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify class teacher access'
    });
  }
};

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireTeacher);

// ==================== DASHBOARD ====================

/**
 * GET /api/class-teacher/dashboard
 * Get class teacher dashboard data
 */
router.get('/dashboard', getMyClass, async (req, res) => {
  try {
    const { myClass } = req;

    // Get all students in class
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('students.class_id', myClass.id)
      .where('students.status', 'active')
      .select('students.*', 'users.name as student_name');

    // Calculate stats
    const totalStudents = students.length;

    // Get grades for GPA calculation
    const gradesData = await Promise.all(
      students.map(async (student) => {
        const grades = await db('grades')
          .where('student_id', student.id)
          .select('*');
        
        if (grades.length === 0) return 0;
        
        const avgPercentage = grades.reduce((sum, g) => sum + (calculatePercentage(g) || 0), 0) / grades.length;
        return avgPercentage / 10; // Convert to GPA
      })
    );

    const avgGPA = totalStudents > 0
      ? (gradesData.reduce((sum, gpa) => sum + gpa, 0) / totalStudents).toFixed(2)
      : '0.00';

    // Get attendance data
    const attendanceData = await Promise.all(
      students.map(async (student) => {
        const records = await db('attendance')
          .where('student_id', student.id)
          .select('status');
        
        if (records.length === 0) return 0;
        
        const presentCount = records.filter(r => r.status === 'present').length;
        return (presentCount / records.length) * 100;
      })
    );

    const avgAttendance = totalStudents > 0
      ? (attendanceData.reduce((sum, att) => sum + att, 0) / totalStudents).toFixed(1)
      : '0';

    // Top performers (with GPA)
    const studentsWithGPA = students.map((student, index) => ({
      ...student,
      name: student.student_name,
      rollNumber: student.roll_number,
      gpa: parseFloat(gradesData[index].toFixed(2))
    })).sort((a, b) => b.gpa - a.gpa);

    const topPerformers = studentsWithGPA.slice(0, 5);

    // Students needing attention (low GPA or attendance)
    const studentsWithAttendance = studentsWithGPA.map((student, index) => ({
      ...student,
      attendance: attendanceData[index]
    }));

    const needsAttention = studentsWithAttendance
      .filter(s => s.gpa < 6 || s.attendance < 75)
      .map(s => ({
        id: s.id,
        name: s.name,
        rollNumber: s.rollNumber,
        issues: [
          ...(s.gpa < 6 ? [`Low GPA: ${s.gpa}`] : []),
          ...(s.attendance < 75 ? [`Low Attendance: ${s.attendance.toFixed(1)}%`] : [])
        ]
      }))
      .slice(0, 5);

    // Recent activity (mock data)
    const recentActivity = [
      { type: 'success', message: 'Class average improved by 2% this month', time: '2 hours ago' },
      { type: 'warning', message: '3 students absent today', time: '5 hours ago' },
      { type: 'info', message: 'Parent-Teacher Meeting scheduled for Oct 18', time: '1 day ago' }
    ];

    res.json({
      success: true,
      data: {
        className: myClass.name,
        stats: {
          totalStudents,
          avgGPA,
          avgAttendance,
          classRank: '3rd' // Mock data
        },
        topPerformers,
        needsAttention,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get class dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// ==================== STUDENTS ====================

/**
 * GET /api/class-teacher/students
 * Get all students in teacher's class with full details
 */
router.get('/students', getMyClass, async (req, res) => {
  try {
    const { myClass } = req;

    // Get all students with user details
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('students.class_id', myClass.id)
      .where('students.status', 'active')
      .orderBy('students.roll_number', 'asc')
      .select(
        'students.*',
        'users.name',
        'users.email',
        'users.phone'
      );

    // Get GPA and attendance for each student
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        // Calculate GPA
        const grades = await db('grades')
          .where('student_id', student.id)
          .select('*');
        
        const avgPercentage = grades.length > 0
          ? grades.reduce((sum, g) => sum + (calculatePercentage(g) || 0), 0) / grades.length
          : 0;
        const gpa = (avgPercentage / 10).toFixed(2);

        // Calculate attendance
        const attendanceRecords = await db('attendance')
          .where('student_id', student.id)
          .select('status');
        
        const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
        const attendancePercentage = attendanceRecords.length > 0
          ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
          : 0;

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          rollNumber: student.roll_number,
          admissionNumber: student.admission_number,
          gpa: parseFloat(gpa),
          attendancePercentage: parseFloat(attendancePercentage),
          status: student.status
        };
      })
    );

    res.json({
      success: true,
      data: {
        classInfo: {
          id: myClass.id,
          name: myClass.name,
          gradeLevel: myClass.grade_level,
          section: myClass.section
        },
        students: studentsWithDetails
      }
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// ==================== STUDENT PROFILE ====================

/**
 * GET /api/class-teacher/students/:studentId
 * Get full profile of a student in teacher's class
 */
router.get('/students/:studentId', getMyClass, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { myClass } = req;

    // Get student with user details
    const student = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('students.id', studentId)
      .where('students.class_id', myClass.id) // Verify student is in teacher's class
      .first(
        'students.*',
        'users.name',
        'users.email',
        'users.phone'
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your class'
      });
    }

    // Get all grades
    const grades = await db('grades')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .join('users as teachers', 'subjects.teacher_id', 'teachers.id')
      .where('grades.student_id', studentId)
      .select(
        'subjects.name as subject_name',
        'teachers.name as teacher_name',
        'grades.*'
      );

    // Get attendance
    const attendanceRecords = await db('attendance')
      .where('student_id', studentId)
      .orderBy('date', 'desc')
      .limit(30)
      .select('*');

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Get parent information
    const parents = await db('student_parents')
      .join('parents', 'student_parents.parent_id', 'parents.id')
      .join('users as parent_users', 'parents.user_id', 'parent_users.id')
      .where('student_parents.student_id', studentId)
      .select(
        'parent_users.name as parent_name',
        'parent_users.email as parent_email',
        'parent_users.phone as parent_phone',
        'student_parents.relationship',
        'student_parents.is_primary'
      );

    // Calculate GPA
    const avgPercentage = grades.length > 0
      ? grades.reduce((sum, g) => sum + (calculatePercentage(g) || 0), 0) / grades.length
      : 0;
    const gpa = (avgPercentage / 10).toFixed(2);

    res.json({
      success: true,
      data: {
        profile: {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          rollNumber: student.roll_number,
          admissionNumber: student.admission_number,
          dateOfBirth: student.date_of_birth,
          gender: student.gender,
          bloodGroup: student.blood_group,
          address: student.address,
          gpa: parseFloat(gpa),
          attendancePercentage: parseFloat(attendancePercentage)
        },
        grades: grades.map(g => ({
          subjectName: g.subject_name,
          teacherName: g.teacher_name,
          examScore: g.exam_score || 0,
          assignmentScore: g.assignment_score || 0,
          projectScore: g.project_score || 0,
          percentage: calculatePercentage(g)
        })),
        attendanceRecords: attendanceRecords.slice(0, 10),
        parents
      }
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student profile'
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

function calculatePercentage(grade) {
  const examWeight = 0.5;
  const assignmentWeight = 0.3;
  const projectWeight = 0.2;

  const examScore = grade.exam_score || 0;
  const assignmentScore = grade.assignment_score || 0;
  const projectScore = grade.project_score || 0;

  return (examScore * examWeight) + (assignmentScore * assignmentWeight) + (projectScore * projectWeight);
}

module.exports = router;
