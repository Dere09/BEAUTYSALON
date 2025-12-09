require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/BEAUTYSALON';
console.log('Testing connection to:', mongoURI);

mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
