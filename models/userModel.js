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
    unique: true,
    lowercase: true,
    trim: true
  },
  regdate: {
type:Date,
required:true,
  trim:true
  },
  registrationId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);