const mongoose = require('mongoose');

const testimonialSchema = mongoose.Schema({
    no: {
        type: Number,
        required: [true, 'Please provide an ID!']
    },
    discordid: {
        type: String,
        required: [true, 'Please provide a Discord ID!']
    },
    itemType: {
        type: String,
        required: [true, 'Please provide the type of item!']
    },
    itemName: {
        type: String,
        required: [true, 'Please provide the item\'s name!']
    },
    itemPrice: {
        type: Number,
        required: [true, 'Please provide the item\'s price!']
    },
    totalLocks: {
        type: Number,
        require: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);