const Sequenceno= require('../models/instModelid/getInstSeq');
async function getNextInstitutionId() {
  const sequence = await Sequenceno.findByIdAndUpdate(
    'salon_id',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return `SALN-${sequence.sequence_value.toString().padStart(4, '0')}`; 
}
module.exports = getNextInstitutionId;