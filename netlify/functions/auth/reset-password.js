const { query } = require('../db');
const { hashPassword } = require('../utils/auth');

// Handle password reset
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { token, email, newPassword } = JSON.parse(event.body);

    // Validate input
    if (!token || !email || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token, email, and new password are required' }),
      };
    }

    // Find user with valid reset token
    const result = await query(
      'SELECT id FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
      [email, token]
    );

    const user = result.rows[0];

    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid or expired reset token. Please request a new password reset.' 
        }),
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Password has been reset successfully' }),
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
