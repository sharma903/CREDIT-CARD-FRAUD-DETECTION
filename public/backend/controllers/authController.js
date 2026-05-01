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

                    // 🔥 Decide role based on email
            const ADMIN_EMAIL = "nihalsharma967@gmail.com";

            const role = email === process.env.ADMIN_EMAIL ? "admin" : "employee";

            // ✅ Create user with role
            const user = await User.create({ 
                name, 
                email, 
                password: hashed,
                role : role
            });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            message: "Registered successfully",
            user: { name: user.name, email: user.email, role: user.role },
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

        const token = jwt.sign(
            { id: user._id, role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // ✅ SEND PREMIUM WELCOME EMAIL
        try {
            await sendEmail(
                user.email,
                "🎉 Welcome!",
                `
<div style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 10px;">

        <!-- CARD -->
        <table width="600" style="background:#111827; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.1);">

          <!-- HEADER -->
          <tr>
  <td style="padding:25px; text-align:center;">

    <div style="
      display:inline-block;
      background:linear-gradient(135deg, #38BDF8, #0EA5E9);
      padding:16px 28px;
      border-radius:12px;
      box-shadow:0 6px 20px rgba(56,189,248,0.4);
    ">
      <h1 style="
        margin:0;
        font-size:22px;
        color:#0f172a;
        font-weight:bold;
        letter-spacing:0.5px;
      ">
        Welcome to SecureGuard 
      </h1>
    </div>

  </td>
</tr>

          <!-- BODY -->
          <tr>
            <td style="padding:25px; color:#e5e7eb;">

              <h2 style="margin-top:0; color:#ffffff;">
                Hello ${user.name} 👋
              </h2>

              <p style="font-size:15px; color:#d1d5db;">
                You have successfully logged into your account.
              </p>

              <!-- ACTIVITY BOX -->
              <div style="background:#1f2937; padding:15px; border-radius:8px; margin:20px 0;">
                <p style="margin:0; color:#38BDF8;"><b>🔐 Account Activity:</b></p>
                <p style="margin:5px 0;">📧 ${user.email}</p>
                <p style="margin:5px 0;">🕒 ${new Date().toLocaleString()}</p>
              </div>

              <!-- BUTTON -->
              <div style="text-align:center; margin:25px 0;">
                <a href="http://localhost:8080"
                   style="background:#38BDF8;
                          color:#0f172a;
                          padding:12px 22px;
                          text-decoration:none;
                          border-radius:6px;
                          font-weight:bold;
                          display:inline-block;">
                  Go to Dashboard →
                </a>
              </div>

              <p style="font-size:14px; color:#9ca3af;">
                If this wasn't you, please secure your account immediately.
              </p>

              <p style="margin-top:20px; color:#ffffff;">
                Regards,<br><b>SecureGuard Team</b>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#020617; padding:18px; text-align:center; font-size:13px; color:#9ca3af;">
              
              <div style="margin-bottom:10px;">
                <a href="https://github.com/sharma903" style="margin:0 8px; color:#38BDF8;">GitHub</a> |
                <a href="https://www.linkedin.com/in/nihalsharma2005/" style="margin:0 8px; color:#38BDF8;">LinkedIn</a>
              </div>

              <div>© 2026 SecureGuard</div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</div>
`
            );
        } catch (err) {
            console.log("Email failed:", err.message);
        }

        res.json({
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
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