const express = require('express');

const router = express.Router();

const orderController =
  require('../controllers/orderController');


// =====================================================
// CUSTOMER
// =====================================================

// Create order from active guest cart
router.post(
  '/',
  orderController.createOrder
);


// Get order by order number
router.get(
  '/number/:orderNumber',
  orderController.getOrder
);

router.put(
  '/admin/:id/status',
  orderController.updateOrderStatus
);


// =====================================================
// ADMIN
// =====================================================

// Get all orders
router.get(
  '/admin/all',
  orderController.getAllOrders
);


// Get one order
router.get(
  '/admin/:id',
  orderController.getOrderById
);


// Update order status
router.put(
  '/admin/:id/status',
  orderController.updateOrderStatus
);


module.exports = router;