const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchPaymentDetails,
  processRefund,
  generateReceiptNumber,
  calculatePaymentBreakdown
} = require('../utils/paymentHelper');

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, payment_type, description, student_id, fee_id, metadata } = req.body;
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    
    // Validate required fields
    if (!amount || !payment_type) {
      return res.status(400).json({
        success: false,
        message: 'Amount and payment type are required'
      });
    }
    
    // Calculate payment breakdown
    const breakdown = calculatePaymentBreakdown(amount);
    
    // Generate receipt number
    const receiptNumber = generateReceiptNumber(payment_type);
    
    // Create Razorpay order
    const orderResult = await createRazorpayOrder({
      amount: breakdown.totalAmount,
      currency: currency || 'INR',
      receipt: receiptNumber,
      notes: {
        payment_type,
        user_id: userId,
        school_id: schoolId,
        student_id: student_id || '',
        fee_id: fee_id || ''
      }
    });
    
    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: orderResult.error
      });
    }
    
    // Save payment record in database
    const [payment] = await db('payments')
      .insert({
        school_id: schoolId,
        user_id: userId,
        student_id: student_id || null,
        fee_id: fee_id || null,
        payment_type,
        amount: breakdown.totalAmount,
        currency: currency || 'INR',
        status: 'pending',
        razorpay_order_id: orderResult.order.id,
        description,
        metadata: {
          breakdown,
          ...metadata
        },
        receipt_number: receiptNumber
      })
      .returning('*');
    
    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: orderResult.order.id,
        amount: breakdown.totalAmount,
        currency: orderResult.order.currency,
        receipt: receiptNumber,
        breakdown,
        paymentId: payment.id,
        // Razorpay Key ID for frontend
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX'
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment after successful transaction
 * @access  Private
 */
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }
    
    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });
    
    if (!isValid) {
      // Update payment status to failed
      await db('payments')
        .where({ razorpay_order_id })
        .update({
          status: 'failed',
          error_message: 'Invalid payment signature',
          updated_at: db.fn.now()
        });
      
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }
    
    // Fetch payment details from Razorpay
    const paymentDetailsResult = await fetchPaymentDetails(razorpay_payment_id);
    
    if (!paymentDetailsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }
    
    const paymentDetails = paymentDetailsResult.payment;
    
    // Update payment record
    const [updatedPayment] = await db('payments')
      .where({ razorpay_order_id })
      .update({
        status: paymentDetails.status === 'captured' ? 'success' : 'failed',
        razorpay_payment_id,
        razorpay_signature,
        payment_method: paymentDetails.method,
        payment_date: new Date(paymentDetails.created_at * 1000),
        metadata: db.raw('metadata || ?', [JSON.stringify({
          card_id: paymentDetails.card_id,
          bank: paymentDetails.bank,
          wallet: paymentDetails.wallet,
          vpa: paymentDetails.vpa,
          email: paymentDetails.email,
          contact: paymentDetails.contact
        })]),
        updated_at: db.fn.now()
      })
      .returning('*');
    
    // If payment is for a fee, update the fee record
    if (updatedPayment.fee_id && updatedPayment.status === 'success') {
      await db('fees')
        .where({ id: updatedPayment.fee_id })
        .increment('paid_amount', updatedPayment.amount)
        .update({ updated_at: db.fn.now() });
    }
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment: updatedPayment,
        receiptNumber: updatedPayment.receipt_number
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public (but verified)
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookBody = req.body;
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(webhookBody))
        .digest('hex');
      
      if (expectedSignature !== webhookSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }
    
    const event = webhookBody.event;
    const paymentEntity = webhookBody.payload.payment.entity;
    
    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await db('payments')
          .where({ razorpay_payment_id: paymentEntity.id })
          .update({
            status: 'success',
            payment_date: new Date(paymentEntity.created_at * 1000),
            updated_at: db.fn.now()
          });
        break;
      
      case 'payment.failed':
        await db('payments')
          .where({ razorpay_payment_id: paymentEntity.id })
          .update({
            status: 'failed',
            error_message: paymentEntity.error_description,
            error_code: paymentEntity.error_code,
            updated_at: db.fn.now()
          });
        break;
      
      case 'refund.created':
        const refundEntity = webhookBody.payload.refund.entity;
        await db('payments')
          .where({ razorpay_payment_id: refundEntity.payment_id })
          .update({
            status: 'refunded',
            refund_id: refundEntity.id,
            refund_amount: refundEntity.amount / 100,
            refund_date: new Date(refundEntity.created_at * 1000),
            updated_at: db.fn.now()
          });
        break;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history for user
 * @access  Private
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const { limit = 50, offset = 0, status, payment_type } = req.query;
    
    let query = db('payments')
      .where({ school_id: schoolId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    // Filter by user if not admin
    if (req.user.role !== 'admin') {
      query = query.where({ user_id: userId });
    }
    
    // Filter by status if provided
    if (status) {
      query = query.where({ status });
    }
    
    // Filter by payment type if provided
    if (payment_type) {
      query = query.where({ payment_type });
    }
    
    const payments = await query;
    
    // Get total count
    const [{ count }] = await db('payments')
      .where({ school_id: schoolId })
      .count('* as count');
    
    res.json({
      success: true,
      data: payments,
      pagination: {
        total: parseInt(count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
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
 * @route   GET /api/payments/:id
 * @desc    Get single payment details
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    
    let query = db('payments')
      .where({ id: paymentId, school_id: schoolId })
      .first();
    
    // Non-admins can only see their own payments
    if (req.user.role !== 'admin') {
      query = query.where({ user_id: userId });
    }
    
    const payment = await query;
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Process refund for a payment
 * @access  Private (Admin only)
 */
router.post('/:id/refund', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can process refunds'
      });
    }
    
    const paymentId = req.params.id;
    const { amount, reason } = req.body;
    const schoolId = req.user.school_id;
    
    // Get payment record
    const payment = await db('payments')
      .where({ id: paymentId, school_id: schoolId })
      .first();
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    if (payment.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Only successful payments can be refunded'
      });
    }
    
    if (payment.refund_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }
    
    // Process refund with Razorpay
    const refundResult = await processRefund(payment.razorpay_payment_id, amount);
    
    if (!refundResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Refund processing failed',
        error: refundResult.error
      });
    }
    
    // Update payment record
    const [updatedPayment] = await db('payments')
      .where({ id: paymentId })
      .update({
        status: 'refunded',
        refund_id: refundResult.refund.id,
        refund_amount: refundResult.refund.amount / 100,
        refund_date: new Date(),
        refund_reason: reason,
        updated_at: db.fn.now()
      })
      .returning('*');
    
    // If refunding a fee payment, update fee record
    if (updatedPayment.fee_id) {
      await db('fees')
        .where({ id: updatedPayment.fee_id })
        .decrement('paid_amount', updatedPayment.refund_amount)
        .update({ updated_at: db.fn.now() });
    }
    
    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payments/receipt/:id
 * @desc    Get payment receipt
 * @access  Private
 */
router.get('/receipt/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    
    // Get payment with related data
    const payment = await db('payments as p')
      .leftJoin('students as s', 'p.student_id', 's.id')
      .leftJoin('users as u', 'p.user_id', 'u.id')
      .leftJoin('schools as sc', 'p.school_id', 'sc.id')
      .select(
        'p.*',
        's.first_name as student_first_name',
        's.last_name as student_last_name',
        's.roll_number',
        'u.first_name as payer_first_name',
        'u.last_name as payer_last_name',
        'u.email as payer_email',
        'sc.name as school_name',
        'sc.address as school_address'
      )
      .where({ 'p.id': paymentId, 'p.school_id': schoolId })
      .first();
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Non-admins can only see their own receipts
    if (req.user.role !== 'admin' && payment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        receipt: payment,
        school: {
          name: payment.school_name,
          address: payment.school_address
        },
        payer: {
          name: `${payment.payer_first_name} ${payment.payer_last_name}`,
          email: payment.payer_email
        },
        student: payment.student_id ? {
          name: `${payment.student_first_name} ${payment.student_last_name}`,
          roll_number: payment.roll_number
        } : null
      }
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

