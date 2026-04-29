const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

// ✅ SAVE TRANSACTION
router.post("/add", async (req, res) => {
  try {
    const tx = await Transaction.create(req.body);
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL TRANSACTIONS
router.get("/all", async (req, res) => {
  try {
    const data = await Transaction.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;