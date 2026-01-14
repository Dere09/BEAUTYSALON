const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const loginuser = require('./models/loginuser');
const Institution = require('./models/institutionModel');

async function checkAndSuggestFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB\n');

        // Check institutions
        const institutions = await Institution.find({}).lean();
        console.log('=== INSTITUTIONS ===');
        console.log(`Total: ${institutions.length}\n`);
        institutions.forEach((inst, i) => {
            console.log(`${i + 1}. ID: ${inst.salon_id} - Name: ${inst.salon_name}`);
        });

        // Check users
        const allUsers = await loginuser.find({}).lean();
        const usersWithoutSalon = allUsers.filter(u => !u.salonId || u.salonId === '');

        console.log('\n=== USERS ===');
        console.log(`Total users: ${allUsers.length}`);
        console.log(`Users with salonId: ${allUsers.length - usersWithoutSalon.length}`);
        console.log(`Users WITHOUT salonId: ${usersWithoutSalon.length}\n`);

        if (usersWithoutSalon.length > 0) {
            console.log('Users needing salonId:');
            usersWithoutSalon.forEach((user, i) => {
                console.log(`  ${i + 1}. ${user.username} (${user.fullName})`);
            });

            if (institutions.length > 0) {
                const defaultSalonId = institutions[0].salon_id;
                console.log(`\n💡 Suggestion: Set salonId to "${defaultSalonId}" (${institutions[0].salon_name})`);
                console.log('\nRun the fix_missing_salonid.js script to apply this fix.');
            } else {
                console.log('\n⚠️  No institutions found! Create an institution first.');
            }
        } else {
            console.log('✅ All users have salonId!');
        }

        await mongoose.connection.close();
        console.log('\nConnection closed');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndSuggestFix();
