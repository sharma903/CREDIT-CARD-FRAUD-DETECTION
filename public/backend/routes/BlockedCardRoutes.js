const express = require("express");
const router = express.Router();
const BlockedCard = require("../models/BlockedCard");

// ✅ GET ALL BLOCKED CARDS
router.get("/", async (req, res) => {
  try {
    const cards = await BlockedCard.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD BLOCKED CARD
router.post("/add", async (req, res) => {
  try {
    const card = new BlockedCard(req.body);
    await card.save();
    res.json({ success: true, card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE / UNBLOCK
router.delete("/:last4", async (req, res) => {
  try {
    await BlockedCard.deleteOne({ last4: req.params.last4 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;