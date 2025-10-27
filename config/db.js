const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tiles_store',
  waitForConnections: true,
  connectionLimit: 10,  // max simultaneous connections
  queueLimit: 0,        // unlimited queue
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database with thread id ' + connection.threadId);
  connection.release(); // release back to pool
});

module.exports = pool;
