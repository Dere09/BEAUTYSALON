const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
  last_updated_date: { type: String, default: null } // Stores YYYY-MM-DD
});

module.exports = mongoose.model('Counter', counterSchema);