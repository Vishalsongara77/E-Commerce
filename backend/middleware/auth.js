const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log(`[${new Date().toISOString()}] Auth failed: No token provided for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    console.log(`[${new Date().toISOString()}] Auth success: User ${decoded.id} accessed ${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    console.log(`[${new Date().toISOString()}] Auth failed: Invalid token for ${req.method} ${req.originalUrl} - ${error.message}`);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { auth };
