const express = require("express");
const router = express.Router();


const User = require("../models/User");  // ✅ ADD THIS

const {
    register,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    checkEmail,
    sendOtp
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.post("/check-email", checkEmail); // ✅ now works
router.post("/send-otp", sendOtp);       // ✅ now works

router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

const authMiddleware = require("../middleware/authMiddleware");

// 🔒 Protected route example
router.get("/profile", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
});

module.exports = router; 