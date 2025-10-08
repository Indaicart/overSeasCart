const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db/connection');

/**
 * POST /api/password-reset/request
 * Request a password reset
 */
router.post('/request', async (req, res) => {
  try {
    const { email, schoolCode } = req.body;

    if (!email || !schoolCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and school code are required'
      });
    }

    // Find school by code
    const school = await db('schools')
      .where('school_code', schoolCode)
      .first();

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Find user by email and school
    const user = await db('users')
      .where('email', email)
      .where('school_id', school.id)
      .first();

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent'
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = crypto.createHash('sha256').update(resetCode).digest('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Invalidate any existing unused tokens
    await db('password_resets')
      .where('user_id', user.id)
      .where('used', false)
      .update({ used: true });

    // Create new reset token
    await db('password_resets').insert({
      user_id: user.id,
      token: hashedToken,
      expires_at: expiresAt,
      used: false
    });

    // TODO: In production, send this code via email
    // For now, we'll return it in the response (development only)
    console.log(`Password reset code for ${email}: ${resetCode}`);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset code has been sent',
      // Remove this in production - only for development
      resetCode: process.env.NODE_ENV === 'development' ? resetCode : undefined
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

/**
 * POST /api/password-reset/verify
 * Verify reset code
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, schoolCode, code } = req.body;

    if (!email || !schoolCode || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email, school code, and reset code are required'
      });
    }

    // Find school
    const school = await db('schools')
      .where('school_code', schoolCode)
      .first();

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Invalid reset code'
      });
    }

    // Find user
    const user = await db('users')
      .where('email', email)
      .where('school_id', school.id)
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid reset code'
      });
    }

    // Hash the provided code
    const hashedToken = crypto.createHash('sha256').update(code).digest('hex');

    // Find valid reset token
    const resetToken = await db('password_resets')
      .where('user_id', user.id)
      .where('token', hashedToken)
      .where('used', false)
      .where('expires_at', '>', new Date())
      .first();

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    res.json({
      success: true,
      message: 'Code verified successfully',
      data: {
        userId: user.id,
        verificationToken: hashedToken
      }
    });
  } catch (error) {
    console.error('Password reset verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify reset code'
    });
  }
});

/**
 * POST /api/password-reset/reset
 * Reset password with verified code
 */
router.post('/reset', async (req, res) => {
  try {
    const { email, schoolCode, code, newPassword } = req.body;

    if (!email || !schoolCode || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find school
    const school = await db('schools')
      .where('school_code', schoolCode)
      .first();

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Invalid request'
      });
    }

    // Find user
    const user = await db('users')
      .where('email', email)
      .where('school_id', school.id)
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid request'
      });
    }

    // Hash the provided code
    const hashedToken = crypto.createHash('sha256').update(code).digest('hex');

    // Find valid reset token
    const resetToken = await db('password_resets')
      .where('user_id', user.id)
      .where('token', hashedToken)
      .where('used', false)
      .where('expires_at', '>', new Date())
      .first();

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db('users')
      .where('id', user.id)
      .update({
        password: hashedPassword,
        updated_at: new Date()
      });

    // Mark token as used
    await db('password_resets')
      .where('id', resetToken.id)
      .update({ used: true });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

/**
 * DELETE /api/password-reset/cleanup
 * Delete expired and used tokens (admin only - called via cron)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const deleted = await db('password_resets')
      .where('expires_at', '<', new Date())
      .orWhere('used', true)
      .delete();

    res.json({
      success: true,
      message: `Cleaned up ${deleted} password reset tokens`,
      data: { deleted }
    });
  } catch (error) {
    console.error('Password reset cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup password reset tokens'
    });
  }
});

module.exports = router;
