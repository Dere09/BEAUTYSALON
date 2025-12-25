const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
dotenv.config();

// MongoDB connection string
const mongoUrl = process.env.MONGO_URI;

const sessionTtlSeconds = Number(process.env.SESSION_TTL_SECONDS || 60 * 30);

module.exports = session({
  secret: process.env.SESSION_SECRET || 'FlUXkohUpvPhohklu',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUrl,
    collectionName: 'sessions', // Optional: default is 'sessions'
    ttl: sessionTtlSeconds,
  }),
  cookie: { secure: false, maxAge: sessionTtlSeconds * 1000 } // Set true if using HTTPS
});