const express = require('express');
const router = express.Router();
const serviceController = require('../Controller/serviceController');
const User = require('../models/userModel');
router.get('/serviceoffer/:registrationId', serviceController.showServiceOfferById);

module.exports = router;