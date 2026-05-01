const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); 
require("dotenv").config();

const { sendBlockEmail, sendTransactionReceipt } = require("./email"); // ✅ import here

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/blocked-cards", require("./routes/blockedCardRoutes"));

// ✅ EMAIL ROUTE (ADD HERE ONLY ONCE)
app.post("/api/block-card", async (req, res) => {
  console.log("🔥 BLOCK API HIT");

  const { email, last4, location, amount, merchant } = req.body;

  try {
    console.log("📨 Sending email to:", email);

    const result = await sendBlockEmail(email, last4, location, amount, merchant);

    console.log("✅ EMAIL SENT RESULT:", result);

    res.json({ success: true });
  } catch (err) {
    console.log("❌ EMAIL ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Server start
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = {
  sendBlockEmail,
  sendTransactionReceipt
};