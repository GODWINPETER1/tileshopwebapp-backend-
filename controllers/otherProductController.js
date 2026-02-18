const OtherProduct = require('../models/otherProduct');

exports.getAll = (req, res) => {
  OtherProduct.getAll((err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
};

exports.getById = (req, res) => {
  const id = req.params.id;

  OtherProduct.getById(id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: rows[0] });
  });
};

exports.create = (req, res) => {
  const data = {
    ...req.body,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null
  };

  OtherProduct.create(data, (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    res.status(201).json({
      success: true,
      message: 'Product created',
      id: result.insertId
    });
  });
};


exports.update = (req, res) => {
  const id = req.params.id;

  OtherProduct.update(id, req.body, (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    res.json({ success: true, message: 'Product updated' });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;

  OtherProduct.softDelete(id, (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    res.json({ success: true, message: 'Product deleted' });
  });
};
