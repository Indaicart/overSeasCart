const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireTeacher } = require('../middleware/auth');

// Middleware to get teacher's subjects
const getMySubjects = async (req, res, next) => {
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

    // Get all subjects taught by this teacher
    const subjects = await db('subjects')
      .where('teacher_id', teacher.id)
      .select('*');

    if (!subjects || subjects.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No subjects assigned to you'
      });
    }

    req.teacherId = teacher.id;
    req.mySubjects = subjects;
    next();
  } catch (error) {
    console.error('Get my subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subject teacher access'
    });
  }
};

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireTeacher);

// ==================== DASHBOARD ====================

/**
 * GET /api/subject-teacher/dashboard
 * Get subject teacher dashboard data
 */
router.get('/dashboard', getMySubjects, async (req, res) => {
  try {
    const { mySubjects } = req;

    // Get all unique class IDs from class_subjects
    const classSubjects = await db('class_subjects')
      .whereIn('subject_id', mySubjects.map(s => s.id))
      .select('*');

    const classIds = [...new Set(classSubjects.map(cs => cs.class_id))];

    // Get class details
    const classes = await db('classes')
      .whereIn('id', classIds)
      .select('*');

    // For each subject, get students and stats
    const subjectsWithDetails = await Promise.all(
      mySubjects.map(async (subject) => {
        // Get classes for this subject
        const subjectClasses = await db('class_subjects')
          .join('classes', 'class_subjects.class_id', 'classes.id')
          .where('class_subjects.subject_id', subject.id)
          .select('classes.*');

        // Get all students in these classes
        const students = await db('students')
          .whereIn('class_id', subjectClasses.map(c => c.id))
          .where('status', 'active')
          .select('*');

        // Get attendance for this subject
        const attendanceRecords = await db('attendance')
          .whereIn('student_id', students.map(s => s.id))
          .where('subject_id', subject.id)
          .select('*');

        const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
        const avgAttendance = attendanceRecords.length > 0
          ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
          : 0;

        // Get grades for this subject
        const grades = await db('grades')
          .whereIn('student_id', students.map(s => s.id))
          .where('subject_id', subject.id)
          .select('*');

        const avgPercentage = grades.length > 0
          ? grades.reduce((sum, g) => sum + (calculatePercentage(g) || 0), 0) / grades.length
          : 0;

        return {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          totalStudents: students.length,
          classes: subjectClasses.map(c => `${c.grade_level}${c.section}`),
          avgAttendance: parseFloat(avgAttendance),
          avgGrade: parseFloat(avgPercentage.toFixed(1))
        };
      })
    );

    // Calculate overall stats
    const totalStudents = [...new Set(
      subjectsWithDetails.flatMap(s => s.totalStudents)
    )].length;

    const avgAttendance = subjectsWithDetails.length > 0
      ? (subjectsWithDetails.reduce((sum, s) => sum + s.avgAttendance, 0) / subjectsWithDetails.length).toFixed(1)
      : 0;

    const avgGrade = subjectsWithDetails.length > 0
      ? (subjectsWithDetails.reduce((sum, s) => sum + s.avgGrade, 0) / subjectsWithDetails.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        subjects: subjectsWithDetails,
        stats: {
          totalStudents,
          totalClasses: classIds.length,
          avgAttendance,
          avgGrade
        }
      }
    });
  } catch (error) {
    console.error('Get subject dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// ==================== STUDENTS ====================

/**
 * GET /api/subject-teacher/subjects/:subjectId/students
 * Get all students for a specific subject
 */
router.get('/subjects/:subjectId/students', getMySubjects, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { mySubjects } = req;

    // Verify subject belongs to teacher
    const subject = mySubjects.find(s => s.id === subjectId);
    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'This subject is not assigned to you'
      });
    }

    // Get classes for this subject
    const classSubjects = await db('class_subjects')
      .where('subject_id', subjectId)
      .select('class_id');

    const classIds = classSubjects.map(cs => cs.class_id);

    // Get all students in these classes
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .whereIn('students.class_id', classIds)
      .where('students.status', 'active')
      .orderBy('classes.grade_level', 'asc')
      .orderBy('classes.section', 'asc')
      .orderBy('students.roll_number', 'asc')
      .select(
        'students.*',
        'users.name',
        'users.email',
        'classes.grade_level',
        'classes.section'
      );

    // Get attendance and grades for each student in THIS subject
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        // Get attendance for this subject only
        const attendanceRecords = await db('attendance')
          .where('student_id', student.id)
          .where('subject_id', subjectId)
          .select('status');

        const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
        const attendancePercentage = attendanceRecords.length > 0
          ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
          : 0;

        // Get grade for this subject only
        const grade = await db('grades')
          .where('student_id', student.id)
          .where('subject_id', subjectId)
          .first('*');

        const percentage = grade ? calculatePercentage(grade) : 0;

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          rollNumber: student.roll_number,
          admissionNumber: student.admission_number,
          className: `${student.grade_level}${student.section}`,
          attendancePercentage: parseFloat(attendancePercentage),
          grade: grade ? {
            examScore: grade.exam_score || 0,
            assignmentScore: grade.assignment_score || 0,
            projectScore: grade.project_score || 0,
            percentage: percentage.toFixed(1)
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: {
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code
        },
        students: studentsWithDetails
      }
    });
  } catch (error) {
    console.error('Get subject students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// ==================== ATTENDANCE ====================

/**
 * GET /api/subject-teacher/subjects/:subjectId/attendance
 * Get attendance records for a subject
 */
router.get('/subjects/:subjectId/attendance', getMySubjects, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date, classId } = req.query;
    const { mySubjects } = req;

    // Verify subject belongs to teacher
    const subject = mySubjects.find(s => s.id === subjectId);
    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'This subject is not assigned to you'
      });
    }

    let query = db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('attendance.subject_id', subjectId);

    if (date) {
      query = query.where('attendance.date', date);
    }

    if (classId) {
      query = query.where('students.class_id', classId);
    }

    const records = await query
      .orderBy('attendance.date', 'desc')
      .select(
        'attendance.*',
        'students.roll_number',
        'users.name as student_name',
        'classes.grade_level',
        'classes.section'
      );

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
});

/**
 * GET /api/subject-teacher/subjects/:subjectId/class-attendance/:classId
 * Get class teacher's attendance for a specific date to import
 */
router.get('/subjects/:subjectId/class-attendance/:classId', getMySubjects, async (req, res) => {
  try {
    const { subjectId, classId } = req.params;
    const { date } = req.query;
    const { mySubjects } = req;

    // Verify subject belongs to teacher
    const subject = mySubjects.find(s => s.id === subjectId);
    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'This subject is not assigned to you'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Get class teacher's attendance for this date
    // Class teacher marks general attendance (no subject_id)
    const classAttendance = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('students.class_id', classId)
      .where('attendance.date', date)
      .whereNull('attendance.subject_id') // Class teacher attendance has no subject
      .select(
        'attendance.*',
        'students.roll_number',
        'users.name as student_name',
        'students.id as student_id'
      );

    if (classAttendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No class teacher attendance found for this date. The class teacher may not have marked attendance yet.'
      });
    }

    // Check if subject attendance already exists for this date
    const existingSubjectAttendance = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .where('students.class_id', classId)
      .where('attendance.subject_id', subjectId)
      .where('attendance.date', date)
      .select('attendance.id');

    const canImport = existingSubjectAttendance.length === 0;

    res.json({
      success: true,
      data: {
        attendance: classAttendance,
        canImport,
        message: canImport 
          ? `Found ${classAttendance.length} attendance records from class teacher`
          : 'Attendance already marked for this subject on this date'
      }
    });
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class teacher attendance'
    });
  }
});

/**
 * POST /api/subject-teacher/subjects/:subjectId/import-attendance
 * Import attendance from class teacher's record
 */
router.post('/subjects/:subjectId/import-attendance', getMySubjects, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { classId, date } = req.body;
    const { mySubjects, teacherId } = req;

    // Verify subject belongs to teacher
    const subject = mySubjects.find(s => s.id === subjectId);
    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'This subject is not assigned to you'
      });
    }

    // Verify class is assigned to this subject
    const classSubject = await db('class_subjects')
      .where('subject_id', subjectId)
      .where('class_id', classId)
      .first();

    if (!classSubject) {
      return res.status(403).json({
        success: false,
        message: 'This class is not assigned to this subject'
      });
    }

    // Check if subject attendance already exists
    const existingRecords = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .where('attendance.subject_id', subjectId)
      .where('attendance.date', date)
      .where('students.class_id', classId)
      .select('attendance.id');

    if (existingRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date. Cannot import.'
      });
    }

    // Get class teacher's attendance
    const classAttendance = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .where('students.class_id', classId)
      .where('attendance.date', date)
      .whereNull('attendance.subject_id') // Class teacher attendance
      .select('attendance.*');

    if (classAttendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No class teacher attendance found for this date'
      });
    }

    // Import attendance with subject_id
    const importedRecords = classAttendance.map(record => ({
      student_id: record.student_id,
      subject_id: subjectId,
      class_id: classId,
      teacher_id: teacherId,
      date: date,
      status: record.status,
      remarks: `Imported from class teacher attendance`
    }));

    await db('attendance').insert(importedRecords);

    res.json({
      success: true,
      message: `Successfully imported ${importedRecords.length} attendance records`,
      data: {
        imported: importedRecords.length,
        date: date
      }
    });
  } catch (error) {
    console.error('Import attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import attendance'
    });
  }
});

/**
 * POST /api/subject-teacher/subjects/:subjectId/attendance
 * Mark attendance for a class in this subject
 */
router.post('/subjects/:subjectId/attendance', getMySubjects, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { classId, date, attendance } = req.body;
    const { mySubjects, teacherId } = req;

    // Verify subject belongs to teacher
    const subject = mySubjects.find(s => s.id === subjectId);
    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'This subject is not assigned to you'
      });
    }

    // Verify class is assigned to this subject
    const classSubject = await db('class_subjects')
      .where('subject_id', subjectId)
      .where('class_id', classId)
      .first();

    if (!classSubject) {
      return res.status(403).json({
        success: false,
        message: 'This class is not assigned to this subject'
      });
    }

    // Check if attendance already exists for this date
    const existingRecords = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .where('attendance.subject_id', subjectId)
      .where('attendance.date', date)
      .where('students.class_id', classId)
      .select('attendance.id');

    if (existingRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date'
      });
    }

    // Insert attendance records
    const attendanceRecords = attendance.map(record => ({
      student_id: record.studentId,
      subject_id: subjectId,
      class_id: classId,
      teacher_id: teacherId,
      date: date,
      status: record.status,
      remarks: record.remarks || null
    }));

    await db('attendance').insert(attendanceRecords);

    res.json({
      success: true,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance'
    });
  }
});

// ==================== GRADES ====================

/**
 * GET /api/subject-teacher/subjects/:subjectId/grades
 * Get grades for a subject
 */
router.get('/subjects/:subjectId/grades', getMySubjects, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { classId } = req.query;
    const { mySubjects } = req;

    // Verify subject belongs to teacher
    const subject = mySubjects.find(s => s.id === subjectId);
    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'This subject is not assigned to you'
      });
    }

    let query = db('grades')
      .join('students', 'grades.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('grades.subject_id', subjectId);

    if (classId) {
      query = query.where('students.class_id', classId);
    }

    const grades = await query
      .orderBy('classes.grade_level', 'asc')
      .orderBy('classes.section', 'asc')
      .orderBy('students.roll_number', 'asc')
      .select(
        'grades.*',
        'students.roll_number',
        'users.name as student_name',
        'classes.grade_level',
        'classes.section'
      );

    res.json({
      success: true,
      data: grades.map(g => ({
        ...g,
        percentage: calculatePercentage(g)
      }))
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades'
    });
  }
});

/**
 * POST /api/subject-teacher/subjects/:subjectId/grades
 * Enter/update grades for students
 */
router.post('/subjects/:subjectId/grades', getMySubjects, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { studentId, examScore, assignmentScore, projectScore } = req.body;
    const { mySubjects, teacherId } = req;

    // Verify subject belongs to teacher
    const subject = mySubjects.find(s => s.id === subjectId);
    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'This subject is not assigned to you'
      });
    }

    // Check if grade already exists
    const existingGrade = await db('grades')
      .where('student_id', studentId)
      .where('subject_id', subjectId)
      .first();

    if (existingGrade) {
      // Update existing grade
      await db('grades')
        .where('id', existingGrade.id)
        .update({
          exam_score: examScore,
          assignment_score: assignmentScore,
          project_score: projectScore,
          updated_at: db.fn.now()
        });
    } else {
      // Insert new grade
      await db('grades').insert({
        student_id: studentId,
        subject_id: subjectId,
        teacher_id: teacherId,
        exam_score: examScore,
        assignment_score: assignmentScore,
        project_score: projectScore
      });
    }

    res.json({
      success: true,
      message: 'Grade saved successfully'
    });
  } catch (error) {
    console.error('Save grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save grade'
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
