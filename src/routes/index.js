const express = require('express');
const router = express.Router();

const exampleRoutes = require('./example.routes');
const productRoutes = require('./product.routes');

router.use('/example', exampleRoutes);

router.use('/', productRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'hello',
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