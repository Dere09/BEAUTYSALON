const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const loginuser = require('./models/loginuser');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        const users = await loginuser.find({}).lean();

        console.log('\n=== ALL USERS IN DATABASE ===');
        console.log(`Total users: ${users.length}\n`);

        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  Username: ${user.username}`);
            console.log(`  Full Name: ${user.fullName}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Phone: ${user.phone}`);
            console.log(`  SalonId: ${user.salonId || 'MISSING!!!'}`);
            console.log(`  Created: ${user.createdAt}`);
            console.log('---');
        });

        const usersWithoutSalon = users.filter(u => !u.salonId);
        if (usersWithoutSalon.length > 0) {
            console.log('\n⚠️  WARNING: Found users without salonId:');
            usersWithoutSalon.forEach(u => {
                console.log(`  - ${u.username} (${u.fullName})`);
            });
        } else {
            console.log('\n✅ All users have salonId field');
        }

        await mongoose.connection.close();
        console.log('\nConnection closed');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
