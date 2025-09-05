const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

    // Attach decoded user info to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = auth;
