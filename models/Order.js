const db = require('../config/db');

class Order {

  // =====================================================
  // CREATE ORDER FROM CART
  // =====================================================

  static createFromCart(
    cartId,
    sessionId,
    customerData,
    callback
  ) {

    const connection = db;

    // -----------------------------------------------------
    // 1. Get cart items + current product/variant data
    // -----------------------------------------------------

    const itemsQuery = `
      SELECT
        ci.id AS cartItemId,
        ci.product_id AS productId,
        ci.variant_id AS variantId,
        ci.quantity,

        p.name AS productName,
        p.brand,

        pv.series,
        pv.code,
        pv.size,
        pv.pcs_per_ctn AS pcsPerCtn,
        pv.m2_per_ctn AS m2PerCtn,
        pv.kg_per_ctn AS kgPerCtn,
        pv.tile_type AS tileType,
        pv.stock

      FROM cart_items ci

      INNER JOIN products p
        ON p.id = ci.product_id

      INNER JOIN product_variants pv
        ON pv.id = ci.variant_id

      WHERE ci.cart_id = ?

      ORDER BY ci.created_at ASC
    `;

    connection.query(
      itemsQuery,
      [cartId],
      (itemsError, items) => {

        if (itemsError) {
          return callback(itemsError);
        }

        // -------------------------------------------------
        // 2. Make sure cart isn't empty
        // -------------------------------------------------

        if (!items || items.length === 0) {
          return callback(
            new Error('Cart is empty')
          );
        }

        // -------------------------------------------------
        // 3. Validate stock
        // -------------------------------------------------

        // const unavailableItem = items.find(
        //   (item) =>
        //     item.quantity > item.stock
        // );

        // if (unavailableItem) {

        //   const error = new Error(
        //     `Insufficient stock for ${unavailableItem.productName} (${unavailableItem.size || unavailableItem.code || 'variant'})`
        //   );

        //   error.code = 'INSUFFICIENT_STOCK';

        //   return callback(error);
        // }

        // -------------------------------------------------
        // 4. Generate order number
        // -------------------------------------------------

        const orderNumber =
          Order.generateOrderNumber();

        // -------------------------------------------------
        // 5. Insert order
        // -------------------------------------------------

        const orderQuery = `
          INSERT INTO orders (
            order_number,
            cart_id,
            session_id,
            customer_name,
            phone,
            email,
            delivery_location,
            notes,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const orderValues = [
          orderNumber,
          cartId,
          sessionId,
          customerData.customerName,
          customerData.phone,
          customerData.email || null,
          customerData.deliveryLocation,
          customerData.notes || null
        ];

        connection.query(
          orderQuery,
          orderValues,
          (orderError, orderResult) => {

            if (orderError) {
              return callback(orderError);
            }

            const orderId =
              orderResult.insertId;

            // ---------------------------------------------
            // 6. Insert order items
            // ---------------------------------------------

            const itemValues = items.map(
              (item) => [
                orderId,
                item.productId,
                item.variantId,
                item.productName,
                item.brand || null,
                item.series || null,
                item.code || null,
                item.size || null,
                item.pcsPerCtn || 0,
                item.m2PerCtn || 0,
                item.kgPerCtn || 0,
                item.tileType || null,
                item.quantity
              ]
            );

            const itemQuery = `
              INSERT INTO order_items (
                order_id,
                product_id,
                variant_id,
                product_name,
                brand,
                series,
                code,
                size,
                pcs_per_ctn,
                m2_per_ctn,
                kg_per_ctn,
                tile_type,
                quantity
              )
              VALUES ?
            `;

            connection.query(
              itemQuery,
              [itemValues],
              (itemsInsertError) => {

                if (itemsInsertError) {
                  return callback(
                    itemsInsertError
                  );
                }

                // -----------------------------------------
                // 7. Mark cart as submitted
                // -----------------------------------------

                const updateCartQuery = `
                  UPDATE carts
                  SET status = 'submitted'
                  WHERE id = ?
                    AND session_id = ?
                    AND status = 'active'
                `;

                connection.query(
                  updateCartQuery,
                  [
                    cartId,
                    sessionId
                  ],
                  (cartError) => {

                    if (cartError) {
                      return callback(
                        cartError
                      );
                    }

                    // -------------------------------------
                    // 8. Return created order
                    // -------------------------------------

                    callback(null, {
                      id: orderId,
                      orderNumber,
                      cartId,
                      sessionId,
                      customer: customerData,
                      items
                    });

                  }
                );
              }
            );
          }
        );
      }
    );
  }


  // =====================================================
  // GET ORDER BY NUMBER
  // =====================================================

  static getByOrderNumber(
    orderNumber,
    callback
  ) {

    const orderQuery = `
      SELECT
        id,
        order_number AS orderNumber,
        cart_id AS cartId,
        session_id AS sessionId,
        customer_name AS customerName,
        phone,
        email,
        delivery_location AS deliveryLocation,
        notes,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM orders
      WHERE order_number = ?
      LIMIT 1
    `;

    db.query(
      orderQuery,
      [orderNumber],
      (error, orders) => {

        if (error) {
          return callback(error);
        }

        if (!orders || orders.length === 0) {
          return callback(null, null);
        }

        const order = orders[0];

        const itemsQuery = `
          SELECT
            id,
            product_id AS productId,
            variant_id AS variantId,
            product_name AS productName,
            brand,
            series,
            code,
            size,
            pcs_per_ctn AS pcsPerCtn,
            m2_per_ctn AS m2PerCtn,
            kg_per_ctn AS kgPerCtn,
            tile_type AS tileType,
            quantity
          FROM order_items
          WHERE order_id = ?
          ORDER BY id ASC
        `;

        db.query(
          itemsQuery,
          [order.id],
          (itemsError, items) => {

            if (itemsError) {
              return callback(itemsError);
            }

            order.items = items || [];

            callback(null, order);
          }
        );
      }
    );
  }


  // =====================================================
  // GENERATE ORDER NUMBER
  // =====================================================

  static generateOrderNumber() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      now.getDate()
    ).padStart(2, '0');

    const random = Math.floor(
      1000 + Math.random() * 9000
    );

    return `BRG-${year}${month}${day}-${random}`;
  }

    // =====================================================
  // GET ALL ORDERS
  // =====================================================

  static getAll(callback) {

    const query = `
      SELECT
        id,
        order_number AS orderNumber,
        cart_id AS cartId,
        session_id AS sessionId,

        customer_name AS customerName,
        phone,
        email,
        delivery_location AS deliveryLocation,
        notes,

        status,

        created_at AS createdAt,
        updated_at AS updatedAt

      FROM orders

      ORDER BY created_at DESC
    `;

    db.query(
      query,
      (error, orders) => {

        if (error) {
          return callback(error);
        }

        callback(null, orders || []);
      }
    );
  }


  // =====================================================
  // GET ORDER BY ID WITH ITEMS
  // =====================================================

  static getById(id, callback) {

    const orderQuery = `
      SELECT
        id,
        order_number AS orderNumber,
        cart_id AS cartId,
        session_id AS sessionId,

        customer_name AS customerName,
        phone,
        email,
        delivery_location AS deliveryLocation,
        notes,

        status,

        created_at AS createdAt,
        updated_at AS updatedAt

      FROM orders

      WHERE id = ?

      LIMIT 1
    `;

    db.query(
      orderQuery,
      [id],
      (error, orders) => {

        if (error) {
          return callback(error);
        }

        if (
          !orders ||
          orders.length === 0
        ) {
          return callback(null, null);
        }

        const order = orders[0];


        const itemsQuery = `
          SELECT
            id,
            product_id AS productId,
            variant_id AS variantId,

            product_name AS productName,
            brand,
            series,
            code,
            size,

            pcs_per_ctn AS pcsPerCtn,
            m2_per_ctn AS m2PerCtn,
            kg_per_ctn AS kgPerCtn,

            tile_type AS tileType,

            quantity

          FROM order_items

          WHERE order_id = ?

          ORDER BY id ASC
        `;

        db.query(
          itemsQuery,
          [order.id],
          (itemsError, items) => {

            if (itemsError) {
              return callback(itemsError);
            }

            order.items = items || [];

            callback(null, order);
          }
        );
      }
    );
  }


  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  static updateStatus(
    id,
    status,
    callback
  ) {

    const query = `
      UPDATE orders

      SET status = ?

      WHERE id = ?
    `;

    db.query(
      query,
      [
        status,
        id
      ],
      callback
    );
  }

  // =====================================================
// UPDATE ORDER STATUS
// =====================================================

static updateStatus(
  orderId,
  status,
  callback
) {

  const query = `
    UPDATE orders
    SET
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.query(
    query,
    [
      status,
      orderId
    ],
    callback
  );

}

}

module.exports = Order;