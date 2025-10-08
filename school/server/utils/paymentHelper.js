const crypto = require('crypto');
const razorpay = require('../config/razorpay');

/**
 * Generate Razorpay order
 * @param {Object} options - Order options (amount, currency, receipt)
 * @returns {Promise<Object>} Razorpay order
 */
const createRazorpayOrder = async (options) => {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount * 100, // Amount in paise (100 paise = 1 INR)
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes || {}
    });
    
    return {
      success: true,
      order
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} data - Payment verification data
 * @returns {Boolean} Is signature valid
 */
const verifyPaymentSignature = (data) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  
  const secret = process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXXXXXXXXX';
  
  // Create signature
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');
  
  return generated_signature === razorpay_signature;
};

/**
 * Fetch payment details from Razorpay
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('Fetch payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Number} amount - Refund amount in INR (optional, full refund if not provided)
 * @returns {Promise<Object>} Refund details
 */
const processRefund = async (paymentId, amount = null) => {
  try {
    const refundData = amount ? { amount: amount * 100 } : {}; // Amount in paise
    const refund = await razorpay.payments.refund(paymentId, refundData);
    
    return {
      success: true,
      refund
    };
  } catch (error) {
    console.error('Refund error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate receipt number
 * @param {String} type - Payment type
 * @returns {String} Receipt number
 */
const generateReceiptNumber = (type) => {
  const prefix = type.toUpperCase().substring(0, 3);
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Calculate payment breakdown
 * @param {Number} amount - Base amount
 * @param {Number} taxPercent - Tax percentage (default 18% GST)
 * @returns {Object} Payment breakdown
 */
const calculatePaymentBreakdown = (amount, taxPercent = 18) => {
  const baseAmount = parseFloat(amount);
  const taxAmount = (baseAmount * taxPercent) / 100;
  const totalAmount = baseAmount + taxAmount;
  
  return {
    baseAmount: parseFloat(baseAmount.toFixed(2)),
    taxPercent,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchPaymentDetails,
  processRefund,
  generateReceiptNumber,
  calculatePaymentBreakdown
};

