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
    res.render('services/listofservice', { savedServices: servicesWithPercent });

  } catch (error) {
    console.error('Error submitting services:', error);
    res.status(500).send('Server error');
  }
};
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
    const serviceOffId = req.params.id;
    const { serviceName, status, Amount } = req.body;
    const registrationId = req.body.registrationId;
    const deleteService = await removeservice.findOneAndDelete({ registrationId: registrationId });
    // if (!deleteService) {
    //   return res.status(404).json({ message: 'Service not found' });
    // }
    // else {
    const updatedService = await CustomerService.findOneAndUpdate(
      { serviceOffID: serviceOffId },
      { serviceName, status, servicePrice: Amount, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    const savedServices = await getAllServiceOffered();
    res.render('services/listofservice', { savedServices });
    // }

  } catch (error) {
    console.error('Error updating service:', error);
    res.status(400).json({ message: 'Bad Request', error });
  }
};

// Expose all exports
module.exports = {
  createService,
  updateService,
  assignedemployee
};