const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    sold:{
        type: Number,
        required: true,
    }
});

const Sold = mongoose.model('Sold', stockSchema);

module.exports = Sold;
