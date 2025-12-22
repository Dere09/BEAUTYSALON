const Counter = require('../models/Counter');
async function getNextRegistrationId(salonId) {
  if (!salonId) {
    throw new Error('salonId is required for registration ID generation');
  }

  // Scope the counter by salonId
  const counterId = `registrationId_${salonId}`;

  // Current Date Str YYYY-MM-DD (Use local time or UTC as per requirement, assumed local here based on usage)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Find existing counter
  let counter = await Counter.findById(counterId);

  let newSequenceValue = 1;

  if (counter) {
    if (counter.last_updated_date === todayStr) {
      // Same day, increment
      newSequenceValue = counter.sequence_value + 1;
    } else {
      // New day (or first time with date), reset to 1
      newSequenceValue = 1;
    }

    // Update counter
    counter = await Counter.findByIdAndUpdate(
      counterId,
      {
        sequence_value: newSequenceValue,
        last_updated_date: todayStr
      },
      { new: true }
    );
  } else {
    // Determine start value. Usually 1.
    counter = await Counter.create({
      _id: counterId,
      sequence_value: 1,
      last_updated_date: todayStr
    });
  }

  // Example Format: REG-0001 (Unique per salon + satr)
  return `REG-${counter.sequence_value.toString().padStart(4, '0')}`;
}

module.exports = getNextRegistrationId;