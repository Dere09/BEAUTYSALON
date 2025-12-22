const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('CONNECTED');

        // 1. Drop Index
        console.log('--- FIXING INDEX ---');
        try {
            const exists = await mongoose.connection.db.collection('users').indexExists('registrationId_1');
            if (exists) {
                await mongoose.connection.db.collection('users').dropIndex('registrationId_1');
                console.log('SUCCESS: Dropped legacy index "registrationId_1"');
            } else {
                console.log('INFO: Index "registrationId_1" does not exist.');
            }
        } catch (e) {
            console.log('ERROR dropping index:', e.message);
        }

        // 2. Check Salons
        console.log('\n--- CHECKING SALONS ---');
        const Inst = mongoose.model('institution', new mongoose.Schema({}, { strict: false })); // 'institutions' collection implied
        const salons = await Inst.find({}).lean(); // Use lean

        if (salons.length === 0) {
            console.log('No salons found.');
        } else {
            salons.forEach(s => {
                console.log(`Salon: "${s.institutionName}" | ID: "${s.salon_id}"`);
            });
        }

        // 3. Check Counters
        console.log('\n--- CHECKING COUNTERS ---');
        // Important: Define _id as String to prevent casting errors
        const Counter = mongoose.model('Counter', new mongoose.Schema({ _id: String }, { strict: false }));
        const counters = await Counter.find({}).lean();
        counters.forEach(c => {
            console.log(`Counter: "${c._id}" | Seq: ${c.sequence_value} | Date: ${c.last_updated_date}`);
        });

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('CONNECTION ERROR:', err);
    });
