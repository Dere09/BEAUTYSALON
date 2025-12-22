const mongodb = require('mongoose');
const institutionSchema = new mongodb.Schema({
    salon_id: {
        type: String,
        required: true,
        trim: true
    },
    institutionName: {
        type: String,
        required: true,
        trim: true
    },
    institutionManager: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const institutionModel = mongodb.model('institution', institutionSchema);
module.exports = institutionModel;