const express = require('express');
const router = express.Router();
const serviceController = require('../Controller/serviceController');
const User = require('../models/userModel');
const serviceTypeController = require('../Controller/services/serviceType');
router.get('/serviceoffer', serviceTypeController.getAllServiceType);
router.get('/serviceoffer', serviceController.showServiceOffer);

router.get('/serviceoffer/:registrationId', async (req, res) => {
  const registrationId = req.params.registrationId;
  try {
    const user = await User.findOne({ registrationId });
    if (!user) {
      return res.status(404).send('Client not found');
    }
    const users = await User.find().sort({ createdAt: -1 });
    res.render('serviceoffer', { 
      fullName: user.fullName, 
      registrationId: user.registrationId, 
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;