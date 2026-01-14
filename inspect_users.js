const mongoose = require('mongoose');
const User = require('./models/loginuser');
const dotenv = require('dotenv');

dotenv.config();

const inspectUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log('--- USERS INSPECTION ---');
        users.forEach(u => {
            console.log(`User: ${u.username}, Role: ${u.role}, SalonID: '${u.salonId}' (Type: ${typeof u.salonId})`);
        });
        console.log('--- END ---');

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

inspectUsers();
