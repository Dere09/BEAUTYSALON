// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require('../Controller/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get("/", authMiddleware, dashboardController.dailyServiceReport);

module.exports = router;
