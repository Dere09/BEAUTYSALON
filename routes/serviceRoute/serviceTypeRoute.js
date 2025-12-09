const express = require('express');
const router = express.Router();
const serviceTypeController = require('../../Controller/services/serviceType');
const getNextserviceIdId = require('../../Controller/services/scounterController');
const addserviceTypes=require('../../Controller/services/serviceType'); 
// router.get('/services/createServiceType', getNextserviceIdId.enderServiceType);// Render the service type form with a new service ID
router.post('/services/createServiceType', addserviceTypes.addServiceType);

module.exports = router;
