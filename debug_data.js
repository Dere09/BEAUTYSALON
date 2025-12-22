const mongoose = require('mongoose');
require('dotenv').config();

// Mute warnings
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
    if (name === `warning`) return false;
    return originalEmit.apply(process, [name, data, ...args]);
};

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('CONNECTED');

        const Inst = mongoose.model('institution', new mongoose.Schema({}, { strict: false }));
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        console.log('--- SALONS ---');
        const salons = await Inst.find({}).select('institutionName salon_id');
        console.log(JSON.stringify(salons, null, 2));

        console.log('--- USERS ---');
        const users = await User.find({}).select('fullName salonId registrationId regDateStr');
        console.log(JSON.stringify(users, null, 2));

        console.log('--- INDEXES ---');
        try {
            const indexes = await User.collection.indexes();
            indexes.forEach(idx => console.log('Index:', idx.name, idx.key));
        } catch (e) { console.log('No indexes or error', e.message); }

        mongoose.disconnect();
    })
    .catch(err => console.error(err));
