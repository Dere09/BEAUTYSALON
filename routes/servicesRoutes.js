const express= require('express');
const router = express.Router();
const serviceController = require('../Controller/serviceController');
//const CustomerServiceController = require('../controllers/serviceController');
const User = require('../models/userModel');
router.get('/serviceoffer', serviceController.showServiceOffer);
router.get('/serviceoffer/:registrationId', async (req, res) => {
  const registrationId = req.params.registrationId;
  try {
    const user = await User.findOne({ registrationId });
    if (!user) {
      return res.status(404).send('Client not found');
    }
    // Pass fullName and registrationId directly to the view
   // const users = ["Alice", "Bob", "Carol", "David"];
   const users = await User.find().sort({ createdAt: -1 }); // Fetch all users for the view
    res.render('serviceoffer', { 
      fullName: user.fullName, 
      registrationId: user.registrationId, 
      users // (optional, if you want to use user object in the view)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
// Default route to show service offers
module.exports = router;
