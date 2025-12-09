const customerService = require('../models/customerService');
const redisClient = require('../config/redis');

const getAllServiceOffered = async () => {
  const cacheKey = 'allServices';
  try {
    // Check cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Cache hit');
      return JSON.parse(cachedData);
    }

    console.log('❌ Cache miss');
    // Fetch data from database
    const allServices = await customerService.find({'status': {$ne: 'Completed'}}).lean();
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

    // Update cache
    try {
      await redisClient.set(cacheKey, JSON.stringify(servicesWithPercent), {
        EX: 60 * 5
      });
    } catch (cacheError) {
      console.error('Cache update failed:', cacheError.message);
    }

    return servicesWithPercent;
  } catch (error) {
    console.error('Error in getAllServiceOffered:', error.message);
    throw error;
  }
};

module.exports = {
  getAllServiceOffered
};