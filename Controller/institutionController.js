const instModel = require('../models/institutionModel');
const { getNextInstitutionId, peekNextInstitutionId } = require('../utilities/institutionNext');

// POST: Create Institution
const createInstitution = async (req, res) => {
  try {
    const { salon_id, institutionName, institutionManager, email, phone, address, status, pageFrom } = req.body;

    // Validation
    if (!institutionName || !email || !phone || !address || !institutionManager) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    await instModel.updateMany(
      { institutionManager: { $exists: false } }, // only missing ones
      { $set: { institutionManager: "" } }
    );
    const newInstitution = new instModel({
      salon_id: await getNextInstitutionId(),
      institutionName,
      institutionManager,
      email,
      phone,
      address,
      status: status || 'Active'
    });

    await newInstitution.save();

    // After creation: REDIRECT based on where it came from
    // if (pageFrom === 'registration') {
    //    const institutions = await instModel.find({ status: 'active' }).sort({ institutionName: 1 });
    //   return res.redirect('/registration',institutions); // Let GET handle rendering
    // }
    // Redirect to the list/form page after successful creation
    return res.redirect('/Institution');

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error('Create institution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET: Show Create Form
const getCreateForm = async (req, res) => {
  try {
    const getNextId = await peekNextInstitutionId();
    const institutions = await instModel.find().sort({ createdAt: -1 });

    // This is a GET request → req.body is undefined → don't check it
    res.render('Institution/createInst', { getNextId, institutions });
  } catch (error) {
    console.error('Get create form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET: Registration Page (Populates the select dropdown)
const getRegistrationPage = async (req, res) => {
  try {
    // Fetch only the list of institutions needed for the dropdown
    const institutions = await instModel.find({ status: 'Active' }).sort({ institutionName: 1 });
    // Pass the list to the view
    res.render('registration', { institutions });
  } catch (error) {
    console.error('Get registration page error:', error);
    res.status(500).send('Server error.');
  }
};

module.exports = {
  createInstitution,
  getCreateForm,
  getRegistrationPage
};