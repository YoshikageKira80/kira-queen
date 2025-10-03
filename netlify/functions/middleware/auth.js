const { query } = require('../db');
const { verifyToken } = require('../utils/auth');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = (handler) => async (event, context) => {
  try {
    // Get token from Authorization header
    const authHeader = event.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }

    // Verify token
    const { valid, payload } = await verifyToken(token);
    if (!valid || !payload || !payload.userId || !payload.tokenId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      };
    }

    // Check if token is valid (not blacklisted)
    const sessionCheck = await query(
      'SELECT 1 FROM user_sessions WHERE user_id = $1 AND token_id = $2 AND expires_at > NOW()',
      [payload.userId, payload.tokenId]
    );

    if (sessionCheck.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Session expired. Please log in again.' }),
      };
    }

    // Attach user ID to the event object for use in the handler
    event.user = { id: payload.userId };

    // Proceed to the actual handler
    return handler(event, context);
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error during authentication' }),
    };
  }
};

/**
 * Middleware to get current user information
 */
const getCurrentUser = async (event) => {
  try {
    // Get token from Authorization header
    const authHeader = event.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return { user: null };
    }

    // Verify token
    const { valid, payload } = await verifyToken(token);
    if (!valid || !payload || !payload.userId || !payload.tokenId) {
      return { user: null };
    }

    // Check if token is valid (not blacklisted)
    const sessionCheck = await query(
      'SELECT 1 FROM user_sessions WHERE user_id = $1 AND token_id = $2 AND expires_at > NOW()',
      [payload.userId, payload.tokenId]
    );

    if (sessionCheck.rows.length === 0) {
      return { user: null };
    }

    // Get user details
    const userResult = await query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [payload.userId]
    );

    return { user: userResult.rows[0] || null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null };
  }
};

module.exports = {
  authenticate,
  getCurrentUser,
};
