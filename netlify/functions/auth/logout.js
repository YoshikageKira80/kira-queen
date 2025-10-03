const { query } = require('../db');
const { verifyToken } = require('../utils/auth');

// Handle user logout
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

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
    if (!valid || !payload || !payload.tokenId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    // Invalidate the token by removing it from the database
    await query('DELETE FROM user_sessions WHERE token_id = $1', [payload.tokenId]);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully logged out' }),
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
