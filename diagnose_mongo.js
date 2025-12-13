require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
console.log('Testing Cloud Connection...');
console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('✅ Cloud Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.log('❌ FULL ERROR:');
        console.log(JSON.stringify(err, null, 2));
        process.exit(1);
    });
