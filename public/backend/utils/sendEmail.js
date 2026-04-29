const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const info = await transporter.sendMail({
            from: `"Your App" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,   // ✅ MUST BE html
        });

        console.log("✅ Email sent:", info.response);

    } catch (err) {
        console.error("❌ Email error:", err);
    }
};

module.exports = sendEmail;