// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Middleware to restrict access based on roles
const permitIndex = (allowedRoles) => {
    return (req, res, next) => {
        if (req.session.user && allowedRoles.includes(req.session.user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        }
    };
};

module.exports = { isAuthenticated, permitIndex };
