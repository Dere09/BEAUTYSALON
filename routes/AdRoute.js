const express = require('express');
const router = express.Router();
const adController = require('../Controller/adController');
const { singleUpload, bulkUpload } = require('../middleware/multerConfig');

// Create ad (single file) -> POST /api/ads/create
router.post('/create', singleUpload.single('image'), (req, res) => adController.create(req, res));

// List ads -> GET /api/ads
router.get('/', (req, res) => adController.getAll(req, res));

// Get ad by id -> GET /api/ads/:id
router.get('/:id', (req, res) => adController.getById(req, res));

// Update ad -> PUT /api/ads/:id
router.put('/:id', express.json(), (req, res) => adController.update(req, res));

// Delete ad -> DELETE /api/ads/:id
router.delete('/:id', (req, res) => adController.delete(req, res));

// Bulk create -> POST /api/ads/bulk-create
router.post('/bulk-create', bulkUpload, (req, res) => adController.bulkCreate(req, res));

module.exports = router;