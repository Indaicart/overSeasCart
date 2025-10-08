const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher, requireParent } = require('../middleware/auth');

const router = express.Router();

// Get parent's children
router.get('/my-children', authenticateToken, requireParent, async (req, res) => {
  try {
    const children = await db('student_parents')
      .join('students', 'student_parents.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .select(
        'students.id',
        'students.student_id',
        'students.admission_date',
        'students.status',
        'students.section',
        'students.roll_number',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'users.date_of_birth',
        'users.gender',
        'users.profile_image',
        'classes.name as class_name',
        'classes.code as class_code',
        'student_parents.relationship',
        'student_parents.is_primary'
      )
      .where('student_parents.parent_id', req.user.id)
      .orderBy('users.last_name', 'asc');

    res.json(children.map(child => ({
      id: child.id,
      studentId: child.student_id,
      admissionDate: child.admission_date,
      status: child.status,
      section: child.section,
      rollNumber: child.roll_number,
      firstName: child.first_name,
      lastName: child.last_name,
      email: child.email,
      phone: child.phone,
      dateOfBirth: child.date_of_birth,
      gender: child.gender,
      profileImage: child.profile_image,
      className: child.class_name,
      classCode: child.class_code,
      relationship: child.relationship,
      isPrimary: child.is_primary
    })));
  } catch (error) {
    console.error('Get parent children error:', error);
    res.status(500).json({ message: 'Failed to fetch children' });
  }
});

// Get all parents (admin/teacher view)
router.get('/', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('parents')
      .join('users', 'parents.user_id', 'users.id')
      .select(
        'parents.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'users.date_of_birth',
        'users.gender'
      );

    if (search) {
      query = query.where(function() {
        this.where('users.first_name', 'ilike', `%${search}%`)
          .orWhere('users.last_name', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`);
      });
    }

    const parents = await query
      .orderBy('users.last_name', 'asc')
      .limit(limit)
      .offset(offset);

    const total = await db('parents')
      .join('users', 'parents.user_id', 'users.id')
      .count('* as count')
      .first();

    res.json({
      parents: parents.map(parent => ({
        id: parent.id,
        userId: parent.user_id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        email: parent.email,
        phone: parent.phone,
        dateOfBirth: parent.date_of_birth,
        gender: parent.gender,
        occupation: parent.occupation,
        workplace: parent.workplace,
        workPhone: parent.work_phone,
        createdAt: parent.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ message: 'Failed to fetch parents' });
  }
});

// Get parent by ID
router.get('/:id', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const parent = await db('parents')
      .join('users', 'parents.user_id', 'users.id')
      .select(
        'parents.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'users.address',
        'users.date_of_birth',
        'users.gender',
        'users.profile_image'
      )
      .where('parents.id', req.params.id)
      .first();

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Get parent's children
    const children = await db('student_parents')
      .join('students', 'student_parents.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .select(
        'students.id',
        'students.student_id',
        'students.status',
        'users.first_name',
        'users.last_name',
        'classes.name as class_name',
        'classes.code as class_code',
        'student_parents.relationship',
        'student_parents.is_primary'
      )
      .where('student_parents.parent_id', req.params.id);

    res.json({
      id: parent.id,
      userId: parent.user_id,
      firstName: parent.first_name,
      lastName: parent.last_name,
      email: parent.email,
      phone: parent.phone,
      address: parent.address,
      dateOfBirth: parent.date_of_birth,
      gender: parent.gender,
      profileImage: parent.profile_image,
      occupation: parent.occupation,
      workplace: parent.workplace,
      workPhone: parent.work_phone,
      children: children.map(child => ({
        id: child.id,
        studentId: child.student_id,
        status: child.status,
        firstName: child.first_name,
        lastName: child.last_name,
        className: child.class_name,
        classCode: child.class_code,
        relationship: child.relationship,
        isPrimary: child.is_primary
      })),
      createdAt: parent.created_at
    });
  } catch (error) {
    console.error('Get parent error:', error);
    res.status(500).json({ message: 'Failed to fetch parent' });
  }
});

// Create new parent
router.post('/', authenticateToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email, password, firstName, lastName, phone, address,
      dateOfBirth, gender, occupation, workplace, workPhone
    } = req.body;

    // Check if email already exists
    const existingUser = await db('users').where('email', email).first();
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Start transaction
    const trx = await db.transaction();

    try {
      // Create user account
      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const [user] = await trx('users').insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: 'parent',
        phone,
        address,
        date_of_birth: dateOfBirth,
        gender
      }).returning(['id']);

      // Create parent record
      const [parent] = await trx('parents').insert({
        user_id: user.id,
        occupation,
        workplace,
        work_phone: workPhone
      }).returning(['id']);

      await trx.commit();

      res.status(201).json({
        message: 'Parent created successfully',
        parent: {
          id: parent.id,
          email: email
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Create parent error:', error);
    res.status(500).json({ message: 'Failed to create parent' });
  }
});

// Update parent
router.put('/:id', authenticateToken, requireAdmin, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName, lastName, phone, address, dateOfBirth, gender,
      occupation, workplace, workPhone
    } = req.body;

    const parent = await db('parents').where('id', req.params.id).first();
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const trx = await db.transaction();

    try {
      // Update user information
      const userUpdateData = {};
      if (firstName) userUpdateData.first_name = firstName;
      if (lastName) userUpdateData.last_name = lastName;
      if (phone) userUpdateData.phone = phone;
      if (address) userUpdateData.address = address;
      if (dateOfBirth) userUpdateData.date_of_birth = dateOfBirth;
      if (gender) userUpdateData.gender = gender;

      if (Object.keys(userUpdateData).length > 0) {
        await trx('users').where('id', parent.user_id).update(userUpdateData);
      }

      // Update parent information
      const parentUpdateData = {};
      if (occupation) parentUpdateData.occupation = occupation;
      if (workplace) parentUpdateData.workplace = workplace;
      if (workPhone) parentUpdateData.work_phone = workPhone;

      if (Object.keys(parentUpdateData).length > 0) {
        await trx('parents').where('id', req.params.id).update(parentUpdateData);
      }

      await trx.commit();

      res.json({ message: 'Parent updated successfully' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(500).json({ message: 'Failed to update parent' });
  }
});

// Link parent to student
router.post('/:parentId/link-student', authenticateToken, requireAdmin, [
  body('studentId').isUUID(),
  body('relationship').isIn(['father', 'mother', 'guardian']),
  body('isPrimary').optional().isBoolean(),
  body('canPickup').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, relationship, isPrimary = false, canPickup = false } = req.body;

    // Check if link already exists
    const existingLink = await db('student_parents')
      .where('parent_id', req.params.parentId)
      .where('student_id', studentId)
      .first();

    if (existingLink) {
      return res.status(400).json({ message: 'Parent-student link already exists' });
    }

    await db('student_parents').insert({
      parent_id: req.params.parentId,
      student_id: studentId,
      relationship,
      is_primary: isPrimary,
      can_pickup: canPickup
    });

    res.json({ message: 'Parent linked to student successfully' });
  } catch (error) {
    console.error('Link parent student error:', error);
    res.status(500).json({ message: 'Failed to link parent to student' });
  }
});

// Unlink parent from student
router.delete('/:parentId/unlink-student/:studentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { parentId, studentId } = req.params;

    const link = await db('student_parents')
      .where('parent_id', parentId)
      .where('student_id', studentId)
      .first();

    if (!link) {
      return res.status(404).json({ message: 'Parent-student link not found' });
    }

    await db('student_parents')
      .where('parent_id', parentId)
      .where('student_id', studentId)
      .del();

    res.json({ message: 'Parent unlinked from student successfully' });
  } catch (error) {
    console.error('Unlink parent student error:', error);
    res.status(500).json({ message: 'Failed to unlink parent from student' });
  }
});

// Get parent's child attendance
router.get('/:parentId/child/:studentId/attendance', authenticateToken, requireParent, async (req, res) => {
  try {
    const { parentId, studentId } = req.params;

    // Verify parent has access to this student
    const link = await db('student_parents')
      .where('parent_id', parentId)
      .where('student_id', studentId)
      .first();

    if (!link) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate, limit = 30 } = req.query;

    let query = db('attendance')
      .join('classes', 'attendance.class_id', 'classes.id')
      .select(
        'attendance.*',
        'classes.name as class_name',
        'classes.code as class_code'
      )
      .where('attendance.student_id', studentId);

    if (startDate) {
      query = query.where('attendance.date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('attendance.date', '<=', endDate);
    }

    const attendance = await query
      .orderBy('attendance.date', 'desc')
      .limit(parseInt(limit));

    res.json(attendance.map(record => ({
      id: record.id,
      date: record.date,
      status: record.status,
      remarks: record.remarks,
      className: record.class_name,
      classCode: record.class_code,
      createdAt: record.created_at
    })));
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch child attendance' });
  }
});

// Get parent's child grades
router.get('/:parentId/child/:studentId/grades', authenticateToken, requireParent, async (req, res) => {
  try {
    const { parentId, studentId } = req.params;

    // Verify parent has access to this student
    const link = await db('student_parents')
      .where('parent_id', parentId)
      .where('student_id', studentId)
      .first();

    if (!link) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subjectId, startDate, endDate } = req.query;

    let query = db('grades')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .select(
        'grades.*',
        'subjects.name as subject_name',
        'subjects.code as subject_code'
      )
      .where('grades.student_id', studentId);

    if (subjectId) {
      query = query.where('grades.subject_id', subjectId);
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
    console.error('Get child grades error:', error);
    res.status(500).json({ message: 'Failed to fetch child grades' });
  }
});

module.exports = router;
