const jwt = require('jsonwebtoken');
const menuConfig = require('../config/menuConfig');

module.exports = (req, res, next) => {
    // Check for session-based auth (for browser/EJS)
    if (req.session && req.session.user) {
        req.user = req.session.user;
        res.locals.user = req.session.user; // Fix typo: req.local -> res.locals

        // Set menu based on role
        const role = req.session.user.role || 'staff'; // Default to staff if role missing
        res.locals.menu = menuConfig[role] || [];

        // Prevent caching of protected pages
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        return next();
    }

    // Check for token-based auth (for API)
    const authHeader = req.header('Authorization');
    if (authHeader) {
        try {
            const token = authHeader.replace('Bearer ', '');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            // Token is invalid, but we don't want to break if it was just a failed header check
            // and maybe they were expecting session auth.
            // However, if header IS present, we usually expect it to be valid.
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }

    // If neither, handle based on request type
    if (req.accepts('html')) {
        return res.redirect('/');
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
