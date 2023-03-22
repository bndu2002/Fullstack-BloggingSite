const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        enum: ['Mr', 'Mrs', 'Miss']
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    }
},{timestamps:true});

module.exports = mongoose.model('User',userSchema)