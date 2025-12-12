const customerService = require('../models/customerService');

const getAllServiceOffered = async () => {
  try {
    // Fetch data directly from database (no caching)
    const allServices = await customerService.find({ 'status': { $ne: 'Completed' } }).lean();
    if (!allServices || allServices.length === 0) {
      return [];
    }

    // Count employee assignments
    const counts = {};
    allServices.forEach(svc => {
      if (svc.assignedemployee) {
        counts[svc.assignedemployee] = (counts[svc.assignedemployee] || 0) + 1;
      }
    });

    // Calculate total
    const total = allServices.length;

    // Enhance with percentages
    const servicesWithPercent = allServices.map(svc => {
      const percent = svc.assignedemployee
        ? ((counts[svc.assignedemployee] / total) * 100)
        : 0;
      return { ...svc, percentage: percent.toFixed(1) };
    });

    return servicesWithPercent;
  } catch (error) {
    console.error('Error in getAllServiceOffered:', error.message);
    throw error;
  }
};

module.exports = {
  getAllServiceOffered
};