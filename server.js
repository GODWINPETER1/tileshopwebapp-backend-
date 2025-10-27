const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', require('./routes/product'));
app.use('/api/variants', require('./routes/variants'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Tiles Store API is running!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// 404 handler - FIXED: Remove the asterisk parameter
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});