const express = require('express');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/csv';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

/**
 * POST /api/bulk/import/students
 * Import students from CSV
 */
router.post('/import/students', upload.single('file'), async (req, res) => {
  try {
    const { schoolId, role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can import students'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const students = [];
    const errors = [];
    let lineNumber = 1;

    // Parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (row) => {
          lineNumber++;
          
          // Validate required fields
          if (!row.name || !row.email || !row.class_id) {
            errors.push({
              line: lineNumber,
              error: 'Missing required fields (name, email, class_id)',
              data: row
            });
            return;
          }

          students.push({
            name: row.name.trim(),
            email: row.email.trim().toLowerCase(),
            class_id: parseInt(row.class_id),
            roll_number: row.roll_number ? parseInt(row.roll_number) : null,
            date_of_birth: row.date_of_birth || null,
            gender: row.gender || null,
            address: row.address || null,
            phone: row.phone || null,
            parent_name: row.parent_name || null,
            parent_email: row.parent_email || null,
            parent_phone: row.parent_phone || null
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid student records found',
        errors
      });
    }

    // Insert students
    const inserted = [];
    const insertErrors = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      try {
        // Check if email already exists
        const existingUser = await db('users')
          .where('email', student.email)
          .where('school_id', schoolId)
          .first();

        if (existingUser) {
          insertErrors.push({
            line: i + 2,
            error: 'Email already exists',
            data: student
          });
          continue;
        }

        // Create user account
        const defaultPassword = await bcrypt.hash('student123', 10);
        const [userId] = await db('users').insert({
          name: student.name,
          email: student.email,
          password: defaultPassword,
          role: 'student',
          school_id: schoolId
        });

        // Create student record
        await db('students').insert({
          user_id: userId,
          class_id: student.class_id,
          roll_number: student.roll_number,
          date_of_birth: student.date_of_birth,
          gender: student.gender,
          address: student.address,
          phone: student.phone,
          parent_name: student.parent_name,
          parent_email: student.parent_email,
          parent_phone: student.parent_phone
        });

        inserted.push({
          name: student.name,
          email: student.email
        });
      } catch (error) {
        insertErrors.push({
          line: i + 2,
          error: error.message,
          data: student
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${inserted.length} students`,
      data: {
        imported: inserted.length,
        failed: insertErrors.length,
        errors: insertErrors,
        validationErrors: errors
      }
    });
  } catch (error) {
    console.error('Import students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import students'
    });
  }
});

/**
 * POST /api/bulk/import/teachers
 * Import teachers from CSV
 */
router.post('/import/teachers', upload.single('file'), async (req, res) => {
  try {
    const { schoolId, role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can import teachers'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const teachers = [];
    const errors = [];
    let lineNumber = 1;

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (row) => {
          lineNumber++;
          
          if (!row.name || !row.email || !row.subject) {
            errors.push({
              line: lineNumber,
              error: 'Missing required fields (name, email, subject)',
              data: row
            });
            return;
          }

          teachers.push({
            name: row.name.trim(),
            email: row.email.trim().toLowerCase(),
            subject: row.subject.trim(),
            phone: row.phone || null,
            qualification: row.qualification || null,
            experience_years: row.experience_years ? parseInt(row.experience_years) : null
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    fs.unlinkSync(req.file.path);

    if (teachers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid teacher records found',
        errors
      });
    }

    const inserted = [];
    const insertErrors = [];

    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      
      try {
        const existingUser = await db('users')
          .where('email', teacher.email)
          .where('school_id', schoolId)
          .first();

        if (existingUser) {
          insertErrors.push({
            line: i + 2,
            error: 'Email already exists',
            data: teacher
          });
          continue;
        }

        const defaultPassword = await bcrypt.hash('teacher123', 10);
        const [userId] = await db('users').insert({
          name: teacher.name,
          email: teacher.email,
          password: defaultPassword,
          role: 'teacher',
          school_id: schoolId
        });

        await db('teachers').insert({
          user_id: userId,
          subject: teacher.subject,
          phone: teacher.phone,
          qualification: teacher.qualification,
          experience_years: teacher.experience_years
        });

        inserted.push({
          name: teacher.name,
          email: teacher.email
        });
      } catch (error) {
        insertErrors.push({
          line: i + 2,
          error: error.message,
          data: teacher
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${inserted.length} teachers`,
      data: {
        imported: inserted.length,
        failed: insertErrors.length,
        errors: insertErrors,
        validationErrors: errors
      }
    });
  } catch (error) {
    console.error('Import teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import teachers'
    });
  }
});

/**
 * GET /api/bulk/export/students
 * Export students to CSV
 */
router.get('/export/students', async (req, res) => {
  try {
    const { schoolId, role } = req.user;

    if (role !== 'admin' && role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('users.school_id', schoolId)
      .select(
        'users.name',
        'users.email',
        'students.roll_number',
        'classes.name as class_name',
        'students.date_of_birth',
        'students.gender',
        'students.phone',
        'students.address',
        'students.parent_name',
        'students.parent_email',
        'students.parent_phone',
        'users.created_at'
      );

    const fields = [
      'name',
      'email',
      'roll_number',
      'class_name',
      'date_of_birth',
      'gender',
      'phone',
      'address',
      'parent_name',
      'parent_email',
      'parent_phone',
      'created_at'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(students);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=students-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export students'
    });
  }
});

/**
 * GET /api/bulk/export/teachers
 * Export teachers to CSV
 */
router.get('/export/teachers', async (req, res) => {
  try {
    const { schoolId, role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can export teachers'
      });
    }

    const teachers = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .select(
        'users.name',
        'users.email',
        'teachers.subject',
        'teachers.phone',
        'teachers.qualification',
        'teachers.experience_years',
        'users.created_at'
      );

    const fields = [
      'name',
      'email',
      'subject',
      'phone',
      'qualification',
      'experience_years',
      'created_at'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(teachers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=teachers-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export teachers'
    });
  }
});

/**
 * GET /api/bulk/export/attendance
 * Export attendance to CSV
 */
router.get('/export/attendance', async (req, res) => {
  try {
    const { schoolId, role } = req.user;
    const { startDate, endDate, classId } = req.query;

    if (role !== 'admin' && role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    let query = db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .where('users.school_id', schoolId);

    if (startDate) {
      query = query.where('attendance.date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('attendance.date', '<=', endDate);
    }
    if (classId) {
      query = query.where('students.class_id', classId);
    }

    const attendance = await query.select(
      'users.name as student_name',
      'students.roll_number',
      'classes.name as class_name',
      'attendance.date',
      'attendance.status',
      'attendance.remarks'
    );

    const fields = [
      'student_name',
      'roll_number',
      'class_name',
      'date',
      'status',
      'remarks'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(attendance);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export attendance'
    });
  }
});

/**
 * GET /api/bulk/export/grades
 * Export grades to CSV
 */
router.get('/export/grades', async (req, res) => {
  try {
    const { schoolId, role } = req.user;
    const { classId, subjectId } = req.query;

    if (role !== 'admin' && role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    let query = db('grades')
      .join('students', 'grades.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .join('classes', 'students.class_id', 'classes.id')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .where('users.school_id', schoolId);

    if (classId) {
      query = query.where('students.class_id', classId);
    }
    if (subjectId) {
      query = query.where('grades.subject_id', subjectId);
    }

    const grades = await query.select(
      'users.name as student_name',
      'students.roll_number',
      'classes.name as class_name',
      'subjects.name as subject_name',
      'grades.exam_type',
      'grades.marks_obtained',
      'grades.total_marks',
      'grades.grade',
      'grades.remarks'
    );

    const fields = [
      'student_name',
      'roll_number',
      'class_name',
      'subject_name',
      'exam_type',
      'marks_obtained',
      'total_marks',
      'grade',
      'remarks'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(grades);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=grades-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export grades'
    });
  }
});

/**
 * GET /api/bulk/templates/:type
 * Download CSV template
 */
router.get('/templates/:type', (req, res) => {
  const { type } = req.params;

  const templates = {
    students: [
      ['name', 'email', 'class_id', 'roll_number', 'date_of_birth', 'gender', 'phone', 'address', 'parent_name', 'parent_email', 'parent_phone'],
      ['John Doe', 'john.doe@example.com', '1', '101', '2010-01-15', 'Male', '1234567890', '123 Main St', 'Jane Doe', 'jane.doe@example.com', '0987654321']
    ],
    teachers: [
      ['name', 'email', 'subject', 'phone', 'qualification', 'experience_years'],
      ['Jane Smith', 'jane.smith@example.com', 'Mathematics', '1234567890', 'M.Sc Mathematics', '5']
    ]
  };

  const template = templates[type];

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }

  const parser = new Parser({ header: false });
  const csv = parser.parse(template);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${type}-template.csv`);
  res.send(csv);
});

module.exports = router;
