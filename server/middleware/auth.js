const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user and tenant info to request object
    req.user = user;
    req.tenantId = user.tenantId;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Middleware to check if user belongs to the tenant
exports.checkTenantAccess = (req, res, next) => {
  const requestedTenantId = req.params.tenantId || req.body.tenantId;
  
  if (!requestedTenantId || req.user.tenantId.toString() !== requestedTenantId.toString()) {
    return res.status(403).json({ message: 'Access denied. Not authorized for this tenant.' });
  }
  
  next();
};