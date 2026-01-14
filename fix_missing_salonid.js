const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const loginuser = require('./models/loginuser');
const Institution = require('./models/institutionModel');

async function fixMissingSalonIds() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB\n');

        // Get the first institution to use its salon_id
        const institutions = await Institution.find({}).lean();

        if (institutions.length === 0) {
            console.log('❌ No institutions found in database!');
            console.log('Please create an institution first before running this fix.');
            await mongoose.connection.close();
            return;
        }

        const defaultSalonId = institutions[0].salon_id;
        console.log(`Using institution: ${institutions[0].institutionName || institutions[0].salon_name}`);
        console.log(`Default salonId: ${defaultSalonId}\n`);

        // Find users without salonId
        const usersWithoutSalon = await loginuser.find({
            $or: [
                { salonId: { $exists: false } },
                { salonId: null },
                { salonId: '' }
            ]
        });

        console.log(`Found ${usersWithoutSalon.length} users without salonId\n`);

        if (usersWithoutSalon.length === 0) {
            console.log('✅ All users already have salonId!');
            await mongoose.connection.close();
            return;
        }

        // List users that need fixing
        console.log('Users that need salonId:');
        usersWithoutSalon.forEach((user, i) => {
            console.log(`${i + 1}. ${user.username} (${user.fullName}) - Role: ${user.role}`);
        });

        console.log(`\n--- Applying Fix ---`);
        console.log(`Setting salonId to "${defaultSalonId}" for all users without it...\n`);

        // Update all users without salonId to have the default value
        const result = await loginuser.updateMany(
            {
                $or: [
                    { salonId: { $exists: false } },
                    { salonId: null },
                    { salonId: '' }
                ]
            },
            {
                $set: { salonId: defaultSalonId }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} users with salonId: "${defaultSalonId}"`);

        // Verify the fix
        const stillMissing = await loginuser.countDocuments({
            $or: [
                { salonId: { $exists: false } },
                { salonId: null },
                { salonId: '' }
            ]
        });

        if (stillMissing === 0) {
            console.log('✅ All users now have salonId!');
            console.log('\n🎉 Fix completed successfully!');
            console.log('You can now log out and log back in to access the Recurring Customers page.');
        } else {
            console.log(`⚠️  Still ${stillMissing} users without salonId`);
        }

        await mongoose.connection.close();
        console.log('\nConnection closed');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixMissingSalonIds();
