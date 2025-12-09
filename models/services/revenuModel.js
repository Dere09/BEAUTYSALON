// models/CustomerService.js
const mongoose = require('mongoose');

const customerServiceSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});

// ✅ Total revenue this month
customerServiceSchema.statics.getCurrentMonthTotal = async function () {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const result = await this.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
  ]);

  return result[0]?.totalRevenue || 0;
};

// ✅ Revenue for last 6 months (for Chart)
customerServiceSchema.statics.getMonthlyStats = async function () {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  });

  return Promise.all(months.reverse().map(async (monthDate) => {
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const result = await this.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return {
      month: start.toLocaleString('default', { month: 'short' }),
      total: result[0]?.total || 0
    };
  }));
};

module.exports = mongoose.model('CustomerService', customerServiceSchema);