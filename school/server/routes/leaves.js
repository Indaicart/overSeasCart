const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  calculateLeaveDays,
  generateApplicationNumber,
  checkLeaveBalance,
  updateLeaveBalance,
  checkOverlappingLeaves,
  initializeLeaveBalances,
  calculateUnpaidLeaveDays,
  getLeaveStats
} = require('../utils/leaveHelper');

// ==================== LEAVE TYPES ====================

/**
 * GET /api/leaves/types
 * Get all leave types for the school
 */
router.get('/types', async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    
    const leaveTypes = await db('leave_types')
      .where({ school_id: schoolId, is_active: true })
      .orderBy('display_order', 'asc');
    
    res.json({
      success: true,
      data: leaveTypes
    });
  } catch (error) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave types'
    });
  }
});

/**
 * POST /api/leaves/types
 * Create a new leave type (Admin only)
 */
router.post('/types', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create leave types'
      });
    }
    
    const schoolId = req.user.schoolId;
    const leaveType = await db('leave_types')
      .insert({
        school_id: schoolId,
        ...req.body
      })
      .returning('*');
    
    res.json({
      success: true,
      message: 'Leave type created successfully',
      data: leaveType[0]
    });
  } catch (error) {
    console.error('Error creating leave type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave type'
    });
  }
});

// ==================== LEAVE BALANCES ====================

/**
 * GET /api/leaves/balance
 * Get leave balance for current user
 */
router.get('/balance', async (req, res) => {
  try {
    const userId = req.user.id;
    const year = req.query.year || new Date().getFullYear();
    
    // Get teacher record
    const teacher = await db('teachers')
      .where({ user_id: userId })
      .first();
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found'
      });
    }
    
    // Initialize balances if not exists
    await initializeLeaveBalances(req.user.schoolId, teacher.id, year);
    
    // Get balances
    const balances = await db('leave_balances as lb')
      .join('leave_types as lt', 'lb.leave_type_id', 'lt.id')
      .where({
        'lb.teacher_id': teacher.id,
        'lb.year': year
      })
      .select(
        'lb.*',
        'lt.name as leave_type_name',
        'lt.code',
        'lt.is_paid',
        'lt.allow_half_day'
      )
      .orderBy('lt.display_order', 'asc');
    
    res.json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave balance'
    });
  }
});

/**
 * GET /api/leaves/balance/:teacherId
 * Get leave balance for specific teacher (Admin only)
 */
router.get('/balance/:teacherId', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view other teachers\' balances'
      });
    }
    
    const { teacherId } = req.params;
    const year = req.query.year || new Date().getFullYear();
    
    await initializeLeaveBalances(req.user.schoolId, teacherId, year);
    
    const balances = await db('leave_balances as lb')
      .join('leave_types as lt', 'lb.leave_type_id', 'lt.id')
      .where({
        'lb.teacher_id': teacherId,
        'lb.year': year
      })
      .select(
        'lb.*',
        'lt.name as leave_type_name',
        'lt.code',
        'lt.is_paid'
      );
    
    res.json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error('Error fetching teacher leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave balance'
    });
  }
});

/**
 * POST /api/leaves/balance/initialize
 * Initialize leave balances for all teachers (Admin only)
 */
router.post('/balance/initialize', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can initialize leave balances'
      });
    }
    
    const schoolId = req.user.schoolId;
    const year = req.body.year || new Date().getFullYear();
    
    // Get all active teachers
    const teachers = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .where({
        'users.school_id': schoolId,
        'teachers.status': 'active'
      })
      .select('teachers.id');
    
    for (const teacher of teachers) {
      await initializeLeaveBalances(schoolId, teacher.id, year);
    }
    
    res.json({
      success: true,
      message: `Leave balances initialized for ${teachers.length} teachers`
    });
  } catch (error) {
    console.error('Error initializing leave balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize leave balances'
    });
  }
});

// ==================== LEAVE APPLICATIONS ====================

/**
 * GET /api/leaves/applications
 * Get leave applications for current user
 */
router.get('/applications', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, year } = req.query;
    
    const teacher = await db('teachers')
      .where({ user_id: userId })
      .first();
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found'
      });
    }
    
    let query = db('leave_applications as la')
      .join('leave_types as lt', 'la.leave_type_id', 'lt.id')
      .leftJoin('users as reviewer', 'la.reviewed_by', 'reviewer.id')
      .where({ 'la.teacher_id': teacher.id })
      .select(
        'la.*',
        'lt.name as leave_type_name',
        'lt.code as leave_type_code',
        'lt.is_paid',
        'reviewer.name as reviewed_by_name'
      )
      .orderBy('la.created_at', 'desc');
    
    if (status) {
      query = query.where('la.status', status);
    }
    
    if (year) {
      query = query.whereRaw('EXTRACT(YEAR FROM la.start_date) = ?', [year]);
    }
    
    const applications = await query;
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave applications'
    });
  }
});

/**
 * GET /api/leaves/applications/all
 * Get all leave applications (Admin only)
 */
router.get('/applications/all', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all applications'
      });
    }
    
    const schoolId = req.user.schoolId;
    const { status, month, year } = req.query;
    
    let query = db('leave_applications as la')
      .join('teachers as t', 'la.teacher_id', 't.id')
      .join('users as u', 't.user_id', 'u.id')
      .join('leave_types as lt', 'la.leave_type_id', 'lt.id')
      .leftJoin('users as reviewer', 'la.reviewed_by', 'reviewer.id')
      .where({ 'la.school_id': schoolId })
      .select(
        'la.*',
        't.employee_id',
        'u.name as teacher_name',
        'u.email as teacher_email',
        'lt.name as leave_type_name',
        'lt.code as leave_type_code',
        'lt.is_paid',
        'reviewer.name as reviewed_by_name'
      )
      .orderBy('la.created_at', 'desc');
    
    if (status) {
      query = query.where('la.status', status);
    }
    
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = query.where(function() {
        this.whereBetween('la.start_date', [startDate, endDate])
          .orWhereBetween('la.end_date', [startDate, endDate]);
      });
    }
    
    const applications = await query;
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching all leave applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave applications'
    });
  }
});

/**
 * GET /api/leaves/applications/:id
 * Get specific leave application
 */
router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await db('leave_applications as la')
      .join('teachers as t', 'la.teacher_id', 't.id')
      .join('users as u', 't.user_id', 'u.id')
      .join('leave_types as lt', 'la.leave_type_id', 'lt.id')
      .leftJoin('users as reviewer', 'la.reviewed_by', 'reviewer.id')
      .where({ 'la.id': id })
      .select(
        'la.*',
        't.employee_id',
        'u.name as teacher_name',
        'u.email as teacher_email',
        'lt.name as leave_type_name',
        'lt.code as leave_type_code',
        'lt.is_paid',
        'reviewer.name as reviewed_by_name'
      )
      .first();
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching leave application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave application'
    });
  }
});

/**
 * POST /api/leaves/applications
 * Submit a new leave application
 */
router.post('/applications', async (req, res) => {
  try {
    const userId = req.user.id;
    const schoolId = req.user.schoolId;
    const {
      leave_type_id,
      start_date,
      end_date,
      day_type,
      reason,
      contact_during_leave,
      is_emergency
    } = req.body;
    
    // Get teacher record
    const teacher = await db('teachers')
      .where({ user_id: userId })
      .first();
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found'
      });
    }
    
    // Get leave type
    const leaveType = await db('leave_types')
      .where({ id: leave_type_id })
      .first();
    
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }
    
    // Calculate total days
    const totalDays = calculateLeaveDays(start_date, end_date, day_type, true);
    
    // Check for overlapping leaves
    const overlapping = await checkOverlappingLeaves(teacher.id, start_date, end_date);
    if (overlapping.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave application for these dates'
      });
    }
    
    // Check leave balance
    const year = new Date(start_date).getFullYear();
    await initializeLeaveBalances(schoolId, teacher.id, year);
    
    const balanceCheck = await checkLeaveBalance(teacher.id, leave_type_id, totalDays, year);
    if (!balanceCheck.available) {
      return res.status(400).json({
        success: false,
        message: balanceCheck.message
      });
    }
    
    // Generate application number
    const applicationNumber = await generateApplicationNumber(schoolId);
    
    // Create application
    const application = await db('leave_applications')
      .insert({
        school_id: schoolId,
        teacher_id: teacher.id,
        leave_type_id,
        application_number: applicationNumber,
        start_date,
        end_date,
        total_days: totalDays,
        day_type: day_type || 'full_day',
        reason,
        contact_during_leave,
        is_emergency: is_emergency || false,
        affects_salary: !leaveType.is_paid,
        salary_deduction_days: !leaveType.is_paid ? totalDays : 0,
        status: 'pending'
      })
      .returning('*');
    
    // Update leave balance (reserve)
    await updateLeaveBalance(teacher.id, leave_type_id, totalDays, year, 'reserve');
    
    res.json({
      success: true,
      message: 'Leave application submitted successfully',
      data: application[0]
    });
  } catch (error) {
    console.error('Error submitting leave application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave application'
    });
  }
});

/**
 * PUT /api/leaves/applications/:id/approve
 * Approve a leave application (Admin only)
 */
router.put('/applications/:id/approve', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can approve leave applications'
      });
    }
    
    const { id } = req.params;
    const { review_comments } = req.body;
    
    const application = await db('leave_applications')
      .where({ id })
      .first();
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be approved'
      });
    }
    
    const year = new Date(application.start_date).getFullYear();
    
    // Update application
    await db('leave_applications')
      .where({ id })
      .update({
        status: 'approved',
        reviewed_by: req.user.id,
        reviewed_at: new Date(),
        review_comments
      });
    
    // Update leave balance (from pending to used)
    await updateLeaveBalance(
      application.teacher_id,
      application.leave_type_id,
      application.total_days,
      year,
      'approve'
    );
    
    res.json({
      success: true,
      message: 'Leave application approved successfully'
    });
  } catch (error) {
    console.error('Error approving leave application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve leave application'
    });
  }
});

/**
 * PUT /api/leaves/applications/:id/reject
 * Reject a leave application (Admin only)
 */
router.put('/applications/:id/reject', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reject leave applications'
      });
    }
    
    const { id } = req.params;
    const { review_comments } = req.body;
    
    const application = await db('leave_applications')
      .where({ id })
      .first();
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be rejected'
      });
    }
    
    const year = new Date(application.start_date).getFullYear();
    
    // Update application
    await db('leave_applications')
      .where({ id })
      .update({
        status: 'rejected',
        reviewed_by: req.user.id,
        reviewed_at: new Date(),
        review_comments
      });
    
    // Update leave balance (release reserved balance)
    await updateLeaveBalance(
      application.teacher_id,
      application.leave_type_id,
      application.total_days,
      year,
      'reject'
    );
    
    res.json({
      success: true,
      message: 'Leave application rejected'
    });
  } catch (error) {
    console.error('Error rejecting leave application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject leave application'
    });
  }
});

/**
 * PUT /api/leaves/applications/:id/cancel
 * Cancel own leave application
 */
router.put('/applications/:id/cancel', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const teacher = await db('teachers')
      .where({ user_id: userId })
      .first();
    
    const application = await db('leave_applications')
      .where({ id, teacher_id: teacher.id })
      .first();
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    if (application.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Application is already cancelled'
      });
    }
    
    const year = new Date(application.start_date).getFullYear();
    
    // Update application
    await db('leave_applications')
      .where({ id })
      .update({
        status: 'cancelled'
      });
    
    // Update leave balance based on previous status
    if (application.status === 'pending') {
      await updateLeaveBalance(
        application.teacher_id,
        application.leave_type_id,
        application.total_days,
        year,
        'reject' // Release reserved balance
      );
    } else if (application.status === 'approved') {
      await updateLeaveBalance(
        application.teacher_id,
        application.leave_type_id,
        application.total_days,
        year,
        'cancel' // Return from used to available
      );
    }
    
    res.json({
      success: true,
      message: 'Leave application cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling leave application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave application'
    });
  }
});

// ==================== LEAVE REPORTS & STATS ====================

/**
 * GET /api/leaves/stats
 * Get leave statistics for current user
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const year = req.query.year || new Date().getFullYear();
    
    const teacher = await db('teachers')
      .where({ user_id: userId })
      .first();
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found'
      });
    }
    
    const stats = await getLeaveStats(teacher.id, year);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave statistics'
    });
  }
});

/**
 * GET /api/leaves/calendar
 * Get leave calendar for a month (Admin only)
 */
router.get('/calendar', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view leave calendar'
      });
    }
    
    const schoolId = req.user.schoolId;
    const { month, year } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const leaves = await db('leave_applications as la')
      .join('teachers as t', 'la.teacher_id', 't.id')
      .join('users as u', 't.user_id', 'u.id')
      .join('leave_types as lt', 'la.leave_type_id', 'lt.id')
      .where({ 'la.school_id': schoolId })
      .whereIn('la.status', ['approved', 'pending'])
      .where(function() {
        this.whereBetween('la.start_date', [startDate, endDate])
          .orWhereBetween('la.end_date', [startDate, endDate])
          .orWhere(function() {
            this.where('la.start_date', '<=', startDate)
              .andWhere('la.end_date', '>=', endDate);
          });
      })
      .select(
        'la.*',
        'u.name as teacher_name',
        't.employee_id',
        'lt.name as leave_type_name',
        'lt.code as leave_type_code'
      )
      .orderBy('la.start_date', 'asc');
    
    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    console.error('Error fetching leave calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave calendar'
    });
  }
});

/**
 * GET /api/leaves/unpaid-days/:teacherId
 * Calculate unpaid leave days for salary deduction
 */
router.get('/unpaid-days/:teacherId', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can calculate unpaid days'
      });
    }
    
    const { teacherId } = req.params;
    const { month, year } = req.query;
    
    const unpaidDays = await calculateUnpaidLeaveDays(
      teacherId,
      parseInt(month),
      parseInt(year)
    );
    
    res.json({
      success: true,
      data: {
        teacher_id: teacherId,
        month: parseInt(month),
        year: parseInt(year),
        unpaid_days: unpaidDays
      }
    });
  } catch (error) {
    console.error('Error calculating unpaid days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate unpaid days'
    });
  }
});

module.exports = router;

