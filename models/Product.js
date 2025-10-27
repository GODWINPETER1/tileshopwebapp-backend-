const db = require('../config/db');

class Product {
  static getAll(callback) {
    const query = `
      SELECT id, name, code, main_image_url as image, description, brand, series, category
      FROM products WHERE is_deleted = FALSE ORDER BY created_at DESC
    `;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const productQuery = `
      SELECT id, name, code, main_image_url as image, description, brand, series
      FROM products WHERE id = ? AND is_deleted = FALSE
    `;

    db.query(productQuery, [id], (err, productRows) => {
      if (err) return callback(err);
      if (!productRows || productRows.length === 0) return callback(null, null); // not found

      const product = productRows[0];

      // Updated variant query - removed color and price
      const variantQuery = `
        SELECT 
          pv.id, 
          pv.product_id as productId,
          pv.size, 
          pv.image_url as image, 
          pv.stock
        FROM product_variants pv 
        WHERE pv.product_id = ? AND pv.is_deleted = FALSE
      `;
      
      db.query(variantQuery, [id], (vErr, variants) => {
        if (vErr) return callback(vErr);
        
        // Add temporary default values for new fields
        const variantsWithDefaults = (variants || []).map(variant => ({
          ...variant,
          pcsPerCtn: 0,
          m2PerCtn: 0,
          kgPerCtn: 0
        }));
        
        product.variants = variantsWithDefaults;
        callback(null, product);
      });
    });
  }

  static create(productData, callback) {
    const q = `INSERT INTO products (name, brand, series, code, main_image_url, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const vals = [
      productData.name,
      productData.brand,
      productData.series,
      productData.code,
      productData.mainImageUrl,
      productData.description,
      productData.category || 'tiles'
    ];
    db.query(q, vals, callback);
  }

 static getByCategory(category, callback) {
  const query = `
    SELECT id, name, code, main_image_url as image, description, brand, series, category
    FROM products 
    WHERE is_deleted = FALSE AND category = ? 
    ORDER BY created_at DESC
  `;
  db.query(query, [category], callback);
}

  static update(id, productData, callback) {
    const q = `UPDATE products SET name=?, brand=?, series=?, code=?, main_image_url=?, description=? WHERE id=?`;
    const vals = [
      productData.name,
      productData.brand,
      productData.series,
      productData.code,
      productData.mainImageUrl,
      productData.description,
      id
    ];
    db.query(q, vals, callback);
  }

  static softDelete(id, callback) {
    const q = `UPDATE products SET is_deleted = TRUE WHERE id = ?`;
    db.query(q, [id], callback);
  }

  static hardDelete(id, callback) {
    const q = `DELETE FROM products WHERE id = ?`;
    db.query(q, [id], callback);
  }
}

module.exports = Product;