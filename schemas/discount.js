const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  type: {
    type: String,
    enum: ["percentage", "buyxgety"],
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  expiration: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Discount", discountSchema);