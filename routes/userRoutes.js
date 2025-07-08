const express = require('express');
const router = express.Router();
const userController = require('../Controller/loginController');
router.get('/createUser', userController.CreateForms);
router.post('/createUser', userController.CreateUser);
router.get('/userslist', userController.getAllUsers);
router.get('/serviceoffer', userController.getAllUsers);
router.get('/reset-password/:username', userController.showResetPasswordForm);
router.post('/reset-password/:username', userController.resetPassword);
router.get('/', userController.getAllUsers, (req, res) => {
  res.render('createUser'); // Render the customer list view
  });
router.get('/dashboard', userController.getAllUsers, (req, res) => {
  res.render('dashboard'); // Render the dashboard view
});
module.exports = router;
