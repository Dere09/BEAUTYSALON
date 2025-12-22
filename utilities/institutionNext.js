const Sequenceno = require('../models/instModelid/getInstSeq');
async function getNextInstitutionId() {
  const sequence = await Sequenceno.findByIdAndUpdate(
    'salon_id',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return `SALN-${sequence.sequence_value.toString().padStart(4, '0')}`;
}

async function peekNextInstitutionId() {
  let sequence = await Sequenceno.findById('salon_id');
  if (!sequence) {
    // If no sequence exists yet, start at 0 so next is 1
    return `SALN-0001`;
  }
  // The current value in DB is the LAST generated one. So next is +1.
  const nextVal = sequence.sequence_value + 1;
  return `SALN-${nextVal.toString().padStart(4, '0')}`;
}

module.exports = { getNextInstitutionId, peekNextInstitutionId };