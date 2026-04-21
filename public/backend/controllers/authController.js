const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const strongPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;

// ================= REGISTER =================
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ error: "All fields required" });

        if (!strongPassword.test(password))
            return res.status(400).json({ error: "Weak password" });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ error: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hashed });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            message: "Registered successfully",
            user: { name: user.name, email: user.email },
            token
        });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Wrong password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            token,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// ================= FORGOT =================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;

        await user.save();

        await sendEmail(email, "OTP Verification", `Your OTP is ${otp}`);

        res.json({ message: "OTP sent" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, error: "User not found" });
        }

        // ✅ FIX: string-safe comparison
        if (user.otp.toString() !== otp.toString()) {
            return res.json({ success: false, error: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.json({ success: false, error: "OTP expired" });
        }

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// ================= RESET =================
exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.json({ success: false, error: "Email missing" });
        }

        if (!strongPassword.test(password)) {
            return res.json({ success: false, error: "Weak password" });
        }

        // ✅ FIX: find user first
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, error: "User not found" });
        }

        // ✅ hash new password
        const hashed = await bcrypt.hash(password, 10);

        // ✅ update properly
        user.password = hashed;
        user.otp = null;
        user.otpExpire = null;

        await user.save();

        console.log("✅ Password updated for:", email);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

// ================= CHECK EMAIL =================
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.sendOtp = exports.forgotPassword;