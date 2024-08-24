const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    userId: {
        type: Number,
        ref:"User",
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    dateApplied: {
        type: Date,
        default: Date.now,
    },
    requirements: {
        type: String,
        required: true,
    },
    resume: {
        type: String,
        required: true,
    },
    IsDelete: {
        type: Boolean,
        default:false
    },
});

module.exports = mongoose.model('Application', applicationSchema);
