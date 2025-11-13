const db = require('../config/db');

class Product {
  static getAll(callback) {
    const query = `
      SELECT id, name, main_image_url as image, description, brand, category
      FROM products WHERE isDeleted = FALSE ORDER BY created_at DESC
    `;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const productQuery = `
      SELECT id, name, main_image_url as image, description, brand, category
      FROM products WHERE id = ? AND isDeleted = FALSE
    `;

    db.query(productQuery, [id], (err, productRows) => {
      if (err) return callback(err);
      if (!productRows || productRows.length === 0) return callback(null, null);

      const product = productRows[0];

      // Updated variant query - now includes series and code
      const variantQuery = `
        SELECT 
          pv.id, 
          pv.product_id as productId,
          pv.series,
          pv.code,
          pv.size, 
          pv.pcs_per_ctn as pcsPerCtn,
          pv.m2_per_ctn as m2PerCtn,
          pv.kg_per_ctn as kgPerCtn,
          pv.imageUrl as image, 
          pv.stock
        FROM product_variants pv 
        WHERE pv.product_id = ? AND pv.isDeleted = FALSE
      `;
      
      db.query(variantQuery, [id], (vErr, variants) => {
        if (vErr) return callback(vErr);
        
        product.variants = variants || [];
        callback(null, product);
      });
    });
  }

  static create(productData, callback) {
    const q = `INSERT INTO products (name, brand, main_image_url, description, category) VALUES (?, ?, ?, ?, ?)`;
    const vals = [
      productData.name,
      productData.brand,
      productData.main_image_url,
      productData.description,
      productData.category || 'tiles'
    ];
    db.query(q, vals, callback);
  }

  static getByCategory(category, callback) {
    const query = `
      SELECT id, name, main_image_url as image, description, brand, category
      FROM products 
      WHERE isDeleted = FALSE AND category = ? 
      ORDER BY created_at DESC
    `;
    db.query(query, [category], callback);
  }

  static update(id, productData, callback) {
    const q = `UPDATE products SET name=?, brand=?, main_image_url=?, description=? WHERE id=?`;
    const vals = [
      productData.name,
      productData.brand,
      productData.main_image_url,
      productData.description,
      id
    ];
    db.query(q, vals, callback);
  }

  static softDelete(id, callback) {
    const q = `UPDATE products SET isDeleted = TRUE WHERE id = ?`;
    db.query(q, [id], callback);
  }

  static hardDelete(id, callback) {
    const q = `DELETE FROM products WHERE id = ?`;
    db.query(q, [id], callback);
  }
}

module.exports = Product;