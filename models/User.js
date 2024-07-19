const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dvtml03ht/image/upload/v1721291281/istockphoto-1423856468-1024x1024_fjufpu.jpg"
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    code: {
        type: String,
        // default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: String,
        required: true
    },
}, { timestamps: true })

module.exports = mongoose.model("user", userSchema)