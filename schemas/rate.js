const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  DL: {
    type: Number,
    required: true,
  },
  WL: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model('Rate', rateSchema);