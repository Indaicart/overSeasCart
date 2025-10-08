const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// Public endpoint - Register a new school with subscription
router.post(
  '/register',
  [
    // School validation
    body('school.name').notEmpty().withMessage('School name is required'),
    body('school.email').isEmail().withMessage('Valid school email is required'),
    body('school.phone').notEmpty().withMessage('School phone is required'),
    body('school.address').notEmpty().withMessage('School address is required'),
    body('school.estimated_students').isInt({ min: 1 }).withMessage('Valid student count required'),
    body('school.estimated_teachers').isInt({ min: 1 }).withMessage('Valid teacher count required'),
    
    // Admin validation
    body('admin.first_name').notEmpty().withMessage('Admin first name is required'),
    body('admin.last_name').notEmpty().withMessage('Admin last name is required'),
    body('admin.email').isEmail().withMessage('Valid admin email is required'),
    body('admin.password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    // Subscription validation
    body('subscription.plan_name').notEmpty().withMessage('Subscription plan is required'),
    body('subscription.billing_cycle').isIn(['monthly', 'annual']).withMessage('Valid billing cycle required'),
    
    // Payment validation
    body('payment.card_number').notEmpty().withMessage('Card number is required'),
    body('payment.card_name').notEmpty().withMessage('Cardholder name is required'),
    body('payment.expiry_date').notEmpty().withMessage('Expiry date is required'),
    body('payment.cvv').notEmpty().withMessage('CVV is required')
  ],
  async (req, res) => {
    const trx = await db.transaction();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { school, admin, subscription, payment } = req.body;

      // 1. Check if school email already exists
      const existingSchool = await trx('schools').where({ email: school.email }).first();
      if (existingSchool) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: 'A school with this email already exists'
        });
      }

      // 2. Check if admin email already exists
      const existingAdmin = await trx('users').where({ email: admin.email }).first();
      if (existingAdmin) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }

      // 3. Get the subscription plan
      const plan = await trx('subscription_plans')
        .where({ name: subscription.plan_name })
        .first();

      if (!plan) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      // 4. Process payment (Mock payment - in production, integrate with Stripe/PayPal)
      const paymentResult = await processPayment(payment, plan, subscription.billing_cycle);
      
      if (!paymentResult.success) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: 'Payment failed: ' + paymentResult.error
        });
      }

      // 5. Create the school
      const [newSchool] = await trx('schools')
        .insert({
          name: school.name,
          email: school.email,
          phone: school.phone,
          address: school.address,
          status: 'active',
          settings: JSON.stringify({
            estimated_students: school.estimated_students,
            estimated_teachers: school.estimated_teachers
          })
        })
        .returning('*');

      // 6. Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      if (subscription.billing_cycle === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // 7. Create the subscription
      const amount = subscription.billing_cycle === 'annual' 
        ? plan.annual_price 
        : plan.monthly_price;

      const [newSubscription] = await trx('subscriptions')
        .insert({
          school_id: newSchool.id,
          plan_id: plan.id,
          status: 'active',
          start_date: startDate,
          end_date: endDate,
          billing_cycle: subscription.billing_cycle,
          amount: amount,
          auto_renew: true
        })
        .returning('*');

      // 8. Record the payment
      await trx('payments').insert({
        school_id: newSchool.id,
        subscription_id: newSubscription.id,
        amount: amount,
        payment_method: 'credit_card',
        payment_status: 'completed',
        transaction_id: paymentResult.transactionId,
        payment_details: JSON.stringify({
          card_last4: payment.card_number.slice(-4),
          card_name: payment.card_name
        })
      });

      // 9. Hash admin password
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // 10. Create admin user
      const [newAdmin] = await trx('users')
        .insert({
          school_id: newSchool.id,
          email: admin.email,
          password_hash: hashedPassword,
          first_name: admin.first_name,
          last_name: admin.last_name,
          role: 'admin',
          is_active: true
        })
        .returning(['id', 'email', 'first_name', 'last_name', 'role']);

      // 11. Send welcome email (mock - implement actual email sending)
      await sendWelcomeEmail(admin.email, {
        schoolName: school.name,
        adminName: `${admin.first_name} ${admin.last_name}`,
        planName: plan.name,
        loginUrl: process.env.CLIENT_URL || 'http://localhost:3000/login'
      });

      // Commit transaction
      await trx.commit();

      res.status(201).json({
        success: true,
        message: 'School registered successfully',
        data: {
          school: {
            id: newSchool.id,
            name: newSchool.name,
            email: newSchool.email
          },
          admin: newAdmin,
          subscription: {
            plan: plan.name,
            billing_cycle: subscription.billing_cycle,
            amount: amount,
            start_date: startDate,
            end_date: endDate
          }
        }
      });

    } catch (error) {
      await trx.rollback();
      console.error('Error registering school:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register school. Please try again.'
      });
    }
  }
);

// Mock payment processing function
async function processPayment(paymentData, plan, billingCycle) {
  // In production, integrate with actual payment gateway (Stripe, PayPal, Square, etc.)
  
  // Basic validation
  const cardNumber = paymentData.card_number.replace(/\s/g, '');
  
  if (cardNumber.length < 16) {
    return {
      success: false,
      error: 'Invalid card number'
    };
  }

  if (paymentData.cvv.length < 3) {
    return {
      success: false,
      error: 'Invalid CVV'
    };
  }

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock: Decline cards ending in 0000
  if (cardNumber.endsWith('0000')) {
    return {
      success: false,
      error: 'Card declined by issuer'
    };
  }

  // Mock success
  return {
    success: true,
    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: billingCycle === 'annual' ? plan.annual_price : plan.monthly_price,
    currency: 'USD'
  };
}

// Mock welcome email function
async function sendWelcomeEmail(email, data) {
  // In production, integrate with email service (SendGrid, AWS SES, Mailgun, etc.)
  
  console.log('='.repeat(60));
  console.log('WELCOME EMAIL');
  console.log('='.repeat(60));
  console.log(`To: ${email}`);
  console.log(`Subject: Welcome to SchoolMS - Your Account is Ready!`);
  console.log('');
  console.log(`Dear ${data.adminName},`);
  console.log('');
  console.log(`Welcome to SchoolMS! Your school "${data.schoolName}" has been successfully registered.`);
  console.log('');
  console.log(`Subscription Details:`);
  console.log(`- Plan: ${data.planName}`);
  console.log(`- Status: Active`);
  console.log('');
  console.log(`You can now login to your admin dashboard at:`);
  console.log(data.loginUrl);
  console.log('');
  console.log(`Next Steps:`);
  console.log(`1. Login to your admin dashboard`);
  console.log(`2. Complete your school profile`);
  console.log(`3. Add internal admins if needed`);
  console.log(`4. Start adding teachers and students`);
  console.log(`5. Configure your school settings`);
  console.log('');
  console.log(`If you have any questions, please contact our support team.`);
  console.log('');
  console.log(`Best regards,`);
  console.log(`The SchoolMS Team`);
  console.log('='.repeat(60));
  
  return true;
}

// Check email availability (public endpoint)
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const schoolExists = await db('schools').where({ email }).first();
    const userExists = await db('users').where({ email }).first();
    
    res.json({
      success: true,
      available: !schoolExists && !userExists
    });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email availability'
    });
  }
});

module.exports = router;
