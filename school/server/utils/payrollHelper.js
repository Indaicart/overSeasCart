/**
 * Calculate gross salary from components
 * @param {Object} salary - Salary components
 * @returns {Number} Gross salary
 */
const calculateGrossSalary = (salary) => {
  const {
    basic_salary = 0,
    hra = 0,
    da = 0,
    ta = 0,
    medical_allowance = 0,
    other_allowances = 0
  } = salary;
  
  return parseFloat(basic_salary) +
         parseFloat(hra) +
         parseFloat(da) +
         parseFloat(ta) +
         parseFloat(medical_allowance) +
         parseFloat(other_allowances);
};

/**
 * Calculate total deductions
 * @param {Object} salary - Salary components
 * @returns {Number} Total deductions
 */
const calculateTotalDeductions = (salary) => {
  const {
    pf = 0,
    esi = 0,
    professional_tax = 0,
    tds = 0,
    other_deductions = 0
  } = salary;
  
  return parseFloat(pf) +
         parseFloat(esi) +
         parseFloat(professional_tax) +
         parseFloat(tds) +
         parseFloat(other_deductions);
};

/**
 * Calculate net salary
 * @param {Object} salary - Salary components
 * @returns {Number} Net salary
 */
const calculateNetSalary = (salary) => {
  const gross = calculateGrossSalary(salary);
  const deductions = calculateTotalDeductions(salary);
  return gross - deductions;
};

/**
 * Calculate pro-rated salary based on working days
 * @param {Number} netSalary - Full month net salary
 * @param {Number} workingDays - Total working days in month
 * @param {Number} presentDays - Days present
 * @returns {Number} Pro-rated salary
 */
const calculateProRatedSalary = (netSalary, workingDays, presentDays) => {
  if (workingDays === 0) return netSalary;
  const perDaySalary = netSalary / workingDays;
  return perDaySalary * presentDays;
};

/**
 * Generate salary slip number
 * @param {Number} teacherId - Teacher ID
 * @param {Number} month - Payment month
 * @param {Number} year - Payment year
 * @returns {String} Slip number
 */
const generateSlipNumber = (teacherId, month, year) => {
  const paddedMonth = month.toString().padStart(2, '0');
  const paddedId = teacherId.toString().padStart(4, '0');
  return `SLP-${year}${paddedMonth}-${paddedId}`;
};

/**
 * Get month name from number
 * @param {Number} month - Month number (1-12)
 * @returns {String} Month name
 */
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
};

/**
 * Get current month and year
 * @returns {Object} {month, year}
 */
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
};

/**
 * Check if salary for month is already paid
 * @param {Array} payments - Existing payments
 * @param {Number} month - Month
 * @param {Number} year - Year
 * @returns {Boolean} Is paid
 */
const isSalaryPaid = (payments, month, year) => {
  return payments.some(p => 
    p.payment_month === month && 
    p.payment_year === year && 
    p.payment_status === 'paid'
  );
};

/**
 * Generate salary breakdown for slip
 * @param {Object} salary - Salary configuration
 * @param {Object} payment - Payment details
 * @returns {Object} Detailed breakdown
 */
const generateSalaryBreakdown = (salary, payment = {}) => {
  const gross = calculateGrossSalary(salary);
  const deductions = calculateTotalDeductions(salary);
  const net = calculateNetSalary(salary);
  
  return {
    earnings: {
      basic_salary: parseFloat(salary.basic_salary || 0),
      hra: parseFloat(salary.hra || 0),
      da: parseFloat(salary.da || 0),
      ta: parseFloat(salary.ta || 0),
      medical_allowance: parseFloat(salary.medical_allowance || 0),
      other_allowances: parseFloat(salary.other_allowances || 0),
      bonus: parseFloat(payment.bonus || 0),
      total: gross + parseFloat(payment.bonus || 0)
    },
    deductions: {
      pf: parseFloat(salary.pf || 0),
      esi: parseFloat(salary.esi || 0),
      professional_tax: parseFloat(salary.professional_tax || 0),
      tds: parseFloat(salary.tds || 0),
      other_deductions: parseFloat(salary.other_deductions || 0),
      penalty: parseFloat(payment.penalty || 0),
      total: deductions + parseFloat(payment.penalty || 0)
    },
    attendance: {
      working_days: payment.working_days || 0,
      present_days: payment.present_days || 0,
      leave_days: payment.leave_days || 0
    },
    net_salary: net + parseFloat(payment.bonus || 0) - parseFloat(payment.penalty || 0)
  };
};

/**
 * Calculate pending months for a teacher
 * @param {Array} payments - Existing payments
 * @param {Date} joinDate - Teacher join date
 * @returns {Array} Pending months [{month, year}]
 */
const getPendingMonths = (payments, joinDate) => {
  const pending = [];
  const currentDate = new Date();
  const startDate = new Date(joinDate);
  
  // Start from join month
  let checkDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  while (checkDate <= currentDate) {
    const month = checkDate.getMonth() + 1;
    const year = checkDate.getFullYear();
    
    // Check if payment exists for this month
    const paymentExists = payments.some(p => 
      p.payment_month === month && 
      p.payment_year === year
    );
    
    if (!paymentExists) {
      pending.push({ month, year, monthName: getMonthName(month) });
    }
    
    // Move to next month
    checkDate.setMonth(checkDate.getMonth() + 1);
  }
  
  return pending;
};

module.exports = {
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
};

