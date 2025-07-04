// backend/middleware/roleMiddleware.js
module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user; // set by authMiddleware
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient privileges' });
    }
    next();
  };
};
