const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboardController");

router.get("/", dashboardController.renderDashboard);

module.exports = router;
