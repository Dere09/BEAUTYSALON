const express = require('express');
const multer = require('multer');
const router = express.Router();
const { handleRegistration, getAllCustomers, getRecurringCustomers, rateCustomer } = require('../Controller/registerController');
const institutionController = require('../Controller/institutionController');
const midleware = require('../middleware/authMiddleware');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({
  storage, fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    }
    else {
      cb(new Error('Only JPG and PNG files are allowed'), false);
    }
  }
});
// Render registration page via institution controller so `institutions` is available
router.get('/register', institutionController.getRegistrationPage);
router.get('/registration', institutionController.getRegistrationPage);

router.post('/register', (req, res, next) => {
  console.log('--- Register Request Debug ---');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('--- End Debug ---');
  next();
}, upload.single('receipt'), handleRegistration);
router.get('/Customers', midleware, getAllCustomers);
router.get('/recurring-customers', midleware, getRecurringCustomers);
router.post('/rate-customer', midleware, rateCustomer);

module.exports = router;