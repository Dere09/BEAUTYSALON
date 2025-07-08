const mongoose = require('mongoose');
const customerServiceSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
        unique: true
    },
    serviceName: {
        type: String,
        required: true
    },
    serviceDescription: {
        type: String,
        required: true
    },
    servicePrice: {
        type: Number,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    registrationId: {
        type: String,
        required: true,
        unique: true
    },
    specialistName: {
        type: String,
        required: true
    },
});
const CustomerService = mongoose.model('CustomerService', customerServiceSchema);
module.exports = CustomerService;