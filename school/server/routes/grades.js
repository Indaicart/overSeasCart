const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Add grade for a student
router.post('/', authenticateToken, requireTeacher, [
  body('studentId').isUUID(),
  body('subjectId').isUUID(),
  body('classId').isUUID(),
  body('assessmentType').notEmpty().trim(),
  body('assessmentName').notEmpty().trim(),
  body('marksObtained').isFloat({ min: 0 }),
  body('totalMarks').isFloat({ min: 1 }),
  body('assessmentDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      studentId, subjectId, classId, assessmentType, assessmentName,
      marksObtained, totalMarks, assessmentDate, comments
    } = req.body;

    // Calculate percentage and grade
    const percentage = (marksObtained / totalMarks) * 100;
    const gradeLetter = calculateGradeLetter(percentage);
    const gpa = calculateGPA(percentage);

    const [grade] = await db('grades').insert({
      student_id: studentId,
      subject_id: subjectId,
      class_id: classId,
      assessment_type: assessmentType,
      assessment_name: assessmentName,
      marks_obtained: marksObtained,
      total_marks: totalMarks,
      percentage: percentage,
      grade_letter: gradeLetter,
      gpa: gpa,
      assessment_date: assessmentDate,
      comments: comments,
      graded_by: req.user.id
    }).returning('*');

    res.status(201).json({
      message: 'Grade added successfully',
      grade: {
        id: grade.id,
        percentage: grade.percentage,
        gradeLetter: grade.grade_letter,
        gpa: grade.gpa
      }
    });
  } catch (error) {
    console.error('Add grade error:', error);
    res.status(500).json({ message: 'Failed to add grade' });
  }
});

// Get grades for a student
router.get('/student/:studentId', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId, classId, assessmentType, startDate, endDate } = req.query;

    let query = db('grades')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .join('classes', 'grades.class_id', 'classes.id')
      .join('users', 'grades.graded_by', 'users.id')
      .select(
        'grades.*',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classes.name as class_name',
        'classes.code as class_code',
        'users.first_name as grader_first_name',
        'users.last_name as grader_last_name'
      )
      .where('grades.student_id', studentId);

    if (subjectId) {
      query = query.where('grades.subject_id', subjectId);
    }
    if (classId) {
      query = query.where('grades.class_id', classId);
    }
    if (assessmentType) {
      query = query.where('grades.assessment_type', assessmentType);
    }
    if (startDate) {
      query = query.where('grades.assessment_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('grades.assessment_date', '<=', endDate);
    }

    const grades = await query.orderBy('grades.assessment_date', 'desc');

    res.json(grades.map(grade => ({
      id: grade.id,
      subjectId: grade.subject_id,
      subjectName: grade.subject_name,
      subjectCode: grade.subject_code,
      classId: grade.class_id,
      className: grade.class_name,
      classCode: grade.class_code,
      assessmentType: grade.assessment_type,
      assessmentName: grade.assessment_name,
      marksObtained: grade.marks_obtained,
      totalMarks: grade.total_marks,
      percentage: grade.percentage,
      gradeLetter: grade.grade_letter,
      gpa: grade.gpa,
      assessmentDate: grade.assessment_date,
      comments: grade.comments,
      graderName: `${grade.grader_first_name} ${grade.grader_last_name}`,
      createdAt: grade.created_at
    })));
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({ message: 'Failed to fetch student grades' });
  }
});

// Get grades for a class
router.get('/class/:classId', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId } = req.params;
    const { subjectId, assessmentType, assessmentDate } = req.query;

    let query = db('grades')
      .join('students', 'grades.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .select(
        'grades.*',
        'students.student_id as student_id_number',
        'students.roll_number',
        'users.first_name',
        'users.last_name',
        'subjects.name as subject_name',
        'subjects.code as subject_code'
      )
      .where('grades.class_id', classId);

    if (subjectId) {
      query = query.where('grades.subject_id', subjectId);
    }
    if (assessmentType) {
      query = query.where('grades.assessment_type', assessmentType);
    }
    if (assessmentDate) {
      query = query.where('grades.assessment_date', assessmentDate);
    }

    const grades = await query.orderBy('students.roll_number', 'asc');

    res.json(grades.map(grade => ({
      id: grade.id,
      studentId: grade.student_id,
      studentIdNumber: grade.student_id_number,
      rollNumber: grade.roll_number,
      firstName: grade.first_name,
      lastName: grade.last_name,
      subjectId: grade.subject_id,
      subjectName: grade.subject_name,
      subjectCode: grade.subject_code,
      assessmentType: grade.assessment_type,
      assessmentName: grade.assessment_name,
      marksObtained: grade.marks_obtained,
      totalMarks: grade.total_marks,
      percentage: grade.percentage,
      gradeLetter: grade.grade_letter,
      gpa: grade.gpa,
      assessmentDate: grade.assessment_date,
      comments: grade.comments,
      createdAt: grade.created_at
    })));
  } catch (error) {
    console.error('Get class grades error:', error);
    res.status(500).json({ message: 'Failed to fetch class grades' });
  }
});

// Get grade summary for a student
router.get('/student/:studentId/summary', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId, subjectId } = req.query;

    let query = db('grades')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .select(
        'subjects.id as subject_id',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        db.raw('COUNT(*) as total_assessments'),
        db.raw('AVG(grades.percentage) as average_percentage'),
        db.raw('AVG(grades.gpa) as average_gpa'),
        db.raw('MAX(grades.percentage) as highest_percentage'),
        db.raw('MIN(grades.percentage) as lowest_percentage')
      )
      .where('grades.student_id', studentId)
      .groupBy('subjects.id', 'subjects.name', 'subjects.code');

    if (classId) {
      query = query.where('grades.class_id', classId);
    }
    if (subjectId) {
      query = query.where('grades.subject_id', subjectId);
    }

    const summary = await query.orderBy('subjects.name', 'asc');

    const formattedSummary = summary.map(item => ({
      subjectId: item.subject_id,
      subjectName: item.subject_name,
      subjectCode: item.subject_code,
      totalAssessments: parseInt(item.total_assessments),
      averagePercentage: Math.round(parseFloat(item.average_percentage) * 100) / 100,
      averageGPA: Math.round(parseFloat(item.average_gpa) * 100) / 100,
      highestPercentage: parseFloat(item.highest_percentage),
      lowestPercentage: parseFloat(item.lowest_percentage),
      gradeLetter: calculateGradeLetter(parseFloat(item.average_percentage))
    }));

    res.json(formattedSummary);
  } catch (error) {
    console.error('Get grade summary error:', error);
    res.status(500).json({ message: 'Failed to fetch grade summary' });
  }
});

// Update grade
router.put('/:id', authenticateToken, requireTeacher, [
  body('marksObtained').optional().isFloat({ min: 0 }),
  body('totalMarks').optional().isFloat({ min: 1 }),
  body('comments').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { marksObtained, totalMarks, comments } = req.body;

    const grade = await db('grades').where('id', req.params.id).first();
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    const updateData = {};
    if (marksObtained !== undefined) updateData.marks_obtained = marksObtained;
    if (totalMarks !== undefined) updateData.total_marks = totalMarks;
    if (comments !== undefined) updateData.comments = comments;

    // Recalculate percentage and grade if marks changed
    if (marksObtained !== undefined || totalMarks !== undefined) {
      const finalMarksObtained = marksObtained !== undefined ? marksObtained : grade.marks_obtained;
      const finalTotalMarks = totalMarks !== undefined ? totalMarks : grade.total_marks;
      
      updateData.percentage = (finalMarksObtained / finalTotalMarks) * 100;
      updateData.grade_letter = calculateGradeLetter(updateData.percentage);
      updateData.gpa = calculateGPA(updateData.percentage);
    }

    await db('grades').where('id', req.params.id).update(updateData);

    res.json({ message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ message: 'Failed to update grade' });
  }
});

// Delete grade
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const grade = await db('grades').where('id', req.params.id).first();
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    await db('grades').where('id', req.params.id).del();

    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ message: 'Failed to delete grade' });
  }
});

// Get grade statistics
router.get('/stats', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;

    let query = db('grades')
      .join('students', 'grades.student_id', 'students.id')
      .join('classes', 'students.class_id', 'classes.id')
      .join('subjects', 'grades.subject_id', 'subjects.id');

    if (classId) {
      query = query.where('students.class_id', classId);
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

    const stats = await query
      .select(
        'classes.name as class_name',
        'classes.code as class_code',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        db.raw('COUNT(*) as total_grades'),
        db.raw('AVG(grades.percentage) as average_percentage'),
        db.raw('AVG(grades.gpa) as average_gpa'),
        db.raw('MAX(grades.percentage) as highest_percentage'),
        db.raw('MIN(grades.percentage) as lowest_percentage'),
        db.raw('COUNT(CASE WHEN grades.percentage >= 90 THEN 1 END) as a_plus_count'),
        db.raw('COUNT(CASE WHEN grades.percentage >= 80 AND grades.percentage < 90 THEN 1 END) as a_count'),
        db.raw('COUNT(CASE WHEN grades.percentage >= 70 AND grades.percentage < 80 THEN 1 END) as b_count'),
        db.raw('COUNT(CASE WHEN grades.percentage >= 60 AND grades.percentage < 70 THEN 1 END) as c_count'),
        db.raw('COUNT(CASE WHEN grades.percentage < 60 THEN 1 END) as f_count')
      )
      .groupBy('classes.id', 'classes.name', 'classes.code', 'subjects.id', 'subjects.name', 'subjects.code');

    const formattedStats = stats.map(stat => ({
      className: stat.class_name,
      classCode: stat.class_code,
      subjectName: stat.subject_name,
      subjectCode: stat.subject_code,
      totalGrades: parseInt(stat.total_grades),
      averagePercentage: Math.round(parseFloat(stat.average_percentage) * 100) / 100,
      averageGPA: Math.round(parseFloat(stat.average_gpa) * 100) / 100,
      highestPercentage: parseFloat(stat.highest_percentage),
      lowestPercentage: parseFloat(stat.lowest_percentage),
      gradeDistribution: {
        aPlus: parseInt(stat.a_plus_count),
        a: parseInt(stat.a_count),
        b: parseInt(stat.b_count),
        c: parseInt(stat.c_count),
        f: parseInt(stat.f_count)
      }
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Get grade stats error:', error);
    res.status(500).json({ message: 'Failed to fetch grade statistics' });
  }
});

// Helper functions
function calculateGradeLetter(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 65) return 'D';
  return 'F';
}

function calculateGPA(percentage) {
  if (percentage >= 97) return 4.0;
  if (percentage >= 93) return 3.7;
  if (percentage >= 90) return 3.3;
  if (percentage >= 87) return 3.0;
  if (percentage >= 83) return 2.7;
  if (percentage >= 80) return 2.3;
  if (percentage >= 77) return 2.0;
  if (percentage >= 73) return 1.7;
  if (percentage >= 70) return 1.3;
  if (percentage >= 67) return 1.0;
  if (percentage >= 65) return 0.7;
  return 0.0;
}

module.exports = router;
