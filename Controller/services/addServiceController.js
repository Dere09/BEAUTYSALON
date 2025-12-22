const CustomerService = require('../../models/customerService');
const ServiceTypeModel = require('../../models/services/serviceType'); // MISSING in your code
const getNextServiceId = require('../../utilities/getNextServId');
const { getAllServiceOffered } = require('../../utilities/getCacheData');
const removeservice = require('../../models/userModel');
// CREATE Service
const createService = async (req, res) => {
  try {
    const { registrationId, services } = req.body;

    if (!services || services.length === 0) {
      return res.status(400).json({ message: 'No services selected' });
    }

    const servicesArray = Array.isArray(services) ? services : [services];
    const insertions = [];

    for (const serviceId of servicesArray) {
      const staffKey = `staff_${serviceId}`;
      const specialistName = req.body[staffKey];

      if (!specialistName) continue;

      const service = await ServiceTypeModel.findOne({ serviceId });
      if (!service) continue;

      const serviceOffID = await getNextServiceId();

      const newServiceEntry = new CustomerService({
        serviceOffID,
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        servicePrice: service.servicePrice,
        registrationId,
        assignedemployee: specialistName,
      });

      const savedEntry = await newServiceEntry.save();
      if (!savedEntry) {
        return res.status(500).json({ message: 'Failed to save service' });
      }

      insertions.push(savedEntry);
    }
    await removeservice.deleteOne({ registrationId });
    // Fetch all saved records
    const allServices = await CustomerService.find({ 'status': { $ne: 'Completed' } }).lean();

    // Count repetitions of assignedemployee
    const counts = {};
    allServices.forEach(svc => {
      counts[svc.assignedemployee] = (counts[svc.assignedemployee] || 0) + 1;
    });

    // Get total count (for percentage calculation)
    const total = allServices.length;

    // Attach percentage to each service record
    const servicesWithPercent = allServices.map(svc => {
      const percent = ((counts[svc.assignedemployee] / total) * 100).toFixed(1);
      return { ...svc, percentage: percent };
    });

    // Pass enhanced data to view
    // res.render('services/listofservice', { savedServices: servicesWithPercent });
    res.redirect('/SericeOffered');

  } catch (error) {
    console.error('Error submitting services:', error);
    res.status(500).send('Server error');
  }
};

const getServiceList = async (req, res) => {
  try {
    const savedServices = await getAllServiceOffered();
    res.render('services/listofservice', { savedServices });
  } catch (err) {
    console.error('Error getting service list:', err);
    res.status(500).send('Server Error');
  }
}

const assignedemployee = async (req, res) => {
  try {
    const savedServices = await CustomerService.find(); // get all services, no duplicates
    const employeeCounts = {};
    savedServices.forEach(lservice => {
      const emp = lservice.assignedemployee;
      employeeCounts[emp] = (employeeCounts[emp] || 0) + 1;
    });
    res.json({ employeeCounts, totalRecords: savedServices.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
// UPDATE service serviceOffId, serviceName, status, Amount,registrationId
const updateService = async (req, res) => {
  try {
    const serviceOffIdInUrl = req.params.id;
    const { status, serviceName, Amount } = req.body;

    // Build update object based on what's provided
    const updateData = { updatedAt: Date.now() };
    if (status) updateData.status = status;
    if (serviceName) updateData.serviceName = serviceName;
    if (Amount) updateData.servicePrice = Amount;

    const updatedService = await CustomerService.findOneAndUpdate(
      { serviceOffID: serviceOffIdInUrl },
      updateData,
      { new: true }
    );

    if (!updatedService) {
      console.log(`Service with ID ${serviceOffIdInUrl} not found`);
      return res.status(404).json({ message: 'Service not found' });
    }

    res.redirect('/SericeOffered');

  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Expose all exports
module.exports = {
  createService,
  updateService,
  assignedemployee,
  getServiceList
};