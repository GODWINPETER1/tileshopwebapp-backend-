const Product = require('../models/Product');
const ProductVariant = require('../models/productVariant');
const { safeUnlink } = require('../utils/fileHelpers');

exports.getAllProducts = (req, res) => {
  Product.getAll((error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
    res.json({ success: true, data: results });
  });
};

exports.getProductById = (req, res) => {
  const productId = req.params.id;

  Product.getById(productId, (error, product) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  });
};

exports.getProductsByCategory = (req, res) => {
  const category = req.params.category;
  
  Product.getByCategory(category, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
    res.json({ success: true, data: results });
  });
};

exports.createProduct = (req, res) => {
  try {
    const mainImageUrl = req.file ? req.file.path : null; // Cloudinary gives you a full URL
    console.log('Uploaded file:', req.file );
    console.log('cloudinary URL:' , mainImageUrl)

    const productData = {
      name: req.body.name,
      brand: req.body.brand,
      mainImageUrl,
      description: req.body.description,
      category: req.body.category 
    };

    Product.create(productData, (error, results) => {
      if (error) {
        console.error('Database error:', error);
        if (req.file) safeUnlink(req.file.path);
        return res.status(500).json({ success: false, message: 'Database error', error: error.message });
      }

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { id: results.insertId, ...productData }
      });
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateProduct = (req, res) => {
  const productId = req.params.id;
  const productData = {
    name: req.body.name,
    brand: req.body.brand,
    mainImageUrl: req.file ? req.file.path : req.body.mainImageUrl,
    description: req.body.description
  };

  Product.update(productId, productData, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      if (req.file) safeUnlink(req.file.path);
      return res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
    if (results.affectedRows === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated successfully' });
  });
};

exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  Product.softDelete(productId, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
    if (results.affectedRows === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  });
};