const express = require('express');
const multer = require('multer');
const router = express.Router();
const { handleRegistration,getAllCustomers } =require('../Controller/registerController');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage, filefilter: (req, file, cb) =>{
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
  {
    cb(null,true);
  }
  else{
    cb(new Error('Only JPG and PNG files are allowed'),false);
  }
} });
router.get('/register', (req, res) => {
  res.render('registration'); // Make sure you have a register.ejs or equivalent
}); 
router.get('/', handleRegistration);
router.post('/register', upload.single('receipt'), handleRegistration);
router.get('/Customers',getAllCustomers);

module.exports = router;