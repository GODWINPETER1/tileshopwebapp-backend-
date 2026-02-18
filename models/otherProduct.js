const db = require('../config/db');

class OtherProduct {
  static getAll(callback) {
    const q = `
      SELECT id, name, brand, description,
             image_url as image, price, stock, category
      FROM other_products
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `;
    db.query(q, callback);
  }

  static getById(id, callback) {
    const q = `
      SELECT id, name, brand, description,
             image_url as image, price, stock, category
      FROM other_products
      WHERE id = ? AND is_deleted = FALSE
    `;
    db.query(q, [id], callback);
  }

  static create(data, callback) {
    const q = `
      INSERT INTO other_products
      (name, brand, description, image_url, price, stock, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const vals = [
      data.name,
      data.brand || null,
      data.description || null,
      data.image || null,   // ✅ FIXED
      data.price || 0,
      data.stock || 0,
      data.category || null
    ];

    db.query(q, vals, callback);
  }

  static update(id, data, callback) {
    const q = `
      UPDATE other_products
      SET name=?, brand=?, description=?, image_url=?,
          price=?, stock=?, category=?
      WHERE id=?
    `;

    const vals = [
      data.name,
      data.brand,
      data.description,
      data.image,  // ✅ FIXED
      data.price,
      data.stock,
      data.category,
      id
    ];

    db.query(q, vals, callback);
  }

  static softDelete(id, callback) {
    const q = `UPDATE other_products SET is_deleted = TRUE WHERE id=?`;
    db.query(q, [id], callback);
  }
}

module.exports = OtherProduct;
