const loginuser = require('../models/loginuser');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await loginuser.findOne({ username });

        if (!user) {
            return res.status(401).render('login', { error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).render('login', { error: 'Invalid username or password' });
        }

        // Login successful
        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            salonId: user.salonId
        };

        // Save session before redirect to ensure cookie is set
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('login', { error: 'Login session failed. Please try again.' });
            }
            res.redirect('/dashboard');
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', { error: 'An error occurred during login' });
    }
};

exports.logout = (req, res) => {
    if (!req.session) {
        return res.redirect('/');
    }

    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
        }

        // Ensure the browser cookie is removed (default express-session cookie name)
        res.clearCookie('connect.sid');
        return res.redirect('/');
    });
};
