const db = require('../config/db');

class Cart {

  // =====================================================
  // GET ACTIVE CART
  // =====================================================

  static getActiveCart(sessionId, callback) {
    const query = `
      SELECT
        id,
        session_id,
        status,
        created_at,
        updated_at
      FROM carts
      WHERE session_id = ?
        AND status = 'active'
      LIMIT 1
    `;

    db.query(query, [sessionId], callback);
  }


  // =====================================================
  // CREATE CART
  // =====================================================

  static create(sessionId, callback) {
    const query = `
      INSERT INTO carts (
        session_id,
        status
      )
      VALUES (?, 'active')
    `;

    db.query(query, [sessionId], callback);
  }


  // =====================================================
  // GET CART BY ID
  // =====================================================

  static getById(cartId, callback) {
    const query = `
      SELECT
        id,
        session_id,
        status,
        created_at,
        updated_at
      FROM carts
      WHERE id = ?
      LIMIT 1
    `;

    db.query(query, [cartId], callback);
  }


  // =====================================================
  // GET ITEM BY VARIANT
  // =====================================================

  static getItem(cartId, variantId, callback) {
    const query = `
      SELECT
        id,
        cart_id,
        product_id,
        variant_id,
        quantity
      FROM cart_items
      WHERE cart_id = ?
        AND variant_id = ?
      LIMIT 1
    `;

    db.query(
      query,
      [cartId, variantId],
      callback
    );
  }


  // =====================================================
  // ADD ITEM
  // =====================================================

  static addItem(
    cartId,
    productId,
    variantId,
    quantity,
    callback
  ) {
    const query = `
      INSERT INTO cart_items (
        cart_id,
        product_id,
        variant_id,
        quantity
      )
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        cartId,
        productId,
        variantId,
        quantity
      ],
      callback
    );
  }


  // =====================================================
  // GET ITEM BY ID
  // =====================================================

  static getItemById(
    itemId,
    cartId,
    callback
  ) {
    const query = `
      SELECT
        ci.id,
        ci.cart_id AS cartId,
        ci.product_id AS productId,
        ci.variant_id AS variantId,
        ci.quantity,
        pv.stock

      FROM cart_items ci

      INNER JOIN product_variants pv
        ON pv.id = ci.variant_id

      WHERE ci.id = ?
        AND ci.cart_id = ?

      LIMIT 1
    `;

    db.query(
      query,
      [itemId, cartId],
      callback
    );
  }


  // =====================================================
  // UPDATE ITEM QUANTITY
  // =====================================================

  static updateItemQuantity(
    itemId,
    cartId,
    quantity,
    callback
  ) {
    const query = `
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ?
        AND cart_id = ?
    `;

    db.query(
      query,
      [
        quantity,
        itemId,
        cartId
      ],
      callback
    );
  }


  // =====================================================
  // DELETE ITEM
  // =====================================================

  static deleteItem(
    itemId,
    cartId,
    callback
  ) {
    const query = `
      DELETE FROM cart_items
      WHERE id = ?
        AND cart_id = ?
    `;

    db.query(
      query,
      [
        itemId,
        cartId
      ],
      callback
    );
  }


  // =====================================================
  // CLEAR CART
  // =====================================================

  static clearItems(
    cartId,
    callback
  ) {
    const query = `
      DELETE FROM cart_items
      WHERE cart_id = ?
    `;

    db.query(
      query,
      [cartId],
      callback
    );
  }


  // =====================================================
  // GET CART ITEMS
  // =====================================================

  static getItems(
    cartId,
    callback
  ) {
    const query = `
      SELECT
        ci.id,
        ci.cart_id AS cartId,
        ci.product_id AS productId,
        ci.variant_id AS variantId,
        ci.quantity,

        p.name AS productName,
        p.brand,
        p.main_image_url AS productImage,

        pv.series,
        pv.code,
        pv.size,
        pv.pcs_per_ctn AS pcsPerCtn,
        pv.m2_per_ctn AS m2PerCtn,
        pv.kg_per_ctn AS kgPerCtn,
        pv.stock,
        pv.tile_type AS tileType

      FROM cart_items ci

      INNER JOIN products p
        ON p.id = ci.product_id

      INNER JOIN product_variants pv
        ON pv.id = ci.variant_id

      WHERE ci.cart_id = ?

      ORDER BY ci.created_at DESC
    `;

    db.query(
      query,
      [cartId],
      callback
    );
  }

}

module.exports = Cart;