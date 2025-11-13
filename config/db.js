const mysql = require('mysql2');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Remove these invalid options:
  // acquireTimeout: 60000,  // ❌ Remove this
  // timeout: 60000,         // ❌ Remove this
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.log('Connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
  } else {
    console.log('✅ Connected to MySQL database');
    connection.release();
  }
});

module.exports = pool;