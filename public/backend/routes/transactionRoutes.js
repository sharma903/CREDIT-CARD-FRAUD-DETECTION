const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// ADD
router.post("/add", async (req, res) => {
  const tx = new Transaction(req.body);
  await tx.save();
  res.json({ success: true });
});

// GET ALL
router.get("/all", async (req, res) => {
  const data = await Transaction.find().sort({ createdAt: -1 });
  res.json(data);
});

module.exports = router;