const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    role: {
    type: String,
    enum: ["admin", "employee"],
    default: "employee"
},
    password: String,

    otp: String,
    otpExpires: Date
});

module.exports = mongoose.model("User", userSchema); 