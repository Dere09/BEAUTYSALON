const Tesseract = require('tesseract.js');
const User = require('../models/userModel');
const getNextRegistrationId = require('../utilities/getNextRegId');
const fs = require('fs');
const CustomerService = require('../models/customerService');
const Institution = require('../models/institutionModel');
exports.handleRegistration = async (req, res) => {
  console.log('Register Controller - Body:', req.body);

  const { fullName, phone, regdate, salon_id } = req.body;

  if (!fullName || !phone || !salon_id) {
    return res.render('failure', { reason: 'Missing required registration details.' });
  }

  try {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const todayStr = `${year}-${month}-${day}`;

    // Check if phone already registered today (to prevent spam/duplicate)
    const exists = await User.findOne({ phone, regDateStr: todayStr, salonId: salon_id });
    if (exists) {
      return res.render('failure', { reason: 'This phone number is already registered for this salon today.' });
    }

    const registrationId = await getNextRegistrationId(salon_id);

    // Queue Calculation Logic: (Active Customers registered today) + 1
    const todayUsers = await User.find({ salonId: salon_id, regDateStr: todayStr }).lean();
    const todayRegIds = todayUsers.map(u => u.registrationId);
    const todayServices = await CustomerService.find({ registrationId: { $in: todayRegIds } }).lean();

    const activeUsersCount = todayUsers.filter(user => {
      const userServices = todayServices.filter(s => s.registrationId === user.registrationId);
      return userServices.length === 0 || userServices.some(s => s.status !== 'Completed');
    }).length;

    const queueNumber = activeUsersCount + 1;

    const user = await User.create({
      fullName,
      phone,
      regdate,
      registrationId,
      salonId: salon_id,
      regDateStr: todayStr,
      queueNumber: queueNumber
    });

    return res.render('success', {
      name: fullName,
      phone,
      registrationId,
      queueNumber: queueNumber
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.render('failure', { reason: 'Registration failed. Please try again later.' });
  }
};
exports.getAllCustomers = async (req, res) => {
  try {
    // 1. Get all customers
    const allCustomers = await User.find().sort({ createdAt: -1 }).lean();

    // 2. Get all services
    const allServices = await CustomerService.find().lean();

    // 3. Filter logic
    const activeCustomers = allCustomers.filter(customer => {
      // Find services for this specific customer
      const customerServices = allServices.filter(s => s.registrationId === customer.registrationId);

      // Rule 1: If no services, SHOW them (New customer)
      if (customerServices.length === 0) return true;

      // Rule 2: If they have services, check if ANY is NOT 'Completed'
      // If (New or In Progress) exists -> SHOW
      // If ALL are 'Completed' -> HIDE
      const hasActiveService = customerServices.some(s => s.status !== 'Completed');

      return hasActiveService;
    });

    res.render('CustomerList', { registrations: activeCustomers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getAllInstitutions = async (req, res) => {
  try {
    const allInstitutions = await institutionmodel.find().sort({ createdAt: -1 }).lean();
    res.render('registration', { institutions: allInstitutions });

  }
  catch (err) {
    console.error('Error fetching institutions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};