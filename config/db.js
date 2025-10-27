const mysql = require('mysql2');
require('dotenv').config();


const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tiles_store'
});

connection.connect((err) => {

    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }

    console.log('Connected to database as id ' + connection.threadId);
})

module.exports = connection;