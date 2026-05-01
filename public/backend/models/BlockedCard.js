const mongoose = require("mongoose");

const blockedCardSchema = new mongoose.Schema({
  last4: String,
  cardholderName: String,
  cardNumber: String,
  merchant: String,
  product: String,
  amount: Number,
  location: String,
  riskScore: Number,
  reason: String,
  reasons: [String],
  source: String,
  time: Date,
}, { timestamps: true });

module.exports = mongoose.model("BlockedCard", blockedCardSchema);