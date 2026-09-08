const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'subscription_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
});

// Test connection on module load
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`Connected to MySQL database: ${process.env.DB_NAME || 'subscription_management'}`);
    connection.release();
  } catch (error) {
    console.error('MySQL Connection Error:', error.message);
  }
})();

module.exports = pool;
