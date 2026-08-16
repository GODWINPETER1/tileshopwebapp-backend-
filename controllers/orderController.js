const Cart = require('../models/cart');
const Order = require('../models/Order');


// =====================================================
// CREATE ORDER
// =====================================================

exports.createOrder = (req, res) => {

  try {

    const sessionId =
      req.headers['x-cart-session'];

    // ---------------------------------------------------
    // Validate session
    // ---------------------------------------------------

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Cart session is required'
      });
    }


    // ---------------------------------------------------
    // Get customer information
    // ---------------------------------------------------

    const {
      customerName,
      phone,
      email,
      deliveryLocation,
      notes
    } = req.body;


    // ---------------------------------------------------
    // Validate required fields
    // ---------------------------------------------------

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }


    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }


    if (
      !deliveryLocation ||
      !deliveryLocation.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Delivery location is required'
      });
    }


    // ---------------------------------------------------
    // Get active cart
    // ---------------------------------------------------

    Cart.getActiveCart(
      sessionId,
      (cartError, carts) => {

        if (cartError) {

          console.error(
            'Get active cart error:',
            cartError
          );

          return res.status(500).json({
            success: false,
            message: 'Failed to get cart',
            error: cartError.message
          });
        }


        if (!carts || carts.length === 0) {

          return res.status(404).json({
            success: false,
            message:
              'No active cart found'
          });
        }


        const cart = carts[0];


        // -------------------------------------------------
        // Create order
        // -------------------------------------------------

        const customerData = {
          customerName:
            customerName.trim(),

          phone:
            phone.trim(),

          email:
            email?.trim() || null,

          deliveryLocation:
            deliveryLocation.trim(),

          notes:
            notes?.trim() || null
        };


        Order.createFromCart(
          cart.id,
          sessionId,
          customerData,
          (orderError, order) => {

            if (orderError) {

              console.error(
                'Create order error:',
                orderError
              );


              if (
                orderError.code ===
                'INSUFFICIENT_STOCK'
              ) {

                return res.status(400).json({
                  success: false,
                  message:
                    orderError.message
                });
              }


              if (
                orderError.message ===
                'Cart is empty'
              ) {

                return res.status(400).json({
                  success: false,
                  message:
                    'Your cart is empty'
                });
              }


              return res.status(500).json({
                success: false,
                message:
                  'Failed to create order',
                error:
                  orderError.message
              });
            }


            return res.status(201).json({
              success: true,
              message:
                'Order submitted successfully',
              data: order
            });

          }
        );

      }
    );

  } catch (error) {

    console.error(
      'Create order controller error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });

  }
};


// =====================================================
// GET ORDER
// =====================================================

exports.getOrder = (req, res) => {

  const orderNumber =
    req.params.orderNumber;


  if (!orderNumber) {
    return res.status(400).json({
      success: false,
      message: 'Order number is required'
    });
  }


  Order.getByOrderNumber(
    orderNumber,
    (error, order) => {

      if (error) {

        console.error(
          'Get order error:',
          error
        );

        return res.status(500).json({
          success: false,
          message:
            'Failed to get order',
          error: error.message
        });
      }


      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }


      return res.json({
        success: true,
        data: order
      });

    }
  );
};

// =====================================================
// ADMIN — GET ALL ORDERS
// =====================================================

exports.getAllOrders = (req, res) => {

  Order.getAll(
    (error, orders) => {

      if (error) {

        console.error(
          'Get all orders error:',
          error
        );

        return res.status(500).json({
          success: false,
          message: 'Failed to get orders',
          error: error.message
        });
      }

      return res.json({
        success: true,
        data: orders
      });

    }
  );
};


// =====================================================
// ADMIN — GET ORDER BY ID
// =====================================================

exports.getOrderById = (req, res) => {

  const id = req.params.id;

  if (!id) {

    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    });

  }


  Order.getById(
    id,
    (error, order) => {

      if (error) {

        console.error(
          'Get order by ID error:',
          error
        );

        return res.status(500).json({
          success: false,
          message: 'Failed to get order',
          error: error.message
        });

      }


      if (!order) {

        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });

      }


      return res.json({
        success: true,
        data: order
      });

    }
  );
};


// =====================================================
// ADMIN — UPDATE ORDER STATUS
// =====================================================

exports.updateOrderStatus = (req, res) => {

  const id = req.params.id;

  const { status } = req.body;


  const allowedStatuses = [
    'pending',
    'confirmed',
    'processing',
    'completed',
    'cancelled'
  ];


  if (!status) {

    return res.status(400).json({
      success: false,
      message: 'Order status is required'
    });

  }


  if (!allowedStatuses.includes(status)) {

    return res.status(400).json({
      success: false,
      message: 'Invalid order status',
      allowedStatuses
    });

  }


  Order.updateStatus(
    id,
    status,
    (error, result) => {

      if (error) {

        console.error(
          'Update order status error:',
          error
        );

        return res.status(500).json({
          success: false,
          message: 'Failed to update order status',
          error: error.message
        });

      }


      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });

      }


      return res.json({
        success: true,
        message: 'Order status updated successfully'
      });

    }
  );
};

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

exports.updateOrderStatus = (req, res) => {

  const orderId = req.params.id;
  const { status } = req.body;


  // ---------------------------------------------------
  // Validate order ID
  // ---------------------------------------------------

  if (!orderId) {

    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    });

  }


  // ---------------------------------------------------
  // Validate status
  // ---------------------------------------------------

  const allowedStatuses = [
    'pending',
    'confirmed',
    'processing',
    'completed',
    'cancelled'
  ];


  if (
    !status ||
    !allowedStatuses.includes(status)
  ) {

    return res.status(400).json({
      success: false,
      message: 'Invalid order status'
    });

  }


  // ---------------------------------------------------
  // Update order
  // ---------------------------------------------------

  Order.updateStatus(
    orderId,
    status,
    (error, result) => {

      if (error) {

        console.error(
          'Update order status error:',
          error
        );

        return res.status(500).json({
          success: false,
          message: 'Failed to update order status',
          error: error.message
        });

      }


      if (
        !result ||
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });

      }


      return res.json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          id: Number(orderId),
          status
        }
      });

    }
  );

};