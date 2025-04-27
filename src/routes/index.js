const express = require('express');
const router = express.Router();

// Import route modules
const exampleRoutes = require('./example.routes');
const productRoutes = require('./product.routes');

// Register routes
router.use('/example', exampleRoutes);

// Register product routes - these are the main API endpoints for the application
router.use('/', productRoutes);

// Root API route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      topProducts: '/api/topProducts',
      addProduct: '/api/addProduct',
      getProductsByBrand: '/api/getProducts/:brand',
      getProductData: '/api/getData/:barcodeString'
    }
  });
});

module.exports = router;