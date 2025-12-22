const express = require('express');
const router = express.Router();
const serviceAddController = require('../../Controller/services/addServiceController');
// Handle the form submission to add a new service
router.post('/service', serviceAddController.createService);
// Get all services
//router.get('/:id', serviceAddController.getServiceById);
router.get('/employee-counts', serviceAddController.assignedemployee);
// Update a service status
router.put('/editServiceStatus/:id', serviceAddController.updateService);
router.post('/editServiceStatus/:id', serviceAddController.updateService);
//router.get('/services', serviceAddController.getAllServiceOffered);
router.post('/batchUpdateStatus', serviceAddController.batchUpdateStatus);
router.get('/SericeOffered', serviceAddController.getServiceList);
module.exports = router;
