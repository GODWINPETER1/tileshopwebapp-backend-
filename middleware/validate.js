const validateProduct = (req, res, next) => {
  const { name, brand, code } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ 
      success: false, 
      message: 'Product name is required' 
    });
  }
  
  if (!brand || brand.trim() === '') {
    return res.status(400).json({ 
      success: false, 
      message: 'Brand is required' 
    });
  }
  
  if (!code || code.trim() === '') {
    return res.status(400).json({ 
      success: false, 
      message: 'Product code is required' 
    });
  }
  
  next();
};

const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid product ID is required' 
    });
  }
  
  next();
};

module.exports = { validateProduct, validateObjectId };