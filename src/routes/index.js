const express = require('express');
const router = express.Router();

// Import route modules
const exampleRoutes = require('./example.routes');

// Register routes
router.use('/example', exampleRoutes);

// Root API route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

module.exports = router;