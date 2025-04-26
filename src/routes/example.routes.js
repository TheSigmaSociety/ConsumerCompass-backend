const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/example.controller');

// GET all examples
router.get('/', exampleController.getAll);

// GET single example by ID
router.get('/:id', exampleController.getById);

// POST create new example
router.post('/', exampleController.create);

// PUT update example
router.put('/:id', exampleController.update);

// DELETE example
router.delete('/:id', exampleController.delete);

module.exports = router;