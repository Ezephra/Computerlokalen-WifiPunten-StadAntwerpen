const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    attributes: {
        objectId: {
            type: Number,
            required: true
        },
        locationName: {
            type: String,
            required: true
        },
        streetName: {
            type: String,
            required: true
        },
        streetNumber: {
            type: String,
            required: true
        },
        postcode: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        }
    },
    geometry: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        }
    }
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    favorites: {
        type: [favoriteSchema],
        required: false
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;