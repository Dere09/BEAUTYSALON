const express = require('express');
const router = express.Router();
const instController = require('../Controller/institutionController');

// --- Institution Admin Routes ---

// GET: Shows the form AND the list (mounted at /Institution)
router.get('/', instController.getCreateForm);

// POST: Handles institution creation (POST /Institution)
router.post('/', instController.createInstitution);

// Optional: provide a registration dropdown endpoint under /Institution/registration
router.get('/registration', instController.getRegistrationPage);

// Allow posting registration via same controller for now
router.post('/registration', instController.createInstitution);

module.exports = router;