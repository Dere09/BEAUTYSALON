const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../Controller/loginController');

router.get('/createUser', authMiddleware, userController.CreateForms);
router.post('/createUser', authMiddleware, userController.CreateUser);
router.get('/userslist', authMiddleware, userController.getPaginatedUsers);
router.get('/serviceoffer', authMiddleware, userController.getAllUsers);
router.get('/reset-password/:username', authMiddleware, userController.showResetPasswordForm);
router.post('/reset-password/:username', authMiddleware, userController.resetPassword);
router.get('/advert', authMiddleware, userController.getAllUsers, (req, res) => {
  res.render('ads-manager'); // Render the customer list view
});
// router.get('/dashboard', userController.getAllUsers, (req, res) => {
//   res.render('dashboard'); // Render the dashboard view
// });
module.exports = router;
