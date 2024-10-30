const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    desc:{
        type: String,
        required: true,
    },
    harga:{
        type: Number,
        required: true,
    },
    data: {
        type: [String],
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
