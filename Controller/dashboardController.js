// controllers/dashboardController.js
const CustomerService = require('../models/customerService'); // your MongoDB model
const User = require("../models/loginuser");        // assuming you have employee collection

const dailyServiceReport = async (req, res) => {
  try {
    // Total completed services
    const totalServices = await CustomerService.countDocuments({ status: "Completed" });

    // Total revenue from completed services
    // Get today's date
    const todays = new Date();

    // Calculate the date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(todays.getMonth() - 6);
    const monthlyRevenueAgg = await CustomerService.aggregate([
      {
        $match: {
          status: "Completed",
          updatedAt: {
            $gte: sixMonthsAgo, // from 6 months ago
            $lte: todays, // 1st of current month
          },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$servicePrice" } },
      },
    ]);
    const monthlyRevenue = monthlyRevenueAgg.length > 0 ? monthlyRevenueAgg[0].total : 0;

    const tdappoint = new Date();
    // Total employees
    const employeesCount = await User.countDocuments();

    // Today’s appointments
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todaysAppointments = await User.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    res.render('dashboard', {
      totalServices,
      monthlyRevenue,
      employeesCount,
      todaysAppointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating dashboard summary");
  }
};

module.exports = { dailyServiceReport };
