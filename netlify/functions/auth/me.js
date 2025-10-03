const { getCurrentUser } = require('../middleware/auth');

// Get current user information
exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { user } = await getCurrentUser(event);

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Not authenticated' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user }),
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
