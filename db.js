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

    // Antigravity Fix: Drop legacy index if it exists to allow duplicates
    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
      if (collections.length > 0) {
        await mongoose.connection.db.collection('users').dropIndex('registrationId_1');
        console.log('✅ Dropped legacy index: registrationId_1');
      }
    } catch (e) {
      // Ignore error if index doesn't exist (code 27)
      if (e.code !== 27) console.log('Notice: Could not drop registrationId_1 index (it might not exist):', e.message);
    }
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = Connectdb;