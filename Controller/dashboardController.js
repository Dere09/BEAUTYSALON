// controllers/dashboardController.js
const CustomerService = require('../models/customerService'); // your MongoDB model
const employee = require("../models/loginuser");
const User = require('../models/userModel');    // assuming you have employee collection
const menuConfig = require('../config/menuConfig');

const dailyServiceReport = async (req, res) => {
  try {
    const salonId = req.session.user.salonId;

    // Get all registrationIds belonging to this salon to filter services
    // (Since CustomerService doesn't have salonId directly)
    const salonCustomers = await User.find({ salonId: salonId }).select('registrationId');
    const salonRegistrationIds = salonCustomers.map(user => user.registrationId);

    // Total completed services for this salon
    const totalServices = await CustomerService.countDocuments({
      status: "Completed",
      registrationId: { $in: salonRegistrationIds }
    });

    // Total revenue from completed services
    const todays = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(todays.getMonth() - 6);

    const monthlyRevenueAgg = await CustomerService.aggregate([
      {
        $match: {
          status: "Completed",
          registrationId: { $in: salonRegistrationIds },
          updatedAt: {
            $gte: sixMonthsAgo,
            $lte: todays,
          },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$servicePrice" } },
      },
    ]);
    const monthlyRevenue = monthlyRevenueAgg.length > 0 ? monthlyRevenueAgg[0].total : 0;

    // Total employees in this salon
    const employeesCount = await employee.countDocuments({ salonId: salonId });

    // Today’s appointments in this salon
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1);

    const todaysAppointments = await User.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      salonId: salonId
    });

    const roles = req.session.user.role;
    const menu = menuConfig[roles];
    res.render('dashboard', {
      totalServices,
      monthlyRevenue,
      employeesCount,
      todaysAppointments,
      menu
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating dashboard summary");
  }
};

module.exports = { dailyServiceReport };
