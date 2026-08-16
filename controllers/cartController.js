const Cart = require('../models/cart');
const db = require('../config/db');


// =====================================================
// GET CART
// =====================================================

exports.getCart = (req, res) => {

  const sessionId = req.cartSessionId;

  Cart.getActiveCart(
    sessionId,
    (error, results) => {

      if (error) {
        console.error(
          'Get cart error:',
          error
        );

        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: error.message
        });
      }

      // Cart already exists
      if (results.length > 0) {

        const cart = results[0];

        return Cart.getItems(
          cart.id,
          (itemsError, items) => {

            if (itemsError) {
              console.error(
                'Get cart items error:',
                itemsError
              );

              return res.status(500).json({
                success: false,
                message: 'Failed to get cart items',
                error: itemsError.message
              });
            }

            return res.json({
              success: true,
              data: {
                cart,
                items
              }
            });
          }
        );
      }

      // Create cart if it doesn't exist
      Cart.create(
        sessionId,
        (createError, createResult) => {

          if (createError) {
            console.error(
              'Create cart error:',
              createError
            );

            return res.status(500).json({
              success: false,
              message: 'Failed to create cart',
              error: createError.message
            });
          }

          return res.status(201).json({
            success: true,
            data: {
              cart: {
                id: createResult.insertId,
                session_id: sessionId,
                status: 'active'
              },
              items: []
            }
          });
        }
      );
    }
  );
};


// =====================================================
// ADD ITEM TO CART
// =====================================================

exports.addToCart = (req, res) => {

  const sessionId = req.cartSessionId;

  const {
    productId,
    variantId,
    quantity
  } = req.body;

  // Validate product ID
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  // Validate variant ID
  if (!variantId) {
    return res.status(400).json({
      success: false,
      message: 'Variant ID is required'
    });
  }

  // Validate quantity
  const requestedQuantity =
    parseInt(quantity, 10) || 1;

  if (requestedQuantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1'
    });
  }


  // ---------------------------------------------------
  // Get / create guest cart
  // ---------------------------------------------------

  Cart.getActiveCart(
    sessionId,
    (cartError, carts) => {

      if (cartError) {
        console.error(
          'Get cart error:',
          cartError
        );

        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: cartError.message
        });
      }


      const continueWithCart = (cart) => {

        // ------------------------------------------------
        // Validate product + variant
        // ------------------------------------------------

        const query = `
              SELECT
                pv.id AS variantId,
                pv.product_id AS productId,
                pv.stock,
                p.name AS productName,
                p.brand

              FROM product_variants pv

              INNER JOIN products p
                ON p.id = pv.product_id

              WHERE pv.id = ?
                AND pv.product_id = ?
              LIMIT 1
            `;

        db.query(
          query,
          [variantId, productId],
          (variantError, variants) => {

            if (variantError) {
              console.error(
                'Variant validation error:',
                variantError
              );

              return res.status(500).json({
                success: false,
                message: 'Database error',
                error: variantError.message
              });
            }


            // Variant doesn't belong to product
            if (
              !variants ||
              variants.length === 0
            ) {
              return res.status(404).json({
                success: false,
                message:
                  'Product variant not found'
              });
            }


            const variant = variants[0];

            // No stock
            if (variant.stock <= 0) {
              return res.status(400).json({
                success: false,
                message:
                  'This product is out of stock'
              });
            }


            // Requested quantity exceeds stock
            if (
              requestedQuantity >
              variant.stock
            ) {
              return res.status(400).json({
                success: false,
                message:
                  `Only ${variant.stock} item(s) available in stock`
              });
            }


            // ------------------------------------------------
            // Check if item already exists
            // ------------------------------------------------

            Cart.getItem(
              cart.id,
              variantId,
              (itemError, items) => {

                if (itemError) {
                  console.error(
                    'Get cart item error:',
                    itemError
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      'Database error',
                    error:
                      itemError.message
                  });
                }


                // Existing item
                if (items.length > 0) {

                  const existingItem =
                    items[0];

                  const newQuantity =
                    existingItem.quantity +
                    requestedQuantity;


                  // Check combined quantity
                  if (
                    newQuantity >
                    variant.stock
                  ) {
                    return res.status(400).json({
                      success: false,
                      message:
                        `You can only add up to ${variant.stock} item(s) of this variant`
                    });
                  }


                  return Cart.updateItemQuantity(
                    existingItem.id,
                    cart.id,
                    newQuantity,
                    (updateError) => {

                      if (updateError) {
                        console.error(
                          'Update cart item error:',
                          updateError
                        );

                        return res.status(500).json({
                          success: false,
                          message:
                            'Failed to update cart item',
                          error:
                            updateError.message
                        });
                      }


                      return Cart.getItems(
                        cart.id,
                        (itemsError, updatedItems) => {

                          if (itemsError) {
                            return res.status(500).json({
                              success: false,
                              message:
                                'Failed to get updated cart',
                              error:
                                itemsError.message
                            });
                          }

                          return res.json({
                            success: true,
                            message:
                              'Cart updated successfully',
                            data: {
                              cart,
                              items:
                                updatedItems
                            }
                          });
                        }
                      );
                    }
                  );
                }


                // ------------------------------------------------
                // New item
                // ------------------------------------------------

                Cart.addItem(
                  cart.id,
                  productId,
                  variantId,
                  requestedQuantity,
                  (addError) => {

                    if (addError) {
                      console.error(
                        'Add cart item error:',
                        addError
                      );

                      return res.status(500).json({
                        success: false,
                        message:
                          'Failed to add item to cart',
                        error:
                          addError.message
                      });
                    }


                    Cart.getItems(
                      cart.id,
                      (itemsError, updatedItems) => {

                        if (itemsError) {
                          return res.status(500).json({
                            success: false,
                            message:
                              'Failed to get updated cart',
                            error:
                              itemsError.message
                          });
                        }

                        return res.status(201).json({
                          success: true,
                          message:
                            'Item added to cart successfully',
                          data: {
                            cart,
                            items:
                              updatedItems
                          }
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      };


      // Existing cart
      if (carts.length > 0) {
        return continueWithCart(carts[0]);
      }


      // Create cart
      Cart.create(
        sessionId,
        (createError, createResult) => {

          if (createError) {
            console.error(
              'Create cart error:',
              createError
            );

            return res.status(500).json({
              success: false,
              message:
                'Failed to create cart',
              error:
                createError.message
            });
          }

          const newCart = {
            id: createResult.insertId,
            session_id: sessionId,
            status: 'active'
          };

          continueWithCart(newCart);
        }
      );
    }
  );
};

exports.updateCartItem = (req, res) => {
  const sessionId = req.cartSessionId;
  const itemId = Number(req.params.itemId);
  const requestedQuantity = parseInt(
    req.body.quantity,
    10
  );

  if (!itemId) {
    return res.status(400).json({
      success: false,
      message: 'Cart item ID is required'
    });
  }

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1
  ) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1'
    });
  }

  Cart.getActiveCart(
    sessionId,
    (cartError, carts) => {

      if (cartError) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: cartError.message
        });
      }

      if (!carts.length) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      const cart = carts[0];

      Cart.getItemById(
        itemId,
        cart.id,
        (itemError, items) => {

          if (itemError) {
            return res.status(500).json({
              success: false,
              message: 'Database error',
              error: itemError.message
            });
          }

          if (!items.length) {
            return res.status(404).json({
              success: false,
              message: 'Cart item not found'
            });
          }

          const item = items[0];

          if (requestedQuantity > item.stock) {
            return res.status(400).json({
              success: false,
              message:
                `Only ${item.stock} item(s) available in stock`
            });
          }

          Cart.updateItemQuantity(
            itemId,
            cart.id,
            requestedQuantity,
            (updateError, result) => {

              if (updateError) {
                return res.status(500).json({
                  success: false,
                  message: 'Failed to update cart item',
                  error: updateError.message
                });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({
                  success: false,
                  message: 'Cart item not found'
                });
              }

              Cart.getItems(
                cart.id,
                (itemsError, updatedItems) => {

                  if (itemsError) {
                    return res.status(500).json({
                      success: false,
                      message: 'Failed to get updated cart',
                      error: itemsError.message
                    });
                  }

                  return res.json({
                    success: true,
                    message: 'Cart updated successfully',
                    data: {
                      cart,
                      items: updatedItems
                    }
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

exports.removeCartItem = (req, res) => {
  const sessionId = req.cartSessionId;
  const itemId = Number(req.params.itemId);

  if (!itemId) {
    return res.status(400).json({
      success: false,
      message: 'Cart item ID is required'
    });
  }

  Cart.getActiveCart(
    sessionId,
    (cartError, carts) => {

      if (cartError) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: cartError.message
        });
      }

      if (!carts.length) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      const cart = carts[0];

      Cart.deleteItem(
        itemId,
        cart.id,
        (deleteError, result) => {

          if (deleteError) {
            return res.status(500).json({
              success: false,
              message: 'Failed to remove cart item',
              error: deleteError.message
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: 'Cart item not found'
            });
          }

          Cart.getItems(
            cart.id,
            (itemsError, items) => {

              if (itemsError) {
                return res.status(500).json({
                  success: false,
                  message: 'Failed to get updated cart',
                  error: itemsError.message
                });
              }

              return res.json({
                success: true,
                message: 'Item removed from cart',
                data: {
                  cart,
                  items
                }
              });
            }
          );
        }
      );
    }
  );
};

exports.clearCart = (req, res) => {
  const sessionId = req.cartSessionId;

  Cart.getActiveCart(
    sessionId,
    (cartError, carts) => {

      if (cartError) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: cartError.message
        });
      }

      if (!carts.length) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      const cart = carts[0];

      Cart.clearItems(
        cart.id,
        (clearError) => {

          if (clearError) {
            return res.status(500).json({
              success: false,
              message: 'Failed to clear cart',
              error: clearError.message
            });
          }

          return res.json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
              cart,
              items: []
            }
          });
        }
      );
    }
  );
};