const Counter = require('../models/services/servcounter');

async function getNextserviceIdId() {
  const counter = await Counter.findByIdAndUpdate(
    'serviceId',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return `SER-${counter.sequence_value.toString().padStart(4, '0')}`;
}

module.exports = getNextserviceIdId;