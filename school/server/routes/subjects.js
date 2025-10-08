const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { department, is_active, is_core } = req.query;

    let query = db('subjects').select('*');

    if (department) {
      query = query.where('department', department);
    }
    if (is_active !== undefined) {
      query = query.where('is_active', is_active === 'true');
    }
    if (is_core !== undefined) {
      query = query.where('is_core', is_core === 'true');
    }

    const subjects = await query.orderBy('name', 'asc');

    res.json(subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description,
      department: subject.department,
      credits: subject.credits,
      isCore: subject.is_core,
      isActive: subject.is_active,
      createdAt: subject.created_at
    })));
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

// Get subject by ID
router.get('/:id', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const subject = await db('subjects')
      .where('id', req.params.id)
      .first();

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description,
      department: subject.department,
      credits: subject.credits,
      isCore: subject.is_core,
      isActive: subject.is_active,
      createdAt: subject.created_at
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Failed to fetch subject' });
  }
});

// Create new subject
router.post('/', authenticateToken, requireAdmin, [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim(),
  body('department').notEmpty().trim(),
  body('credits').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, description, department, credits, isCore } = req.body;

    // Check if subject code already exists
    const existingSubject = await db('subjects').where('code', code).first();
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }

    const [newSubject] = await db('subjects').insert({
      name,
      code,
      description,
      department,
      credits: credits || 1,
      is_core: isCore !== undefined ? isCore : true
    }).returning('*');

    res.status(201).json({
      message: 'Subject created successfully',
      subject: {
        id: newSubject.id,
        name: newSubject.name,
        code: newSubject.code
      }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Failed to create subject' });
  }
});

// Update subject
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().notEmpty().trim(),
  body('code').optional().notEmpty().trim(),
  body('department').optional().notEmpty().trim(),
  body('credits').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, description, department, credits, isCore, isActive } = req.body;

    const subject = await db('subjects').where('id', req.params.id).first();
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if new code already exists (if code is being changed)
    if (code && code !== subject.code) {
      const existingSubject = await db('subjects').where('code', code).first();
      if (existingSubject) {
        return res.status(400).json({ message: 'Subject code already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (description) updateData.description = description;
    if (department) updateData.department = department;
    if (credits) updateData.credits = credits;
    if (isCore !== undefined) updateData.is_core = isCore;
    if (isActive !== undefined) updateData.is_active = isActive;

    await db('subjects').where('id', req.params.id).update(updateData);

    res.json({ message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Failed to update subject' });
  }
});

// Delete subject
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subject = await db('subjects').where('id', req.params.id).first();
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if subject is being used in timetable
    const timetableCount = await db('timetable')
      .count('* as count')
      .where('subject_id', req.params.id)
      .first();

    if (parseInt(timetableCount.count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete subject that is assigned to classes. Please remove from timetable first.' 
      });
    }

    await db('subjects').where('id', req.params.id).del();

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Failed to delete subject' });
  }
});

// Get subject statistics
router.get('/:id/stats', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const subject = await db('subjects').where('id', req.params.id).first();
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Get classes using this subject
    const classes = await db('timetable')
      .join('classes', 'timetable.class_id', 'classes.id')
      .select('classes.id', 'classes.name', 'classes.code')
      .where('timetable.subject_id', req.params.id)
      .where('timetable.is_active', true)
      .distinct();

    // Get teachers teaching this subject
    const teachers = await db('timetable')
      .join('teachers', 'timetable.teacher_id', 'teachers.id')
      .join('users', 'teachers.user_id', 'users.id')
      .select('teachers.id', 'users.first_name', 'users.last_name')
      .where('timetable.subject_id', req.params.id)
      .where('timetable.is_active', true)
      .distinct();

    // Get total students enrolled in this subject
    const totalStudents = await db('timetable')
      .join('students', 'timetable.class_id', 'students.class_id')
      .count('* as count')
      .where('timetable.subject_id', req.params.id)
      .where('timetable.is_active', true)
      .where('students.status', 'active')
      .first();

    res.json({
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        department: subject.department
      },
      classes: classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        code: cls.code
      })),
      teachers: teachers.map(teacher => ({
        id: teacher.id,
        name: `${teacher.first_name} ${teacher.last_name}`
      })),
      totalStudents: parseInt(totalStudents.count)
    });
  } catch (error) {
    console.error('Get subject stats error:', error);
    res.status(500).json({ message: 'Failed to fetch subject statistics' });
  }
});

module.exports = router;
