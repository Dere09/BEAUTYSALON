const mongoose= require('mongoose');
const serviceTypeSchema = new mongoose.Schema({
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
});
const ServiceType = mongoose.model('ServiceType', serviceTypeSchema);
module.exports = ServiceType;