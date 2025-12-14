require('dotenv').config();

const uri = process.env.MONGO_URI;
if (uri) {
  console.log('MONGO_URI:', uri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)(@)/, '$1$2:****$4'));
} else {
  console.log('MONGO_URI is undefined');
}

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
      waitQueueTimeoutMS: 10000,
      // waitForConnections: true,
      //serverSelectionTimeoutMS: 5000

    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = Connectdb;