const mongoose = require('mongoose');
const customerServiceSchema = new mongoose.Schema({
    serviceOffID:{
        type: String,
        required: true,
        unique: true
    },
    serviceId: {
        type: String,
        required: true
    
    },
    serviceName: {
        type: String,
        required: true
    },
    servicePrice: {
        type: Number,
        required: true
    },
    registrationId: {
        type: String,
        required: true
    },
    assignedemployee: {
        type: String,
        required: false
    },
    createdByUserId: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['New','In Progress', 'Completed'],
        default: 'New'
    }

});
const CustomerService = mongoose.model('customerService', customerServiceSchema);
module.exports = CustomerService;