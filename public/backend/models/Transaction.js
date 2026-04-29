const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  cardholderName: String,
  cardNumberMasked: String,
  merchantName: String,
  productName: String,
  amount: Number,
  location: String,
  timestamp: Date,
  riskScore: Number,
  isFraud: Boolean,
  reasons: [String]
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);