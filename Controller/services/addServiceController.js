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
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Items per page
    const skip = (page - 1) * limit;

    const allServicesEnhanced = await getAllServiceOffered();
    const totalServices = allServicesEnhanced.length;
    const totalPages = Math.ceil(totalServices / limit);

    // Slice the enhanced array for pagination
    const paginatedServices = allServicesEnhanced.slice(skip, skip + limit);

    res.render('services/listofservice', {
      savedServices: paginatedServices,
      currentPage: page,
      totalPages: totalPages,
      totalServices: totalServices
    });
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
// UPDATE service status
const updateService = async (req, res) => {
  try {
    const serviceOffIdInUrl = req.params.id;
    const { status } = req.body;

    const updatedService = await CustomerService.findOneAndUpdate(
      { serviceOffID: serviceOffIdInUrl },
      { status: status || 'Completed', updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.redirect('/SericeOffered');
  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// BATCH UPDATE status to Completed
const batchUpdateStatus = async (req, res) => {
  try {
    const { serviceOffIDs } = req.body;

    if (!serviceOffIDs || !Array.isArray(serviceOffIDs)) {
      return res.status(400).json({ message: 'No services selected' });
    }

    await CustomerService.updateMany(
      { serviceOffID: { $in: serviceOffIDs } },
      { status: 'Completed', updatedAt: Date.now() }
    );

    res.redirect('/SericeOffered');
  } catch (error) {
    console.error('Error in batch update:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Expose all exports
module.exports = {
  createService,
  updateService,
  batchUpdateStatus, // Add here
  assignedemployee,
  getServiceList
};