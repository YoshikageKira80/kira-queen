const { query } = require('../db');
const { comparePasswords, generateToken } = require('../utils/auth');

// Handle user login
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    // Find user by email
    const result = await query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    // Check if user exists and password is correct
    if (!user || !(await comparePasswords(password, user.password_hash))) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid email or password' }),
      };
    }

    // Generate JWT token
    const { token, tokenId } = generateToken(user.id);

    // Store the token ID in the database for session management
    await query(
      'INSERT INTO user_sessions (user_id, token_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [user.id, tokenId]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
