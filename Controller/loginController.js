const loginuser = require('../models/loginuser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// exports.CreateForms= (req, res) =>{
//     res.render('createUser');
// }
// Controller function for GET /createUser
exports.CreateForms = async (req, res) => {
    try {
        const users = await loginuser.find().sort({ createdAt: -1 });
        res.render('createUser', { users, error: '' });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('createUser', { users: [], error: 'Error fetching users' });
    }
};
exports.CreateUser = async (req, res)  =>{
    const {username,fullName,phone,password,role}=req.body;
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new loginuser({
            username,
            fullName,
            phone,
            password: hashedPassword,
            role: role || 'staff' // Default to 'staff' if role is not provided
            });
            await newUser.save();
                    // Fetch all users after saving the new one
        const users = await loginuser.find().sort({ createdAt: -1 });
        //    res.render('userslist', {users: newUser});
          res.render('createUser', { users: [], error: 'Error fetching users' });
 
    }
    catch(error){
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
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
exports.showResetPasswordForm =async(req, res) =>{
    try{
        const username = req.params.username;
        const user = await loginuser.findOne({ username });
        if(!user){
        req.flash('error', 'User not found');
        }
      res.render('reset-password',  { user, error: '', success: '' });
    }
    catch(error){
        console.error('Error showing reset password form:', error);
    // Fetch users so the view has data
    const users = await loginuser.find().sort({ createdAt: -1 });
    res.render('createUser', { users, error: 'Error showing reset password form' });
    }
};
// Handle the reset password form submission
exports.resetPassword = async (req, res) => {
    try {
        const {userid, newPassword } = req.body.username;
        //validate the user ID
        if(!userid || !newPassword){
            req.flash('error', 'User ID and new password are required');
         //   return res.redirect('/userlist');
        }
        if(newPassword.length < 6){
            req.flash('error', 'Password must be at least 6 characters long');
           //c return res.redirect('/userlist');
        }
        // Find the user by ID
        const user = await loginuser.findById(userid);
        if(!user){
            req.flash('error', 'User not found');
            return res.redirect('/userlist');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        req.flash('success', 'Password reset successfully');
        res.redirect('/userlist');

    }
    catch (error){
        req.flash('error', 'Error resetting password');
        res.redirect('/userlist', { error: 'Error resetting password' });
    }
};
