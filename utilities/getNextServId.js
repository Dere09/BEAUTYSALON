const Sequenceno= require('../models/services/servicesequnce');
async function getNextServiceId() {
  const sequence = await Sequenceno.findByIdAndUpdate(
    'serviceOffID',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return `SERV-${sequence.sequence_value.toString().padStart(4, '0')}`; 
}
module.exports = getNextServiceId;