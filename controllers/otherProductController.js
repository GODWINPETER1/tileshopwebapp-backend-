const OtherProduct = require('../models/otherProduct');
const { safeUnlink } = require('../utils/fileHelpers');

// GET ALL
exports.getAll = (req, res) => {
  OtherProduct.getAll((err, rows) => {
    if (err)
      return res.status(500).json({ success: false, error: err.message });

    res.json({ success: true, data: rows });
  });
};

// GET BY ID
exports.getById = (req, res) => {
  const id = req.params.id;

  OtherProduct.getById(id, (err, rows) => {
    if (err)
      return res.status(500).json({ success: false, error: err.message });

    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: rows[0] });
  });
};

// CREATE (same logic as ProductController)
exports.create = (req, res) => {
  try {
    const image = req.file ? req.file.path : null;

    const data = {
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      image
    };

    OtherProduct.create(data, (err, result) => {
      if (err) {
        if (req.file) safeUnlink(req.file.path);
        return res.status(500).json({ success: false, error: err.message });
      }

      res.status(201).json({
        success: true,
        message: 'Product created',
        id: result.insertId
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE (same pattern as ProductController)
exports.update = (req, res) => {
  const id = req.params.id;

  const data = {
    name: req.body.name,
    brand: req.body.brand,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    category: req.body.category,
    image: req.file ? req.file.path : req.body.image
  };

  OtherProduct.update(id, data, (err) => {
    if (err) {
      if (req.file) safeUnlink(req.file.path);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, message: 'Product updated' });
  });
};

// DELETE
exports.remove = (req, res) => {
  const id = req.params.id;

  OtherProduct.softDelete(id, (err) => {
    if (err)
      return res.status(500).json({ success: false, error: err.message });

    res.json({ success: true, message: 'Product deleted' });
  });
};
