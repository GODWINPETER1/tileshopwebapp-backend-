// models/productVariant.js
const db = require('../config/db');

class ProductVariant {
  static create(variantData, callback) {
    const q = `INSERT INTO product_variants 
      (product_id, series, code, size, pcs_per_ctn, m2_per_ctn, kg_per_ctn, image_url, stock, tile_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const vals = [
      variantData.product_id,
      variantData.series || null,
      variantData.code || null,
      variantData.size || null,
      variantData.pcs_per_ctn || 0,
      variantData.m2_per_ctn || 0,
      variantData.kg_per_ctn || 0,
      variantData.imageUrl || null,
      variantData.stock || 0,
      variantData.tile_type || 'non-slide'
    ];
    db.query(q, vals, callback);
  }


// Updated method with optional tileType filter
static getByProductId(productId, tileType = null, callback) {
  let q = `SELECT 
              pv.id, 
              pv.product_id as productId,
              pv.series,
              pv.code,
              pv.size, 
              pv.pcs_per_ctn as pcsPerCtn,
              pv.m2_per_ctn as m2PerCtn,
              pv.kg_per_ctn as kgPerCtn,
              pv.image_url as image, 
              pv.stock,
              pv.tile_type as tileType
           FROM product_variants pv
           WHERE pv.product_id = ? AND pv.is_deleted = FALSE`;

  const params = [productId];

  if (tileType && (tileType === 'slide' || tileType === 'non-slide')) {
    q += ' AND pv.tile_type = ?';
    params.push(tileType);
  }

  q += ' ORDER BY pv.updated_at DESC';

  db.query(q, params, callback);
}


  static getById(id, callback) {
    const q = `SELECT 
                pv.id, 
                pv.product_id as productId,
                pv.series,
                pv.code,
                pv.size, 
                pv.pcs_per_ctn as pcsPerCtn,
                pv.m2_per_ctn as m2PerCtn,
                pv.kg_per_ctn as kgPerCtn,
                pv.image_url as image, 
                pv.stock,
                pv.tile_type as tileType
               FROM product_variants pv
               WHERE pv.id = ? AND pv.is_deleted = FALSE`;
    db.query(q, [id], callback);
  }

  static update(id, data, callback) {
    const q = `UPDATE product_variants 
               SET series=?, code=?, size=?, pcs_per_ctn=?, m2_per_ctn=?, kg_per_ctn=?, image_url=?, stock=?, tile_type=?
               WHERE id = ?`;
    const vals = [
      data.series,
      data.code,
      data.size,
      data.pcs_per_ctn,
      data.m2_per_ctn,
      data.kg_per_ctn,
      data.imageUrl,
      data.stock,
      data.tile_type || 'non-slide',
      id
    ];
    db.query(q, vals, callback);
  }

  // Remove getByTileType method since we're using the enhanced getByProductId

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