/* authMiddleware.js — Role-based access control */

module.exports = {
  // Ensure user is logged in
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Please login first' });
  },

  // Authorize specific roles
  authorize: (roles = []) => {
    if (typeof roles === 'string') roles = [roles];

    return (req, res, next) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (roles.length && !roles.includes(req.session.user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      next();
    };
  }
};
