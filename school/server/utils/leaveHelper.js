const db = require('../db/db');

/**
 * Calculate number of days between two dates (excluding weekends optionally)
 */
const calculateLeaveDays = (startDate, endDate, dayType = 'full_day', includeWeekends = true) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (dayType === 'first_half' || dayType === 'second_half') {
    return 0.5;
  }
  
  let days = 0;
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    if (includeWeekends || (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)) {
      days++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

/**
 * Generate unique leave application number
 */
const generateApplicationNumber = async (schoolId) => {
  const year = new Date().getFullYear();
  const prefix = `LVE-${year}-${schoolId}`;
  
  const lastApplication = await db('leave_applications')
    .where('application_number', 'like', `${prefix}%`)
    .orderBy('id', 'desc')
    .first();
  
  let sequence = 1;
  if (lastApplication) {
    const lastNumber = parseInt(lastApplication.application_number.split('-').pop());
    sequence = lastNumber + 1;
  }
  
  return `${prefix}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Check if leave balance is available
 */
const checkLeaveBalance = async (teacherId, leaveTypeId, requestedDays, year) => {
  const balance = await db('leave_balances')
    .where({
      teacher_id: teacherId,
      leave_type_id: leaveTypeId,
      year: year
    })
    .first();
  
  if (!balance) {
    return { available: false, message: 'Leave balance not found for this year', balance: null };
  }
  
  if (balance.available < requestedDays) {
    return { 
      available: false, 
      message: `Insufficient leave balance. Available: ${balance.available} days, Requested: ${requestedDays} days`,
      balance 
    };
  }
  
  return { available: true, message: 'Balance available', balance };
};

/**
 * Update leave balance after application
 */
const updateLeaveBalance = async (teacherId, leaveTypeId, days, year, action = 'reserve') => {
  const balance = await db('leave_balances')
    .where({
      teacher_id: teacherId,
      leave_type_id: leaveTypeId,
      year: year
    })
    .first();
  
  if (!balance) {
    throw new Error('Leave balance not found');
  }
  
  let updates = {};
  
  switch (action) {
    case 'reserve': // When application is submitted
      updates = {
        pending: parseFloat(balance.pending) + parseFloat(days),
        available: parseFloat(balance.available) - parseFloat(days)
      };
      break;
      
    case 'approve': // When application is approved
      updates = {
        pending: parseFloat(balance.pending) - parseFloat(days),
        used: parseFloat(balance.used) + parseFloat(days)
      };
      break;
      
    case 'reject': // When application is rejected
      updates = {
        pending: parseFloat(balance.pending) - parseFloat(days),
        available: parseFloat(balance.available) + parseFloat(days)
      };
      break;
      
    case 'cancel': // When application is cancelled
      updates = {
        used: parseFloat(balance.used) - parseFloat(days),
        available: parseFloat(balance.available) + parseFloat(days)
      };
      break;
  }
  
  await db('leave_balances')
    .where({ id: balance.id })
    .update(updates);
  
  return updates;
};

/**
 * Check for overlapping leave applications
 */
const checkOverlappingLeaves = async (teacherId, startDate, endDate, excludeApplicationId = null) => {
  let query = db('leave_applications')
    .where({ teacher_id: teacherId })
    .whereIn('status', ['pending', 'approved'])
    .where(function() {
      this.whereBetween('start_date', [startDate, endDate])
        .orWhereBetween('end_date', [startDate, endDate])
        .orWhere(function() {
          this.where('start_date', '<=', startDate)
            .andWhere('end_date', '>=', endDate);
        });
    });
  
  if (excludeApplicationId) {
    query = query.where('id', '!=', excludeApplicationId);
  }
  
  const overlapping = await query;
  return overlapping;
};

/**
 * Initialize leave balances for a new year or new teacher
 */
const initializeLeaveBalances = async (schoolId, teacherId, year) => {
  // Get all active leave types for the school
  const leaveTypes = await db('leave_types')
    .where({ school_id: schoolId, is_active: true });
  
  for (const leaveType of leaveTypes) {
    // Check if balance already exists
    const existing = await db('leave_balances')
      .where({
        teacher_id: teacherId,
        leave_type_id: leaveType.id,
        year: year
      })
      .first();
    
    if (!existing) {
      // Check for carry forward from previous year
      let carriedForward = 0;
      if (leaveType.can_carry_forward) {
        const previousBalance = await db('leave_balances')
          .where({
            teacher_id: teacherId,
            leave_type_id: leaveType.id,
            year: year - 1
          })
          .first();
        
        if (previousBalance && previousBalance.available > 0) {
          carriedForward = Math.min(
            previousBalance.available,
            leaveType.max_carry_forward_days || 0
          );
        }
      }
      
      const totalAllocated = parseFloat(leaveType.annual_quota) + parseFloat(carriedForward);
      
      await db('leave_balances').insert({
        school_id: schoolId,
        teacher_id: teacherId,
        leave_type_id: leaveType.id,
        year: year,
        allocated: totalAllocated,
        used: 0,
        pending: 0,
        available: totalAllocated,
        carried_forward: carriedForward
      });
    }
  }
  
  return true;
};

/**
 * Calculate unpaid leave days for salary deduction
 */
const calculateUnpaidLeaveDays = async (teacherId, month, year) => {
  // Get the date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  // Get all approved leaves for the month
  const leaves = await db('leave_applications as la')
    .join('leave_types as lt', 'la.leave_type_id', 'lt.id')
    .where({
      'la.teacher_id': teacherId,
      'la.status': 'approved'
    })
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
      'lt.is_paid'
    );
  
  let unpaidDays = 0;
  
  for (const leave of leaves) {
    if (!leave.is_paid) {
      // Calculate how many days of this leave fall in the current month
      const leaveStart = new Date(Math.max(new Date(leave.start_date), startDate));
      const leaveEnd = new Date(Math.min(new Date(leave.end_date), endDate));
      
      const daysInMonth = calculateLeaveDays(leaveStart, leaveEnd, 'full_day', true);
      unpaidDays += daysInMonth;
    }
  }
  
  return unpaidDays;
};

/**
 * Get leave statistics for a teacher
 */
const getLeaveStats = async (teacherId, year) => {
  const balances = await db('leave_balances as lb')
    .join('leave_types as lt', 'lb.leave_type_id', 'lt.id')
    .where({
      'lb.teacher_id': teacherId,
      'lb.year': year
    })
    .select(
      'lt.name as leave_type_name',
      'lt.code',
      'lt.is_paid',
      'lb.allocated',
      'lb.used',
      'lb.pending',
      'lb.available',
      'lb.carried_forward'
    );
  
  const applications = await db('leave_applications')
    .where({ teacher_id: teacherId })
    .where('start_date', '>=', `${year}-01-01`)
    .where('start_date', '<=', `${year}-12-31`)
    .select('status')
    .count('* as count')
    .groupBy('status');
  
  return {
    balances,
    applications: applications.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {})
  };
};

module.exports = {
  calculateLeaveDays,
  generateApplicationNumber,
  checkLeaveBalance,
  updateLeaveBalance,
  checkOverlappingLeaves,
  initializeLeaveBalances,
  calculateUnpaidLeaveDays,
  getLeaveStats
};

