const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: false,
    lowercase: true,
    trim: true
  },
  regdate: {
    type: Date,
    required: true,
    trim: true
  },
  registrationId: {
    type: String,
    required: true
    // unique: true // Removed global uniqueness
  },
  salonId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  regDateStr: {
    type: String, // YYYY-MM-DD
    required: true
  },
  queueNumber: {
    type: Number,
    required: false // Optional if not all users have one, but we'll set it in controller
  }
});

// Enforce compound uniqueness per Salon + Date
// Dropping previous index is handled by MongoDB usually if name implies, but best to be safe.
// Note: If you have existing data without regDateStr, this strict index might fail on creation.
userSchema.index({ salonId: 1, registrationId: 1, regDateStr: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);