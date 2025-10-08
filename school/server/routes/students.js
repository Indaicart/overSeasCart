const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Get all students (with pagination and filters)
router.get('/', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { page = 1, limit = 20, class_id, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('students')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .select(
        'students.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'users.date_of_birth',
        'users.gender',
        'users.profile_image',
        'classes.name as class_name',
        'classes.code as class_code'
      );

    // Apply filters
    if (class_id) {
      query = query.where('students.class_id', class_id);
    }
    if (status) {
      query = query.where('students.status', status);
    }
    if (search) {
      query = query.where(function() {
        this.where('users.first_name', 'ilike', `%${search}%`)
          .orWhere('users.last_name', 'ilike', `%${search}%`)
          .orWhere('students.student_id', 'ilike', `%${search}%`)
          .orWhere('students.admission_number', 'ilike', `%${search}%`);
      });
    }

    const students = await query
      .orderBy('users.last_name', 'asc')
      .limit(limit)
      .offset(offset);

    const total = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .count('* as count')
      .first();

    res.json({
      students: students.map(student => ({
        id: student.id,
        userId: student.user_id,
        studentId: student.student_id,
        admissionNumber: student.admission_number,
        admissionDate: student.admission_date,
        status: student.status,
        classId: student.class_id,
        className: student.class_name,
        classCode: student.class_code,
        section: student.section,
        rollNumber: student.roll_number,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.date_of_birth,
        gender: student.gender,
        profileImage: student.profile_image,
        bloodGroup: student.blood_group,
        medicalConditions: student.medical_conditions,
        emergencyContactName: student.emergency_contact_name,
        emergencyContactPhone: student.emergency_contact_phone,
        notes: student.notes,
        createdAt: student.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const student = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .select(
        'students.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'users.address',
        'users.date_of_birth',
        'users.gender',
        'users.profile_image',
        'classes.name as class_name',
        'classes.code as class_code'
      )
      .where('students.id', req.params.id)
      .first();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      id: student.id,
      userId: student.user_id,
      studentId: student.student_id,
      admissionNumber: student.admission_number,
      admissionDate: student.admission_date,
      status: student.status,
      classId: student.class_id,
      className: student.class_name,
      classCode: student.class_code,
      section: student.section,
      rollNumber: student.roll_number,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      dateOfBirth: student.date_of_birth,
      gender: student.gender,
      profileImage: student.profile_image,
      bloodGroup: student.blood_group,
      medicalConditions: student.medical_conditions,
      emergencyContactName: student.emergency_contact_name,
      emergencyContactPhone: student.emergency_contact_phone,
      notes: student.notes,
      createdAt: student.created_at
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

// Create new student
router.post('/', authenticateToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('studentId').notEmpty().trim(),
  body('admissionDate').isISO8601(),
  body('classId').isUUID(),
  body('phone').optional().isMobilePhone(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email, password, firstName, lastName, studentId, admissionNumber,
      admissionDate, classId, section, rollNumber, phone, address,
      dateOfBirth, gender, bloodGroup, medicalConditions,
      emergencyContactName, emergencyContactPhone, notes
    } = req.body;

    // Check if student ID already exists
    const existingStudent = await db('students').where('student_id', studentId).first();
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

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
        role: 'student',
        phone,
        address,
        date_of_birth: dateOfBirth,
        gender
      }).returning(['id']);

      // Create student record
      const [student] = await trx('students').insert({
        user_id: user.id,
        student_id: studentId,
        admission_number: admissionNumber,
        admission_date: admissionDate,
        class_id: classId,
        section,
        roll_number: rollNumber,
        blood_group: bloodGroup,
        medical_conditions: medicalConditions,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        notes
      }).returning(['id', 'student_id']);

      await trx.commit();

      res.status(201).json({
        message: 'Student created successfully',
        student: {
          id: student.id,
          studentId: student.student_id
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Failed to create student' });
  }
});

// Update student
router.put('/:id', authenticateToken, requireAdmin, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().isMobilePhone(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName, lastName, phone, address, dateOfBirth, gender,
      classId, section, rollNumber, bloodGroup, medicalConditions,
      emergencyContactName, emergencyContactPhone, notes, status
    } = req.body;

    const student = await db('students').where('id', req.params.id).first();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
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
        await trx('users').where('id', student.user_id).update(userUpdateData);
      }

      // Update student information
      const studentUpdateData = {};
      if (classId) studentUpdateData.class_id = classId;
      if (section) studentUpdateData.section = section;
      if (rollNumber) studentUpdateData.roll_number = rollNumber;
      if (bloodGroup) studentUpdateData.blood_group = bloodGroup;
      if (medicalConditions) studentUpdateData.medical_conditions = medicalConditions;
      if (emergencyContactName) studentUpdateData.emergency_contact_name = emergencyContactName;
      if (emergencyContactPhone) studentUpdateData.emergency_contact_phone = emergencyContactPhone;
      if (notes) studentUpdateData.notes = notes;
      if (status) studentUpdateData.status = status;

      if (Object.keys(studentUpdateData).length > 0) {
        await trx('students').where('id', req.params.id).update(studentUpdateData);
      }

      await trx.commit();

      res.json({ message: 'Student updated successfully' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Delete student
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const student = await db('students').where('id', req.params.id).first();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const trx = await db.transaction();

    try {
      // Delete student record
      await trx('students').where('id', req.params.id).del();
      
      // Delete user account
      await trx('users').where('id', student.user_id).del();

      await trx.commit();

      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Get student's parents
router.get('/:id/parents', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const parents = await db('student_parents')
      .join('parents', 'student_parents.parent_id', 'parents.id')
      .join('users', 'parents.user_id', 'users.id')
      .select(
        'parents.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'student_parents.relationship',
        'student_parents.is_primary',
        'student_parents.can_pickup'
      )
      .where('student_parents.student_id', req.params.id);

    res.json(parents.map(parent => ({
      id: parent.id,
      userId: parent.user_id,
      firstName: parent.first_name,
      lastName: parent.last_name,
      email: parent.email,
      phone: parent.phone,
      occupation: parent.occupation,
      workplace: parent.workplace,
      workPhone: parent.work_phone,
      relationship: parent.relationship,
      isPrimary: parent.is_primary,
      canPickup: parent.can_pickup
    })));
  } catch (error) {
    console.error('Get student parents error:', error);
    res.status(500).json({ message: 'Failed to fetch student parents' });
  }
});

module.exports = router;
