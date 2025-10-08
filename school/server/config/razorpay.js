const Razorpay = require('razorpay');

// Initialize Razorpay instance
// TEST MODE CREDENTIALS - Replace with your test keys
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX', // Your Test Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXXXXXXXXX' // Your Test Key Secret
});

module.exports = razorpayInstance;

