/**
 * Authentication Middleware
 * 
 * This is a simple placeholder middleware for authentication.
 * In a real application, you would implement JWT verification or another auth mechanism.
 */

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // In a real implementation, you would verify the token here
    // Example with JWT:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded.user;

    // For now, just attach a mock user to the request
    req.user = { id: 1, name: 'Test User', role: 'admin' };
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;