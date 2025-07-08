require('dotenv').config();

console.log('MONGO_URI:', process.env.MONGO_URI); // Should print your URI

const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('URL is null');
  process.exit(1);
}

const Connectdb = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = Connectdb;