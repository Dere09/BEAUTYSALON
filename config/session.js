const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
dotenv.config();

// MongoDB connection string
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/BEAUTYSALON';

module.exports = session({
  secret: process.env.SESSION_SECRET || 'FlUXkohUpvPhohklu',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUrl,
    collectionName: 'sessions', // Optional: default is 'sessions'
    ttl: 60 * 60 * 24, // Optional: time to live in seconds (1 day)
  }),
  cookie: { secure: false } // Set true if using HTTPS
});