// middleware/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Define Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tiles-app', // ✅ change folder name to whatever you like
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

const upload = multer({ storage });

module.exports = upload;
