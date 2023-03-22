const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: objectId,
        required: true,
        ref: 'User'
    },
    tags: [String],

    category: {
        type: String,
        required: true,
        trim: true
    },
    subcategory: [String],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    publishedAt: {
        type: Date
    },
    isPublished: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });


module.exports = mongoose.model('Userblog', blogSchema) 
