const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Create fee record
router.post('/', authenticateToken, requireAdmin, [
  body('studentId').isUUID(),
  body('feeType').notEmpty().trim(),
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, feeType, amount, dueDate, notes } = req.body;

    const [fee] = await db('fees').insert({
      student_id: studentId,
      fee_type: feeType,
      amount: amount,
      due_date: dueDate,
      notes: notes
    }).returning('*');

    res.status(201).json({
      message: 'Fee record created successfully',
      fee: {
        id: fee.id,
        feeType: fee.fee_type,
        amount: fee.amount,
        dueDate: fee.due_date
      }
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({ message: 'Failed to create fee record' });
  }
});

// Get fees for a student
router.get('/student/:studentId', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, feeType, startDate, endDate } = req.query;

    let query = db('fees')
      .select('*')
      .where('student_id', studentId);

    if (status) {
      query = query.where('status', status);
    }
    if (feeType) {
      query = query.where('fee_type', feeType);
    }
    if (startDate) {
      query = query.where('due_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('due_date', '<=', endDate);
    }

    const fees = await query.orderBy('due_date', 'desc');

    res.json(fees.map(fee => ({
      id: fee.id,
      studentId: fee.student_id,
      feeType: fee.fee_type,
      amount: fee.amount,
      dueDate: fee.due_date,
      status: fee.status,
      paidDate: fee.paid_date,
      paymentMethod: fee.payment_method,
      transactionId: fee.transaction_id,
      notes: fee.notes,
      createdAt: fee.created_at
    })));
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({ message: 'Failed to fetch student fees' });
  }
});

// Get all fees (with filters)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      feeType, 
      classId, 
      startDate, 
      endDate,
      search 
    } = req.query;
    const offset = (page - 1) * limit;

    let query = db('fees')
      .join('students', 'fees.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .select(
        'fees.*',
        'students.student_id as student_id_number',
        'users.first_name',
        'users.last_name',
        'classes.name as class_name',
        'classes.code as class_code'
      );

    // Apply filters
    if (status) {
      query = query.where('fees.status', status);
    }
    if (feeType) {
      query = query.where('fees.fee_type', feeType);
    }
    if (classId) {
      query = query.where('students.class_id', classId);
    }
    if (startDate) {
      query = query.where('fees.due_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('fees.due_date', '<=', endDate);
    }
    if (search) {
      query = query.where(function() {
        this.where('users.first_name', 'ilike', `%${search}%`)
          .orWhere('users.last_name', 'ilike', `%${search}%`)
          .orWhere('students.student_id', 'ilike', `%${search}%`);
      });
    }

    const fees = await query
      .orderBy('fees.due_date', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('fees')
      .join('students', 'fees.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .count('* as count')
      .first();

    res.json({
      fees: fees.map(fee => ({
        id: fee.id,
        studentId: fee.student_id,
        studentIdNumber: fee.student_id_number,
        firstName: fee.first_name,
        lastName: fee.last_name,
        className: fee.class_name,
        classCode: fee.class_code,
        feeType: fee.fee_type,
        amount: fee.amount,
        dueDate: fee.due_date,
        status: fee.status,
        paidDate: fee.paid_date,
        paymentMethod: fee.payment_method,
        transactionId: fee.transaction_id,
        notes: fee.notes,
        createdAt: fee.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ message: 'Failed to fetch fees' });
  }
});

// Update fee payment
router.put('/:id/pay', authenticateToken, requireAdmin, [
  body('paymentMethod').notEmpty().trim(),
  body('transactionId').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentMethod, transactionId } = req.body;

    const fee = await db('fees').where('id', req.params.id).first();
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({ message: 'Fee is already paid' });
    }

    await db('fees')
      .where('id', req.params.id)
      .update({
        status: 'paid',
        paid_date: new Date(),
        payment_method: paymentMethod,
        transaction_id: transactionId
      });

    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Update fee payment error:', error);
    res.status(500).json({ message: 'Failed to record payment' });
  }
});

// Update fee record
router.put('/:id', authenticateToken, requireAdmin, [
  body('amount').optional().isFloat({ min: 0 }),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'paid', 'overdue', 'waived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, dueDate, status, notes } = req.body;

    const fee = await db('fees').where('id', req.params.id).first();
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (dueDate) updateData.due_date = dueDate;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await db('fees').where('id', req.params.id).update(updateData);

    res.json({ message: 'Fee record updated successfully' });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({ message: 'Failed to update fee record' });
  }
});

// Delete fee record
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const fee = await db('fees').where('id', req.params.id).first();
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({ message: 'Cannot delete paid fee record' });
    }

    await db('fees').where('id', req.params.id).del();

    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({ message: 'Failed to delete fee record' });
  }
});

// Get fee statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    let query = db('fees')
      .join('students', 'fees.student_id', 'students.id')
      .leftJoin('classes', 'students.class_id', 'classes.id');

    if (classId) {
      query = query.where('students.class_id', classId);
    }
    if (startDate) {
      query = query.where('fees.due_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('fees.due_date', '<=', endDate);
    }

    const stats = await query
      .select(
        'classes.name as class_name',
        'classes.code as class_code',
        'fees.fee_type',
        db.raw('COUNT(*) as total_fees'),
        db.raw('SUM(fees.amount) as total_amount'),
        db.raw('COUNT(CASE WHEN fees.status = \'paid\' THEN 1 END) as paid_count'),
        db.raw('SUM(CASE WHEN fees.status = \'paid\' THEN fees.amount ELSE 0 END) as paid_amount'),
        db.raw('COUNT(CASE WHEN fees.status = \'pending\' THEN 1 END) as pending_count'),
        db.raw('SUM(CASE WHEN fees.status = \'pending\' THEN fees.amount ELSE 0 END) as pending_amount'),
        db.raw('COUNT(CASE WHEN fees.status = \'overdue\' THEN 1 END) as overdue_count'),
        db.raw('SUM(CASE WHEN fees.status = \'overdue\' THEN fees.amount ELSE 0 END) as overdue_amount')
      )
      .groupBy('classes.id', 'classes.name', 'classes.code', 'fees.fee_type');

    const formattedStats = stats.map(stat => ({
      className: stat.class_name,
      classCode: stat.class_code,
      feeType: stat.fee_type,
      totalFees: parseInt(stat.total_fees),
      totalAmount: parseFloat(stat.total_amount),
      paidCount: parseInt(stat.paid_count),
      paidAmount: parseFloat(stat.paid_amount),
      pendingCount: parseInt(stat.pending_count),
      pendingAmount: parseFloat(stat.pending_amount),
      overdueCount: parseInt(stat.overdue_count),
      overdueAmount: parseFloat(stat.overdue_amount),
      collectionRate: stat.total_amount > 0 
        ? Math.round((parseFloat(stat.paid_amount) / parseFloat(stat.total_amount)) * 10000) / 100
        : 0
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Get fee stats error:', error);
    res.status(500).json({ message: 'Failed to fetch fee statistics' });
  }
});

// Get overdue fees
router.get('/overdue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const overdueFees = await db('fees')
      .join('students', 'fees.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .select(
        'fees.*',
        'students.student_id as student_id_number',
        'users.first_name',
        'users.last_name',
        'users.phone',
        'classes.name as class_name',
        'classes.code as class_code'
      )
      .where('fees.status', 'overdue')
      .orWhere(function() {
        this.where('fees.status', 'pending')
          .andWhere('fees.due_date', '<', new Date());
      })
      .orderBy('fees.due_date', 'asc')
      .limit(limit)
      .offset(offset);

    const total = await db('fees')
      .where('status', 'overdue')
      .orWhere(function() {
        this.where('status', 'pending')
          .andWhere('due_date', '<', new Date());
      })
      .count('* as count')
      .first();

    res.json({
      fees: overdueFees.map(fee => ({
        id: fee.id,
        studentId: fee.student_id,
        studentIdNumber: fee.student_id_number,
        firstName: fee.first_name,
        lastName: fee.last_name,
        phone: fee.phone,
        className: fee.class_name,
        classCode: fee.class_code,
        feeType: fee.fee_type,
        amount: fee.amount,
        dueDate: fee.due_date,
        status: fee.status,
        daysOverdue: Math.ceil((new Date() - new Date(fee.due_date)) / (1000 * 60 * 60 * 24)),
        notes: fee.notes
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get overdue fees error:', error);
    res.status(500).json({ message: 'Failed to fetch overdue fees' });
  }
});

module.exports = router;
