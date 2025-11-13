// controllers/variantController.js
const ProductVariant = require('../models/productVariant');
const { safeUnlink } = require('../utils/fileHelpers');

exports.createVariant = (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;
    const variantData = {
      product_id: req.body.product_id,
      series: req.body.series,
      code: req.body.code,
      size: req.body.size,
      pcs_per_ctn: parseInt(req.body.pcs_per_ctn) || 0,
      m2_per_ctn: parseFloat(req.body.m2_per_ctn) || 0,
      kg_per_ctn: parseFloat(req.body.kg_per_ctn) || 0,
      imageUrl,
      stock: parseInt(req.body.stock) || 0,
      tile_type: req.body.tile_type || 'non-slide'
    };

    ProductVariant.create(variantData, (error, results) => {
      if (error) {
        console.error('DB error:', error);
        if (req.file) safeUnlink(req.file.path);
        return res.status(500).json({ success: false, message: 'Database error', error: error.message });
      }
      res.status(201).json({ success: true, message: 'Variant created', data: { id: results.insertId, ...variantData } });
    });
  } catch (err) {
    console.error('createVariant error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getVariantsByProduct = (req, res) => {
  const productId = req.params.productId;
  const tileType = req.query.tileType; // Get tile type from query parameter
  
  ProductVariant.getByProductId(productId, tileType, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    res.json({ success: true, data: results });
  });
};

exports.getVariantById = (req, res) => {
  const id = req.params.id;
  ProductVariant.getById(id, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    if (!result || result.length === 0) return res.status(404).json({ success: false, message: 'Variant not found' });
    res.json({ success: true, data: result[0] });
  });
};

exports.updateVariant = (req, res) => {
  const id = req.params.id;
  const variantData = {
    series: req.body.series,
    code: req.body.code,
    size: req.body.size,
    pcs_per_ctn: parseInt(req.body.pcs_per_ctn) || 0,
    m2_per_ctn: parseFloat(req.body.m2_per_ctn) || 0,
    kg_per_ctn: parseFloat(req.body.kg_per_ctn) || 0,
    imageUrl: req.file ? req.file.path : req.body.imageUrl,
    stock: parseInt(req.body.stock) || 0,
    tile_type: req.body.tile_type || 'non-slide'
  };

  ProductVariant.update(id, variantData, (err, results) => {
    if (err) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(500).json({ success: false, message: 'DB error', error: err.message });
    }
    res.json({ success: true, message: 'Variant updated' });
  });
};

exports.deleteVariant = (req, res) => {
  const id = req.params.id;
  ProductVariant.softDelete(id, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err.message });
    res.json({ success: true, message: 'Variant deleted' });
  });
};