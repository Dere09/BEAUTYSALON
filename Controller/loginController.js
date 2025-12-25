const loginuser = require('../models/loginuser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Institution = require('../models/institutionModel');
exports.CreateForms = async (req, res) => {
    try {
        const users = await loginuser.find().sort({ createdAt: -1 });
        const institutions = await Institution.find().sort({ createdAt: -1 });
        res.render('createUser', { users, error: '', institutions });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('createUser', { users: [], error: 'Error fetching users' });
    }
};

exports.CreateUser = async (req, res) => {
    const { username, fullName, phone, password, role, salon_id } = req.body;
    try {
        if (!salon_id) {
            const users = await loginuser.find().sort({ createdAt: -1 });
            const institutions = await Institution.find().sort({ createdAt: -1 });
            return res.status(400).render('createUser', { users, error: 'Institution is required', institutions });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new loginuser({
            username,
            fullName,
            phone,
            password: hashedPassword,
            role: role || 'staff', // Default to 'staff' if role is not provided
            salonId: salon_id
        });
        await newUser.save();
        // Fetch all users after saving the new one
        const users = await loginuser.find().sort({ createdAt: -1 });
        const institutions = await Institution.find().sort({ createdAt: -1 });
        return res.render('createUser', { users, error: '', institutions });
    } catch (error) {
        console.error('Error creating user:', error);
        const users = await loginuser.find().sort({ createdAt: -1 });
        const institutions = await Institution.find().sort({ createdAt: -1 });
        return res.status(500).render('createUser', { users, error: 'Error creating user', institutions });
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await loginuser.find().sort({ createdAt: -1 });
        res.locals.users = users; // Store in res.locals for reuse
        next();
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPaginatedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6; // Items per page
        const skip = (page - 1) * limit;

        const totalUsers = await loginuser.countDocuments();
        const users = await loginuser.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalPages = Math.ceil(totalUsers / limit);

        res.render('userslist', {
            users, // Overwrite/Prioritize paginated users
            currentPage: page,
            totalPages,
            totalUsers
        });
    } catch (error) {
        console.error('Error fetching paginated users:', error);
        res.render('userslist', { users: [], error: 'Error loading users', currentPage: 1, totalPages: 1 });
    }
};

// Factory function to render different views
exports.renderPage = (viewName, extraData = {}) => {
    return (req, res) => {
        const data = {
            ...res.locals, // Includes users from getAllUsers
            ...extraData  // Additional page-specific data
        };
        res.render(viewName, data);
    };
};
// Show the reset password form
exports.showResetPasswordForm = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await loginuser.findOne({ username });
        if (!user) {
            req.flash('error', 'User not found');
        }
        res.render('reset-password', { user });
    }
    catch (error) {
        console.error('Error showing reset password form:', error);
        // Fetch users so the view has data
        const users = await loginuser.find().sort({ createdAt: -1 });
        res.render('createUser', { users, error: 'Error showing reset password form' });
    }
};
// Handle the reset password form submission
exports.resetPassword = async (req, res) => {
    const { username } = req.params;
    const { newPassword, confirmPassword } = req.body;

    try {
        if (!newPassword || !confirmPassword) {
            req.flash('error', 'All fields are required');
            return res.redirect(`/reset-password/${username}`);
        }

        if (newPassword !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect(`/reset-password/${username}`);
        }

        if (newPassword.length < 6) {
            req.flash('error', 'Password must be at least 6 characters long');
            return res.redirect(`/reset-password/${username}`);
        }

        // Find the user by username
        const user = await loginuser.findOne({ username });
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/userslist');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        req.flash('success', 'Password reset successfully');
        res.redirect('/userslist');

    } catch (error) {
        console.error('Error resetting password:', error);
        req.flash('error', 'Error resetting password');
        res.redirect('/userslist');
    }
};
