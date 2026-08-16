const crypto = require('crypto');

const cartSession = (req, res, next) => {
  try {
    let sessionId = req.headers['x-cart-session'];

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    req.cartSessionId = sessionId;

    // Send the ID back to the frontend
    res.setHeader('X-Cart-Session', sessionId);

    next();
  } catch (error) {
    console.error('Cart session error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create cart session'
    });
  }
};

module.exports = cartSession;