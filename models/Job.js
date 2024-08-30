const mongoose = require('mongoose');

const JobsSchema = mongoose.Schema({
    company:{
        type: String,
        required: [true,'please provide company'],
        maxlength: 50,
    },
    position:{
        type:String,
        required: [true,'please provide position'],
        maxlength: 100,
    },
    status:{
        type:String,
        enum:['interview','declined','pending'],
        default:'pending'
    },
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required: [true,'please provide user'],
    },
    jobType:{
        type:String,
        enum:['full-time','part-time','remote','internship'],
        default: 'full-time'
    },
    jobLocation: {
        type:String,
        default:'my city',
        required: [true,'please provide location'],
    }
},{timestamps: true})

module.exports = mongoose.model('Job', JobsSchema);