const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  calculateGrossSalary,
  calculateTotalDeductions,
  calculateNetSalary,
  calculateProRatedSalary,
  generateSlipNumber,
  getMonthName,
  getCurrentMonthYear,
  isSalaryPaid,
  generateSalaryBreakdown,
  getPendingMonths
} = require('../utils/payrollHelper');
const { calculateUnpaidLeaveDays } = require('../utils/leaveHelper');
const {
  createRazorpayOrder,
  generateReceiptNumber
} = require('../utils/paymentHelper');

/**
 * @route   POST /api/payroll/salary-config
 * @desc    Configure salary for a staff member
 * @access  Private (Admin only)
 */
router.post('/salary-config', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can configure salaries'
      });
    }
    
    const { teacher_id, ...salaryData } = req.body;
    const schoolId = req.user.school_id;
    
    // Calculate gross and net salary
    const grossSalary = calculateGrossSalary(salaryData);
    const netSalary = calculateNetSalary(salaryData);
    
    // Deactivate previous salary configurations
    await db('staff_salaries')
      .where({ teacher_id, school_id })
      .update({ is_active: false, effective_to: new Date() });
    
    // Insert new salary configuration
    const [salary] = await db('staff_salaries')
      .insert({
        school_id: schoolId,
        teacher_id,
        ...salaryData,
        gross_salary: grossSalary,
        net_salary: netSalary,
        effective_from: salaryData.effective_from || new Date()
      })
      .returning('*');
    
    res.json({
      success: true,
      message: 'Salary configured successfully',
      data: salary
    });
  } catch (error) {
    console.error('Configure salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payroll/salary-config/:teacherId
 * @desc    Get salary configuration for a teacher
 * @access  Private
 */
router.get('/salary-config/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const schoolId = req.user.school_id;
    
    const salary = await db('staff_salaries')
      .where({ teacher_id: teacherId, school_id: schoolId, is_active: true })
      .first();
    
    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: salary
    });
  } catch (error) {
    console.error('Get salary config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payroll/staff-list
 * @desc    Get list of all staff with salary info
 * @access  Private (Admin only)
 */
router.get('/staff-list', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view staff list'
      });
    }
    
    const schoolId = req.user.school_id;
    
    const staff = await db('teachers as t')
      .leftJoin('staff_salaries as ss', function() {
        this.on('t.id', '=', 'ss.teacher_id')
          .andOn('ss.is_active', '=', db.raw('?', [true]));
      })
      .leftJoin(
        db('salary_payments')
          .select('teacher_id')
          .count('* as payment_count')
          .where('payment_status', 'paid')
          .groupBy('teacher_id')
          .as('sp'),
        't.id',
        'sp.teacher_id'
      )
      .where('t.school_id', schoolId)
      .select(
        't.id',
        't.first_name',
        't.last_name',
        't.email',
        't.phone',
        't.employee_id',
        't.date_of_joining',
        'ss.net_salary',
        'ss.gross_salary',
        'ss.payment_frequency',
        'ss.bank_name',
        'ss.account_number',
        db.raw('COALESCE(sp.payment_count, 0) as payments_made'),
        db.raw('CASE WHEN ss.id IS NOT NULL THEN true ELSE false END as salary_configured')
      );
    
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payroll/pending-payments
 * @desc    Get list of pending salary payments
 * @access  Private (Admin only)
 */
router.get('/pending-payments', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view pending payments'
      });
    }
    
    const schoolId = req.user.school_id;
    const { month, year } = req.query;
    const currentMonthYear = getCurrentMonthYear();
    const targetMonth = month ? parseInt(month) : currentMonthYear.month;
    const targetYear = year ? parseInt(year) : currentMonthYear.year;
    
    // Get all active staff with salary configured
    const staff = await db('teachers as t')
      .join('staff_salaries as ss', function() {
        this.on('t.id', '=', 'ss.teacher_id')
          .andOn('ss.is_active', '=', db.raw('?', [true]));
      })
      .leftJoin('salary_payments as sp', function() {
        this.on('t.id', '=', 'sp.teacher_id')
          .andOn('sp.payment_month', '=', db.raw('?', [targetMonth]))
          .andOn('sp.payment_year', '=', db.raw('?', [targetYear]));
      })
      .where('t.school_id', schoolId)
      .select(
        't.id as teacher_id',
        't.first_name',
        't.last_name',
        't.employee_id',
        'ss.id as salary_id',
        'ss.net_salary',
        'ss.gross_salary',
        'ss.bank_name',
        'ss.account_number',
        'ss.ifsc_code',
        'sp.id as payment_id',
        'sp.payment_status',
        'sp.paid_amount',
        'sp.pending_amount'
      );
    
    const pendingPayments = staff.map(s => ({
      ...s,
      payment_month: targetMonth,
      payment_year: targetYear,
      month_name: getMonthName(targetMonth),
      is_pending: !s.payment_id || s.payment_status !== 'paid',
      has_bank_details: !!(s.bank_name && s.account_number)
    }));
    
    res.json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        month_name: getMonthName(targetMonth),
        payments: pendingPayments
      }
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payroll/process-offline-payment
 * @desc    Process offline cash salary payment
 * @access  Private (Admin only)
 */
router.post('/process-offline-payment', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can process payments'
      });
    }
    
    const {
      teacher_id,
      payment_month,
      payment_year,
      paid_amount,
      working_days,
      present_days,
      leave_days,
      bonus = 0,
      penalty = 0,
      notes
    } = req.body;
    
    const schoolId = req.user.school_id;
    
    // Get active salary configuration
    const salary = await db('staff_salaries')
      .where({ teacher_id, school_id: schoolId, is_active: true })
      .first();
    
    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary configuration not found'
      });
    }
    
    // Calculate unpaid leave days for the month
    const unpaidLeaveDays = await calculateUnpaidLeaveDays(
      teacher_id,
      payment_month,
      payment_year
    );
    
    // Calculate amounts
    let netAmount = salary.net_salary;
    
    // Pro-rate if working days provided
    if (working_days && present_days) {
      netAmount = calculateProRatedSalary(netAmount, working_days, present_days);
    }
    
    // Deduct unpaid leave days from salary
    if (unpaidLeaveDays > 0) {
      const perDaySalary = salary.net_salary / (working_days || 26);
      const unpaidLeaveDeduction = perDaySalary * unpaidLeaveDays;
      netAmount = netAmount - unpaidLeaveDeduction;
    }
    
    // Add bonus and subtract penalty
    netAmount = netAmount + parseFloat(bonus) - parseFloat(penalty);
    const paidAmountNum = parseFloat(paid_amount);
    const pendingAmount = netAmount - paidAmountNum;
    
    // Generate slip number
    const slipNumber = generateSlipNumber(teacher_id, payment_month, payment_year);
    
    // Calculate unpaid leave deduction amount
    const perDaySalary = salary.net_salary / (working_days || 26);
    const unpaidLeaveDeduction = unpaidLeaveDays > 0 ? perDaySalary * unpaidLeaveDays : 0;
    
    // Generate salary breakdown
    const salaryBreakdown = generateSalaryBreakdown(salary, {
      bonus,
      penalty,
      working_days,
      present_days,
      leave_days,
      unpaid_leave_days: unpaidLeaveDays,
      unpaid_leave_deduction: unpaidLeaveDeduction
    });
    
    // Check if payment already exists
    const existingPayment = await db('salary_payments')
      .where({ teacher_id, payment_month, payment_year })
      .first();
    
    let payment;
    
    if (existingPayment) {
      // Update existing payment
      const newPaidAmount = parseFloat(existingPayment.paid_amount) + paidAmountNum;
      const newPendingAmount = netAmount - newPaidAmount;
      const newStatus = newPendingAmount <= 0 ? 'paid' : 'partial';
      
      [payment] = await db('salary_payments')
        .where({ id: existingPayment.id })
        .update({
          paid_amount: newPaidAmount,
          pending_amount: newPendingAmount,
          payment_status: newStatus,
          payment_date: newStatus === 'paid' ? new Date() : existingPayment.payment_date,
          offline_notes: notes,
          updated_at: db.fn.now()
        })
        .returning('*');
    } else {
      // Create new payment
      const paymentStatus = pendingAmount <= 0 ? 'paid' : 'partial';
      
      [payment] = await db('salary_payments')
        .insert({
          school_id: schoolId,
          teacher_id,
          staff_salary_id: salary.id,
          payment_month,
          payment_year,
          gross_amount: salary.gross_salary,
          deductions: calculateTotalDeductions(salary),
          net_amount: netAmount,
          paid_amount: paidAmountNum,
          pending_amount: pendingAmount,
          payment_method: 'offline_cash',
          payment_status: paymentStatus,
          payment_date: paymentStatus === 'paid' ? new Date() : null,
          paid_by: req.user.id,
          offline_notes: notes,
          slip_number: slipNumber,
          salary_breakdown: salaryBreakdown,
          working_days,
          present_days,
          leave_days,
          bonus,
          penalty
        })
        .returning('*');
    }
    
    res.json({
      success: true,
      message: pendingAmount <= 0 ? 'Salary paid successfully' : 'Partial payment recorded',
      data: payment
    });
  } catch (error) {
    console.error('Process offline payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payroll/initiate-online-payment
 * @desc    Initiate online salary payment via Razorpay
 * @access  Private (Admin only)
 */
router.post('/initiate-online-payment', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can process payments'
      });
    }
    
    const {
      teacher_id,
      payment_month,
      payment_year,
      working_days,
      present_days,
      leave_days,
      bonus = 0,
      penalty = 0
    } = req.body;
    
    const schoolId = req.user.school_id;
    
    // Get teacher details
    const teacher = await db('teachers')
      .where({ id: teacher_id, school_id: schoolId })
      .first();
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Get active salary configuration
    const salary = await db('staff_salaries')
      .where({ teacher_id, school_id: schoolId, is_active: true })
      .first();
    
    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary configuration not found'
      });
    }
    
    // Check if bank details exist
    if (!salary.bank_name || !salary.account_number) {
      return res.status(400).json({
        success: false,
        message: 'Bank details not configured for this staff member'
      });
    }
    
    // Calculate unpaid leave days for the month
    const unpaidLeaveDays = await calculateUnpaidLeaveDays(
      teacher_id,
      payment_month,
      payment_year
    );
    
    // Calculate amount
    let netAmount = salary.net_salary;
    
    if (working_days && present_days) {
      netAmount = calculateProRatedSalary(netAmount, working_days, present_days);
    }
    
    // Deduct unpaid leave days from salary
    if (unpaidLeaveDays > 0) {
      const perDaySalary = salary.net_salary / (working_days || 26);
      const unpaidLeaveDeduction = perDaySalary * unpaidLeaveDays;
      netAmount = netAmount - unpaidLeaveDeduction;
    }
    
    netAmount = netAmount + parseFloat(bonus) - parseFloat(penalty);
    
    // Generate slip number
    const slipNumber = generateSlipNumber(teacher_id, payment_month, payment_year);
    
    // Calculate unpaid leave deduction amount
    const perDaySalary = salary.net_salary / (working_days || 26);
    const unpaidLeaveDeduction = unpaidLeaveDays > 0 ? perDaySalary * unpaidLeaveDays : 0;
    
    // Generate salary breakdown
    const salaryBreakdown = generateSalaryBreakdown(salary, {
      bonus,
      penalty,
      working_days,
      present_days,
      leave_days,
      unpaid_leave_days: unpaidLeaveDays,
      unpaid_leave_deduction: unpaidLeaveDeduction
    });
    
    // Create or get salary payment record
    let salaryPayment = await db('salary_payments')
      .where({ teacher_id, payment_month, payment_year })
      .first();
    
    if (!salaryPayment) {
      [salaryPayment] = await db('salary_payments')
        .insert({
          school_id: schoolId,
          teacher_id,
          staff_salary_id: salary.id,
          payment_month,
          payment_year,
          gross_amount: salary.gross_salary,
          deductions: calculateTotalDeductions(salary),
          net_amount: netAmount,
          paid_amount: 0,
          pending_amount: netAmount,
          payment_method: 'online_transfer',
          payment_status: 'pending',
          paid_by: req.user.id,
          slip_number: slipNumber,
          salary_breakdown: salaryBreakdown,
          working_days,
          present_days,
          leave_days,
          bonus,
          penalty
        })
        .returning('*');
    }
    
    // Create Razorpay order through payments API
    const receiptNumber = generateReceiptNumber('salary');
    const orderResult = await createRazorpayOrder({
      amount: netAmount,
      currency: 'INR',
      receipt: receiptNumber,
      notes: {
        payment_type: 'staff_salary',
        teacher_id,
        payment_month,
        payment_year,
        salary_payment_id: salaryPayment.id
      }
    });
    
    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: orderResult.error
      });
    }
    
    // Create payment record
    const [payment] = await db('payments')
      .insert({
        school_id: schoolId,
        user_id: req.user.id,
        payment_type: 'staff_salary',
        amount: netAmount,
        currency: 'INR',
        status: 'pending',
        razorpay_order_id: orderResult.order.id,
        description: `Salary payment for ${teacher.first_name} ${teacher.last_name} - ${getMonthName(payment_month)} ${payment_year}`,
        metadata: {
          teacher_id,
          payment_month,
          payment_year,
          salary_payment_id: salaryPayment.id,
          bank_details: {
            bank_name: salary.bank_name,
            account_number: salary.account_number,
            ifsc_code: salary.ifsc_code,
            account_holder_name: salary.account_holder_name
          }
        },
        receipt_number: receiptNumber
      })
      .returning('*');
    
    // Update salary payment with payment_id
    await db('salary_payments')
      .where({ id: salaryPayment.id })
      .update({
        payment_id: payment.id,
        razorpay_order_id: orderResult.order.id
      });
    
    res.json({
      success: true,
      message: 'Online payment initiated',
      data: {
        orderId: orderResult.order.id,
        amount: netAmount,
        currency: 'INR',
        receipt: receiptNumber,
        paymentId: payment.id,
        salaryPaymentId: salaryPayment.id,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX',
        teacher: {
          name: `${teacher.first_name} ${teacher.last_name}`,
          employee_id: teacher.employee_id
        },
        bank_details: {
          bank_name: salary.bank_name,
          account_number: salary.account_number.slice(-4),
          ifsc_code: salary.ifsc_code
        }
      }
    });
  } catch (error) {
    console.error('Initiate online payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payroll/complete-online-payment
 * @desc    Complete online salary payment after Razorpay success
 * @access  Private (Admin only)
 */
router.post('/complete-online-payment', async (req, res) => {
  try {
    const { salary_payment_id, razorpay_payment_id } = req.body;
    
    // Get salary payment
    const salaryPayment = await db('salary_payments')
      .where({ id: salary_payment_id })
      .first();
    
    if (!salaryPayment) {
      return res.status(404).json({
        success: false,
        message: 'Salary payment not found'
      });
    }
    
    // Update salary payment status
    await db('salary_payments')
      .where({ id: salary_payment_id })
      .update({
        payment_status: 'paid',
        paid_amount: salaryPayment.net_amount,
        pending_amount: 0,
        payment_date: new Date(),
        razorpay_payment_id,
        updated_at: db.fn.now()
      });
    
    res.json({
      success: true,
      message: 'Salary payment completed successfully'
    });
  } catch (error) {
    console.error('Complete online payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payroll/payment-history/:teacherId
 * @desc    Get payment history for a teacher
 * @access  Private
 */
router.get('/payment-history/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const schoolId = req.user.school_id;
    
    const payments = await db('salary_payments as sp')
      .join('staff_salaries as ss', 'sp.staff_salary_id', 'ss.id')
      .leftJoin('users as u', 'sp.paid_by', 'u.id')
      .where('sp.teacher_id', teacherId)
      .where('sp.school_id', schoolId)
      .select(
        'sp.*',
        'ss.net_salary',
        db.raw("CONCAT(u.first_name, ' ', u.last_name) as paid_by_name")
      )
      .orderBy('sp.payment_year', 'desc')
      .orderBy('sp.payment_month', 'desc');
    
    // Add month names
    const paymentsWithMonths = payments.map(p => ({
      ...p,
      month_name: getMonthName(p.payment_month)
    }));
    
    res.json({
      success: true,
      data: paymentsWithMonths
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payroll/salary-slip/:id
 * @desc    Get salary slip details
 * @access  Private
 */
router.get('/salary-slip/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;
    
    const slip = await db('salary_payments as sp')
      .join('teachers as t', 'sp.teacher_id', 't.id')
      .join('staff_salaries as ss', 'sp.staff_salary_id', 'ss.id')
      .join('schools as sc', 'sp.school_id', 'sc.id')
      .where('sp.id', id)
      .where('sp.school_id', schoolId)
      .select(
        'sp.*',
        't.first_name',
        't.last_name',
        't.employee_id',
        't.email',
        't.phone',
        't.designation',
        't.date_of_joining',
        'ss.bank_name',
        'ss.account_number',
        'ss.ifsc_code',
        'ss.pan_number',
        'sc.name as school_name',
        'sc.address as school_address'
      )
      .first();
    
    if (!slip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found'
      });
    }
    
    slip.month_name = getMonthName(slip.payment_month);
    
    res.json({
      success: true,
      data: slip
    });
  } catch (error) {
    console.error('Get salary slip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

