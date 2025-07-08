const customerList= require('../models/userModel');
const serviceOffer = require('../models/serviceModel');
exports.showServiceOffer = async (req, res) => {
    try {
        const customers = await customerList.find();
        res.render('serviceoffer', { customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).send('Internal Server Error');
    }
}
exports.showServiceOfferById = async (req, res) =>{
    try {
    const regId=req.params.registrationId;
    const registrationId = await customerList.findOne({ registrationId: regId });
    if (!registrationId) {
        return res.status(404).send('Customer not found');
    }
    res.render('serviceoffer', { registrationId });

    }
    catch (error) {
        console.error('Error fetching customer by ID:', error);
        res.status(500).send('Internal Server Error');
    }
}
/* #####################################################*The above module stands for user populate in the service officer page*/