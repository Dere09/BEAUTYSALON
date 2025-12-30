const mongoose = require('mongoose');
require('dotenv').config();
const loginuser = require('./models/loginuser');
const Institution = require('./models/institutionModel');

async function inspectData() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const institutions = await Institution.find({}, 'institutionName institutionId');
        console.log('\n--- Institutions ---');
        institutions.forEach(inst => console.log(`ID: ${inst.institutionId}, Name: ${inst.institutionName}`));

        const users = await loginuser.find({}, 'username fullName salonId');
        console.log('\n--- Users ---');
        users.forEach(u => console.log(`User: ${u.username}, SalonID: ${u.salonId || 'MISSING'}`));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
inspectData();
