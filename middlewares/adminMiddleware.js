const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied. Administrator privileges required.',
    });
  }
};

module.exports = authorizeAdmin;
