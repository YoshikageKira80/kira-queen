const { query } = require('../db');
const { hashPassword, generateToken } = require('../utils/auth');

// Handle user registration
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, password, name } = JSON.parse(event.body);

    // Validate input
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email, password, and name are required' }),
      };
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email already in use' }),
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, name, hashedPassword]
    );

    const user = result.rows[0];
    const { token, tokenId } = generateToken(user.id);

    // Store the token ID in the database for session management
    await query(
      'INSERT INTO user_sessions (user_id, token_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [user.id, tokenId]
    );

    return {
      statusCode: 201,
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
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
