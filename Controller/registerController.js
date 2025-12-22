const Tesseract = require('tesseract.js');
const User = require('../models/userModel');
const getNextRegistrationId = require('../utilities/getNextRegId');
const fs = require('fs');
const CustomerService = require('../models/customerService');
const Institution = require('../models/institutionModel');
exports.handleRegistration = async (req, res) => {
  console.log('Register Controller - Body:', req.body);
  console.log('Register Controller - File:', req.file);

  if (!req.body) {
    console.error('CRITICAL: req.body is undefined!');
    console.error('Incoming Content-Type:', req.headers['content-type']); // Log the header!
    // Attempt to salvage if it's just missing
    req.body = {};
  }

  const { fullName, phone, regdate, salon_id } = req.body;

  if (!req.file && !req.body.fullName) {
    return res.status(400).send('Error: Request body and file are missing through the parser.');
  }

  const imagePath = req.file ? req.file.path : null;
  if (!imagePath) {
    return res.render('failure', { reason: 'Image upload failed or missing' });
  }

  try {
    // OCR the uploaded image
    const result = await Tesseract.recognize(imagePath, 'eng');
    const text = result.data.text.toLowerCase();

    // System date in YYYY/MM/DD
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const currentDate = `${year}/${month}/${day}`;

    // Fetch institution manager name dynamically
    let managerName = 'dereje endale dima'; // Default fallback
    if (salon_id) {
      const institution = await Institution.findOne({ salon_id: salon_id });
      if (institution && institution.institutionManager) {
        managerName = institution.institutionManager.toLowerCase();
      }
    }

    // Validate content
    // Normalize both for better matching (handle extra spaces/newlines)
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const normalizedManagerName = managerName.replace(/\s+/g, ' ').trim();

    // Flexible date check (handles YYYY-MM-DD or YYYY/MM/DD)
    const flexibleDateRegex = new RegExp(currentDate.replace(/\//g, '[-/]'));

    // Validate content
    const isValid = normalizedText.includes(normalizedManagerName) || flexibleDateRegex.test(text);

    console.log('Manager Name (normalized):', normalizedManagerName);
    console.log('OCR Text (normalized):', normalizedText.substring(0, 200) + '...');
    // Delete the file whether valid or not
    fs.unlink(imagePath, (err) => {
      if (err) console.error('File deletion failed:', err);
    });

    if (isValid) {
      const exists = await User.findOne({ phone });
      if (exists) {
        return res.render('failure', { reason: 'Phone already registered' + exists });
      }
      if (phone != null || fullName != null || regdate != null) {
        // Ensure salon_id is present
        if (!salon_id) {
          return res.render('failure', { reason: 'Salon selection is required.' });
        }

        const registrationId = await getNextRegistrationId(salon_id);
        const todayStr = `${year}-${month}-${day}`;

        // Queue Calculation Logic: (Active Customers registered today) + 1
        // 1. Get all users registered today for this salon
        const todayUsers = await User.find({ salonId: salon_id, regDateStr: todayStr }).lean();

        // 2. Get all service records for these users
        const todayRegIds = todayUsers.map(u => u.registrationId);
        const todayServices = await CustomerService.find({ registrationId: { $in: todayRegIds } }).lean();

        // 3. Determine how many are "Active"
        const activeUsersCount = todayUsers.filter(user => {
          const userServices = todayServices.filter(s => s.registrationId === user.registrationId);
          // Active if: No services yet OR at least one service is NOT 'Completed'
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

      }
    }
    else {
      return res.render('failure', {
        reason: `Receipt must include manager name (${managerName}) or today's date (${currentDate})`
      });
    }
  }

  catch (error) {
    // Ensure image is deleted in case of OCR error
    // Ensure image is deleted in case of OCR error
    fs.unlink(imagePath, (err) => {
      // Ignore ENOENT (file already deleted), log other errors
      if (err && err.code !== 'ENOENT') {
        console.error('File deletion on error failed:', err);
      }
    });

    console.error('OCR Error:', error);
    return res.render('failure', { reason: 'OCR processing failed' });
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