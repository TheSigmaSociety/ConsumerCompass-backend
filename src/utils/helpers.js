/**
 * Common utility functions for the application
 */

/**
 * Generates a sanitized response object
 * @param {boolean} success - Operation success status
 * @param {*} data - Response data payload
 * @param {string} message - Response message
 * @param {number} statusCode - HTTP status code
 * @returns {object} Formatted response object
 */
exports.createResponse = (success, data = null, message = '', statusCode = 200) => {
  return {
    success,
    data,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };
};

/**
 * Async/await error handler for route handlers
 * @param {Function} fn - Async function to handle route
 * @returns {Function} Express middleware function
 */
exports.asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Creates a custom error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Custom error object
 */
exports.createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};