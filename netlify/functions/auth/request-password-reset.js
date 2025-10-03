const { query } = require('../db');
const { generateResetToken } = require('../utils/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Handle password reset request
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    // Validate input
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Find user by email
    const userResult = await query('SELECT id, name FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    // If user exists, generate and save reset token
    if (user) {
      const { token, expires } = generateResetToken();
      
      await query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
        [token, expires, user.id]
      );

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      
      await transporter.sendMail({
        from: `"Kira Queen" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Redefinição de Senha',
        html: `
          <p>Olá ${user.name},</p>
          <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
          <p><a href="${resetUrl}">Redefinir Senha</a></p>
          <p>Se você não solicitou esta redefinição, ignore este e-mail.</p>
          <p>O link expirará em 1 hora.</p>
        `,
      });
    }

    // Always return success to prevent email enumeration
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'If an account with that email exists, you will receive a password reset link' 
      }),
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
