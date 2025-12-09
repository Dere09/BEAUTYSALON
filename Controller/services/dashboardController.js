const CustomerService = require('../models/CustomerService');

exports.getDashboard = async (req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const monthlyRevenue = await CustomerService.getCurrentMonthTotal();
    const employeeCount = await User.countDocuments({ role: 'employee' });
    const todayAppointments = await Appointment.countToday();
    const revenueStats = await CustomerService.getMonthlyStats();

    res.render('dashboard', {
      totalServices,
      monthlyRevenue,
      employeeCount,
      todayAppointments,
      revenueStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
};
