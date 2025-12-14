const Tesseract = require('tesseract.js');
const User = require('../models/userModel');
const getNextRegistrationId = require('../utilities/getNextRegId');
const fs = require('fs');
const CustomerService = require('../models/customerService');

exports.handleRegistration = async (req, res) => {
  console.log('Register Controller - Body:', req.body);
  console.log('Register Controller - File:', req.file);

  if (!req.body) {
    console.error('CRITICAL: req.body is undefined!');
    return res.status(500).send('Server Error: Request body is missing.');
  }

  const { fullName, phone, regdate } = req.body;
  const imagePath = req.file.path;

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

    // Validate content
    const isValid = text.includes('dereje endale dima') || text.includes(currentDate);

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
        const registrationId = await getNextRegistrationId();

        const user = await User.create({
          fullName,
          phone,
          regdate,
          registrationId
        });

        return res.render('success', {
          name: fullName,
          phone,
          registrationId
        });
      }
    }
    else {
      return res.render('failure', {
        reason: `Receipt must include payee name and today's date (${currentDate})`
      });
    }
  }

  catch (error) {
    // Ensure image is deleted in case of OCR error
    fs.unlink(imagePath, (err) => {
      if (err) console.error('File deletion on error failed:', err);
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