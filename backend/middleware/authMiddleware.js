const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token missing. Please log in to continue.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_subscription_mgmt_jwt_key_2026_xYz';
    const decoded = jwt.verify(token, secret);

    // Verify user still exists in database
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user no longer exists.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please log in again.',
      error: error.name === 'TokenExpiredError' ? 'TokenExpired' : 'InvalidToken'
    });
  }
};

module.exports = authenticateToken;
