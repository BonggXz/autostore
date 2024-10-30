const mongoose = require("mongoose");

const dataSchema = mongoose.Schema(
  {
    discordID: {
      type: String,
      required: true,
    },
    GrowID: {
      type: String,
      required: true,
    },
    totalDeposit: {
      type: Number,
      required: true,
    },
    totalLocks: {
      type: Number,
      required: true,
    },
    walletBalance: {
      type: Number,
      required: true,
    },
    totalWallet: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", dataSchema);