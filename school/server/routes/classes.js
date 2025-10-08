const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { grade_level, is_active } = req.query;

    let query = db('classes')
      .leftJoin('teachers', 'classes.class_teacher_id', 'teachers.id')
      .leftJoin('users', 'teachers.user_id', 'users.id')
      .select(
        'classes.*',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name'
      );

    if (grade_level) {
      query = query.where('classes.grade_level', grade_level);
    }
    if (is_active !== undefined) {
      query = query.where('classes.is_active', is_active === 'true');
    }

    const classes = await query.orderBy('classes.grade_level', 'asc');

    // Get student count for each class
    const classesWithCounts = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await db('students')
          .count('* as count')
          .where('class_id', cls.id)
          .where('status', 'active')
          .first();

        return {
          id: cls.id,
          name: cls.name,
          code: cls.code,
          gradeLevel: cls.grade_level,
          section: cls.section,
          classTeacherId: cls.class_teacher_id,
          classTeacherName: cls.teacher_first_name && cls.teacher_last_name 
            ? `${cls.teacher_first_name} ${cls.teacher_last_name}` 
            : null,
          maxStudents: cls.max_students,
          currentStudents: parseInt(studentCount.count),
          description: cls.description,
          isActive: cls.is_active,
          createdAt: cls.created_at
        };
      })
    );

    res.json(classesWithCounts);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
});

// Get class by ID
router.get('/:id', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const cls = await db('classes')
      .leftJoin('teachers', 'classes.class_teacher_id', 'teachers.id')
      .leftJoin('users', 'teachers.user_id', 'users.id')
      .select(
        'classes.*',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name'
      )
      .where('classes.id', req.params.id)
      .first();

    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get students in this class
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .select(
        'students.id',
        'students.student_id',
        'students.roll_number',
        'students.section',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone'
      )
      .where('students.class_id', req.params.id)
      .where('students.status', 'active')
      .orderBy('students.roll_number', 'asc');

    res.json({
      id: cls.id,
      name: cls.name,
      code: cls.code,
      gradeLevel: cls.grade_level,
      section: cls.section,
      classTeacherId: cls.class_teacher_id,
      classTeacherName: cls.teacher_first_name && cls.teacher_last_name 
        ? `${cls.teacher_first_name} ${cls.teacher_last_name}` 
        : null,
      maxStudents: cls.max_students,
      description: cls.description,
      isActive: cls.is_active,
      students: students.map(student => ({
        id: student.id,
        studentId: student.student_id,
        rollNumber: student.roll_number,
        section: student.section,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        phone: student.phone
      })),
      createdAt: cls.created_at
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: 'Failed to fetch class' });
  }
});

// Create new class
router.post('/', authenticateToken, requireAdmin, [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim(),
  body('gradeLevel').isInt({ min: 1, max: 12 }),
  body('maxStudents').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, gradeLevel, section, classTeacherId, maxStudents, description } = req.body;

    // Check if class code already exists
    const existingClass = await db('classes').where('code', code).first();
    if (existingClass) {
      return res.status(400).json({ message: 'Class code already exists' });
    }

    const [newClass] = await db('classes').insert({
      name,
      code,
      grade_level: gradeLevel,
      section,
      class_teacher_id: classTeacherId,
      max_students: maxStudents || 30,
      description
    }).returning('*');

    res.status(201).json({
      message: 'Class created successfully',
      class: {
        id: newClass.id,
        name: newClass.name,
        code: newClass.code,
        gradeLevel: newClass.grade_level
      }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Failed to create class' });
  }
});

// Update class
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().notEmpty().trim(),
  body('code').optional().notEmpty().trim(),
  body('gradeLevel').optional().isInt({ min: 1, max: 12 }),
  body('maxStudents').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, gradeLevel, section, classTeacherId, maxStudents, description, isActive } = req.body;

    const cls = await db('classes').where('id', req.params.id).first();
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if new code already exists (if code is being changed)
    if (code && code !== cls.code) {
      const existingClass = await db('classes').where('code', code).first();
      if (existingClass) {
        return res.status(400).json({ message: 'Class code already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (gradeLevel) updateData.grade_level = gradeLevel;
    if (section) updateData.section = section;
    if (classTeacherId) updateData.class_teacher_id = classTeacherId;
    if (maxStudents) updateData.max_students = maxStudents;
    if (description) updateData.description = description;
    if (isActive !== undefined) updateData.is_active = isActive;

    await db('classes').where('id', req.params.id).update(updateData);

    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Failed to update class' });
  }
});

// Delete class
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cls = await db('classes').where('id', req.params.id).first();
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if class has students
    const studentCount = await db('students')
      .count('* as count')
      .where('class_id', req.params.id)
      .where('status', 'active')
      .first();

    if (parseInt(studentCount.count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete class with active students. Please transfer students first.' 
      });
    }

    await db('classes').where('id', req.params.id).del();

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Failed to delete class' });
  }
});

// Get class subjects
router.get('/:id/subjects', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const subjects = await db('timetable')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .join('teachers', 'timetable.teacher_id', 'teachers.id')
      .join('users', 'teachers.user_id', 'users.id')
      .select(
        'subjects.*',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name',
        'timetable.day_of_week',
        'timetable.start_time',
        'timetable.end_time',
        'timetable.room'
      )
      .where('timetable.class_id', req.params.id)
      .where('timetable.is_active', true)
      .orderBy('timetable.day_of_week', 'asc')
      .orderBy('timetable.start_time', 'asc');

    // Group subjects by day
    const subjectsByDay = {};
    subjects.forEach(subject => {
      const day = subject.day_of_week;
      if (!subjectsByDay[day]) {
        subjectsByDay[day] = [];
      }
      subjectsByDay[day].push({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        department: subject.department,
        credits: subject.credits,
        isCore: subject.is_core,
        teacherName: `${subject.teacher_first_name} ${subject.teacher_last_name}`,
        startTime: subject.start_time,
        endTime: subject.end_time,
        room: subject.room
      });
    });

    res.json(subjectsByDay);
  } catch (error) {
    console.error('Get class subjects error:', error);
    res.status(500).json({ message: 'Failed to fetch class subjects' });
  }
});

module.exports = router;
