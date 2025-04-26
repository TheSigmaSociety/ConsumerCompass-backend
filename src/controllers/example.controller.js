/**
 * Example controller with mock implementation
 */

// Mock data
const examples = [
  { id: 1, name: 'Example 1', description: 'This is example 1' },
  { id: 2, name: 'Example 2', description: 'This is example 2' }
];

/**
 * Get all examples
 */
exports.getAll = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: examples
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get example by ID
 */
exports.getById = (req, res) => {
  try {
    const example = examples.find(ex => ex.id === parseInt(req.params.id));
    
    if (!example) {
      return res.status(404).json({
        success: false,
        error: 'Example not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: example
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Create new example
 */
exports.create = (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and description'
      });
    }
    
    // Mock ID generation - in a real app you'd use a database
    const newId = examples.length > 0 ? Math.max(...examples.map(ex => ex.id)) + 1 : 1;
    
    const newExample = {
      id: newId,
      name,
      description
    };
    
    examples.push(newExample);
    
    res.status(201).json({
      success: true,
      data: newExample
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Update example
 */
exports.update = (req, res) => {
  try {
    const { name, description } = req.body;
    const id = parseInt(req.params.id);
    
    const exampleIndex = examples.findIndex(ex => ex.id === id);
    
    if (exampleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Example not found'
      });
    }
    
    if (name) examples[exampleIndex].name = name;
    if (description) examples[exampleIndex].description = description;
    
    res.status(200).json({
      success: true,
      data: examples[exampleIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Delete example
 */
exports.delete = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const exampleIndex = examples.findIndex(ex => ex.id === id);
    
    if (exampleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Example not found'
      });
    }
    
    examples.splice(exampleIndex, 1);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};