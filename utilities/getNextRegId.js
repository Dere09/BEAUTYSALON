const Counter = require('../models/Counter');

async function getNextRegistrationId() {
  const counter = await Counter.findByIdAndUpdate(
    'registrationId',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return `REG-${counter.sequence_value.toString().padStart(4, '0')}`;
}

module.exports = getNextRegistrationId;