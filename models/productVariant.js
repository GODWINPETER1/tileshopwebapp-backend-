const db = require('../config/db');

class ProductVariant {
  static create(variantData, callback) {
    const q = `INSERT INTO product_variants 
      (product_id, size, pcs_per_ctn, m2_per_ctn, kg_per_ctn, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const vals = [
      variantData.product_id,
      variantData.size || null,
      variantData.pcs_per_ctn || 0,
      variantData.m2_per_ctn || 0,
      variantData.kg_per_ctn || 0,
      variantData.imageUrl || null,
      variantData.stock || 0
    ];
    db.query(q, vals, callback);
  }

  static getByProductId(productId, callback) {
    const q = `SELECT 
                pv.id, 
                pv.product_id as productId,
                p.brand,
                p.series,
                p.code,
                pv.size, 
                pv.pcs_per_ctn as pcsPerCtn,
                pv.m2_per_ctn as m2PerCtn,
                pv.kg_per_ctn as kgPerCtn,
                pv.image_url as image, 
                pv.stock
               FROM product_variants pv
               JOIN products p ON pv.product_id = p.id
               WHERE pv.product_id = ? AND pv.is_deleted = FALSE 
               ORDER BY pv.created_at`;
    db.query(q, [productId], callback);
  }

  static getById(id, callback) {
    const q = `SELECT 
                pv.id, 
                pv.product_id as productId,
                p.brand,
                p.series,
                p.code,
                pv.size, 
                pv.pcs_per_ctn as pcsPerCtn,
                pv.m2_per_ctn as m2PerCtn,
                pv.kg_per_ctn as kgPerCtn,
                pv.image_url as image, 
                pv.stock
               FROM product_variants pv
               JOIN products p ON pv.product_id = p.id
               WHERE pv.id = ? AND pv.is_deleted = FALSE`;
    db.query(q, [id], callback);
  }

  static update(id, data, callback) {
    const q = `UPDATE product_variants 
               SET size=?, pcs_per_ctn=?, m2_per_ctn=?, kg_per_ctn=?, image_url=?, stock=? 
               WHERE id = ?`;
    const vals = [
      data.size,
      data.pcs_per_ctn,
      data.m2_per_ctn,
      data.kg_per_ctn,
      data.imageUrl,
      data.stock,
      id
    ];
    db.query(q, vals, callback);
  }

  static softDelete(id, callback) {
    const q = `UPDATE product_variants SET is_deleted = TRUE WHERE id = ?`;
    db.query(q, [id], callback);
  }

  static hardDelete(id, callback) {
    const q = `DELETE FROM product_variants WHERE id = ?`;
    db.query(q, [id], callback);
  }
}

module.exports = ProductVariant;