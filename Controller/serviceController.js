const customerList = require('../models/userModel');
const serviceOffer = require('../models/customerService');
const stafflist = require('../models/loginuser');
//const serviceType = require('../models/services/serviceType');
const serviceTypemodel = require('../models/services/serviceType');
exports.showServiceOfferById = async (req, res) => {
    try {
        const regId = req.params.registrationId;

        // Fetch all necessary data in parallel
        const [serviceOffers, staffMembers, customer] = await Promise.all([
            serviceTypemodel.find({}, 'serviceName serviceId').lean().exec(),
            stafflist.find().lean().exec(),
            customerList.findOne({ registrationId: regId }).lean().exec()
        ]);

        if (!customer) {
            return res.status(404).render('error', {
                message: `Customer with registrationId ${regId} not found.`,
                error: {}
            });
        }

        res.render('serviceoffer', {
            regId,
            customers: customer,
            serviceOffer: serviceOffers,
            staff: staffMembers
        });

    } catch (error) {
        console.error('Error in showServiceOffer:', error);

        res.status(500).render('error', {
            message: 'Failed to load service offer page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};
/* #####################################################*The above module stands for user populate in the service officer page*/