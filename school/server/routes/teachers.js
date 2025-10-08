const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Get all teachers (with pagination and filters)
router.get('/', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { page = 1, limit = 20, department, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .select(
        'teachers.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'users.date_of_birth',
        'users.gender',
        'users.profile_image'
      );

    // Apply filters
    if (department) {
      query = query.where('teachers.department', department);
    }
    if (status) {
      query = query.where('teachers.status', status);
    }
    if (search) {
      query = query.where(function() {
        this.where('users.first_name', 'ilike', `%${search}%`)
          .orWhere('users.last_name', 'ilike', `%${search}%`)
          .orWhere('teachers.employee_id', 'ilike', `%${search}%`);
      });
    }

    const teachers = await query
      .orderBy('users.last_name', 'asc')
      .limit(limit)
      .offset(offset);

    const total = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .count('* as count')
      .first();

    res.json({
      teachers: teachers.map(teacher => ({
        id: teacher.id,
        userId: teacher.user_id,
        employeeId: teacher.employee_id,
        department: teacher.department,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        joiningDate: teacher.joining_date,
        employmentType: teacher.employment_type,
        salary: teacher.salary,
        bankAccount: teacher.bank_account,
        taxId: teacher.tax_id,
        status: teacher.status,
        bio: teacher.bio,
        firstName: teacher.first_name,
        lastName: teacher.last_name,
        email: teacher.email,
        phone: teacher.phone,
        dateOfBirth: teacher.date_of_birth,
        gender: teacher.gender,
        profileImage: teacher.profile_image,
        createdAt: teacher.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Get teacher by ID
router.get('/:id', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const teacher = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .select(
        'teachers.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'users.address',
        'users.date_of_birth',
        'users.gender',
        'users.profile_image'
      )
      .where('teachers.id', req.params.id)
      .first();

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      id: teacher.id,
      userId: teacher.user_id,
      employeeId: teacher.employee_id,
      department: teacher.department,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      joiningDate: teacher.joining_date,
      employmentType: teacher.employment_type,
      salary: teacher.salary,
      bankAccount: teacher.bank_account,
      taxId: teacher.tax_id,
      status: teacher.status,
      bio: teacher.bio,
      firstName: teacher.first_name,
      lastName: teacher.last_name,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      dateOfBirth: teacher.date_of_birth,
      gender: teacher.gender,
      profileImage: teacher.profile_image,
      createdAt: teacher.created_at
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ message: 'Failed to fetch teacher' });
  }
});

// Create new teacher
router.post('/', authenticateToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('employeeId').notEmpty().trim(),
  body('department').notEmpty().trim(),
  body('joiningDate').isISO8601(),
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
      email, password, firstName, lastName, employeeId, department,
      qualification, specialization, joiningDate, employmentType,
      salary, bankAccount, taxId, phone, address, dateOfBirth,
      gender, bio
    } = req.body;

    // Check if employee ID already exists
    const existingTeacher = await db('teachers').where('employee_id', employeeId).first();
    if (existingTeacher) {
      return res.status(400).json({ message: 'Employee ID already exists' });
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
        role: 'teacher',
        phone,
        address,
        date_of_birth: dateOfBirth,
        gender
      }).returning(['id']);

      // Create teacher record
      const [teacher] = await trx('teachers').insert({
        user_id: user.id,
        employee_id: employeeId,
        department,
        qualification,
        specialization,
        joining_date: joiningDate,
        employment_type: employmentType || 'full_time',
        salary,
        bank_account: bankAccount,
        tax_id: taxId,
        bio
      }).returning(['id', 'employee_id']);

      await trx.commit();

      res.status(201).json({
        message: 'Teacher created successfully',
        teacher: {
          id: teacher.id,
          employeeId: teacher.employee_id
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ message: 'Failed to create teacher' });
  }
});

// Update teacher
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
      department, qualification, specialization, employmentType,
      salary, bankAccount, taxId, status, bio
    } = req.body;

    const teacher = await db('teachers').where('id', req.params.id).first();
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
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
        await trx('users').where('id', teacher.user_id).update(userUpdateData);
      }

      // Update teacher information
      const teacherUpdateData = {};
      if (department) teacherUpdateData.department = department;
      if (qualification) teacherUpdateData.qualification = qualification;
      if (specialization) teacherUpdateData.specialization = specialization;
      if (employmentType) teacherUpdateData.employment_type = employmentType;
      if (salary) teacherUpdateData.salary = salary;
      if (bankAccount) teacherUpdateData.bank_account = bankAccount;
      if (taxId) teacherUpdateData.tax_id = taxId;
      if (status) teacherUpdateData.status = status;
      if (bio) teacherUpdateData.bio = bio;

      if (Object.keys(teacherUpdateData).length > 0) {
        await trx('teachers').where('id', req.params.id).update(teacherUpdateData);
      }

      await trx.commit();

      res.json({ message: 'Teacher updated successfully' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ message: 'Failed to update teacher' });
  }
});

// Delete teacher
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const teacher = await db('teachers').where('id', req.params.id).first();
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const trx = await db.transaction();

    try {
      // Delete teacher record
      await trx('teachers').where('id', req.params.id).del();
      
      // Delete user account
      await trx('users').where('id', teacher.user_id).del();

      await trx.commit();

      res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

// Get teacher's classes
router.get('/:id/classes', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const classes = await db('classes')
      .select('*')
      .where('class_teacher_id', req.params.id);

    res.json(classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      code: cls.code,
      gradeLevel: cls.grade_level,
      section: cls.section,
      maxStudents: cls.max_students,
      description: cls.description,
      isActive: cls.is_active
    })));
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Failed to fetch teacher classes' });
  }
});

// Get teacher's subjects
router.get('/:id/subjects', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const subjects = await db('timetable')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .select('subjects.*')
      .where('timetable.teacher_id', req.params.id)
      .distinct();

    res.json(subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description,
      department: subject.department,
      credits: subject.credits,
      isCore: subject.is_core,
      isActive: subject.is_active
    })));
  } catch (error) {
    console.error('Get teacher subjects error:', error);
    res.status(500).json({ message: 'Failed to fetch teacher subjects' });
  }
});

module.exports = router;
