const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nihalsharma967@gmail.com",
    pass: "eqgv bazq rjxr dkje"
  }
});



function sendBlockEmail(email, last4, location, amount, merchant) {
  return transporter.sendMail({
    from: "SecureGuard <yourgmail@gmail.com>",
    to: email,
    subject: "🚫 Card Blocked Alert",
html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

  <!-- WRAPPER -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- CONTAINER -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0"
               style="background:#ffffff; border-collapse:collapse; border-radius:8px; overflow:hidden;">

          <!-- HEADER -->
          <!-- HEADER -->
<tr>
          <td style="background:#0f172a; padding:22px; text-align:center; color:#38BDF8;">
          <div style="font-size:50px; font-weight:bold; color:#38BDF8;">
              SecureGuard
            </div>

          </td>
</tr>

          <!-- BODY -->
          <tr>
            <td style="padding:25px; color:#111827;">

              <h2 style="margin:0 0 10px; color:#dc2626; font-size:18px;">
                ⚠️ Card Blocked
              </h2>

              <p style="font-size:14px; line-height:1.6; margin:0 0 15px;">
                Your card ending with <b>${last4}</b> has been blocked due to suspicious activity.
              </p>

              <!-- DETAILS BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                     style="background:#f1f5f9; border-radius:6px; padding:10px;">

                <tr>
                  <td style="padding:8px; font-size:13px;"><b>Merchant:</b></td>
                  <td style="padding:8px; font-size:13px;">${merchant || "N/A"}</td>
                </tr>

                <tr>
                  <td style="padding:8px; font-size:13px;"><b>Amount:</b></td>
                  <td style="padding:8px; font-size:13px;">₹${amount || "N/A"}</td>
                </tr>

                <tr>
                  <td style="padding:8px; font-size:13px;"><b>Location:</b></td>
                  <td style="padding:8px; font-size:13px;">${location || "N/A"}</td>
                </tr>

                <tr>
                  <td style="padding:8px; font-size:13px;"><b>Time:</b></td>
                  <td style="padding:8px; font-size:13px;">${new Date().toLocaleString()}</td>
                </tr>

              </table>

              <!-- WARNING -->
              <div style="margin-top:15px; background:#fef2f2; padding:12px; border-left:4px solid #dc2626; font-size:13px;">
                If this was not you, please contact support immediately.
              </div>

              <!-- BUTTON -->
              <!-- CONTACT SUPPORT SECTION -->
                  <div style="margin-top:25px; padding:15px; background:#f8fafc; border-radius:6px; text-align:center;">

                    <h3 style="margin:0 0 10px; font-size:16px; color:#111827;">
                      Contact Support
                    </h3>

                    <p style="margin:5px 0; font-size:13px; color:#374151;">
                      📧 Email: nihalsharma967@gmail.com
                    </p>

                    <p style="margin:5px 0; font-size:13px; color:#374151;">
                      📱 Mobile: 9039815061
                    </p>

                    <p style="margin-top:12px; font-size:13px; color:#6b7280;">
                      Regards,<br>
                      <b>SecureGuard Team</b>
                    </p>

                  </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f1f5f9; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
              © 2026 SecureGuard · All rights reserved
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
  });
}

function sendTransactionReceipt(email, last4, location, amount, merchant, status = "SUCCESS", txnId) {
  return transporter.sendMail({
    from: "SecureGuard <yourgmail@gmail.com>",
    to: email,
    subject: "💳 Transaction Receipt - SecureGuard",

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>

<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">

  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- CONTAINER -->
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff; border-collapse:collapse; overflow:hidden; border-radius:10px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#16a34a; padding:22px; text-align:center; color:#fff;">
              <div style="font-size:20px; font-weight:bold;">✔ Payment Successful</div>
              <div style="font-size:12px; margin-top:4px; opacity:0.9;">
                Secure Transaction Receipt
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:25px;">

              <!-- AMOUNT -->
              <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:26px; font-weight:bold; color:#111827;">
                  ₹${amount || "0.00"}
                </div>
                <div style="font-size:13px; color:#6b7280;">
                  Paid Successfully
                </div>
              </div>

              <!-- MERCHANT CARD -->
              <div style="background:#f1f5f9; padding:15px; border-radius:8px; margin-bottom:15px;">
                <div style="font-size:13px; color:#6b7280;">Merchant</div>
                <div style="font-size:15px; font-weight:bold; color:#111827;">
                  ${merchant || "N/A"}
                </div>
              </div>

              <!-- DETAILS TABLE -->
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px; color:#111827;">

                <tr>
                  <td style="padding:8px 0; color:#6b7280;">Status</td>
                  <td style="text-align:right; font-weight:bold; color:#16a34a;">
                    ${status}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 0; color:#6b7280;">Card</td>
                  <td style="text-align:right;">**** ${last4}</td>
                </tr>

                <tr>
                  <td style="padding:8px 0; color:#6b7280;">Transaction ID</td>
                  <td style="text-align:right;">${txnId || "TXN" + Date.now()}</td>
                </tr>

                <tr>
                  <td style="padding:8px 0; color:#6b7280;">Location</td>
                  <td style="text-align:right;">${location || "N/A"}</td>
                </tr>

                <tr>
                  <td style="padding:8px 0; color:#6b7280;">Time</td>
                  <td style="text-align:right;">${new Date().toLocaleString()}</td>
                </tr>

              </table>

              <!-- INFO BOX -->
              <div style="margin-top:18px; padding:12px; background:#ecfdf5; border-left:4px solid #16a34a; font-size:12px; color:#065f46;">
                This is an automated receipt for your transaction. If you did not authorize this payment, contact support immediately.
              </div>

              <!-- BUTTON -->
              <div style="text-align:center; margin-top:25px;">
                <a href="https://your-support-link.com"
                   style="display:inline-block; background:#2563eb; color:#fff; text-decoration:none;
                          padding:12px 22px; border-radius:6px; font-size:14px; font-weight:bold;">
                  View Support
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f1f5f9; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
              © 2026 SecureGuard Payments · All rights reserved
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
  });
}

// ✅ NEW FUNCTION
const sendWelcomeEmail = async (email, name) => {
  return transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Welcome to Our Platform",
    html: `
      <div style="font-family: Arial; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:20px;">
          
          <h2 style="color:#4CAF50;">Welcome, ${name} 👋</h2>
          
          <p>We're excited to have you on board.</p>

          <div style="background:#f9f9f9; padding:15px; border-radius:8px;">
            <p><b>🚀 What you can do now:</b></p>
            <ul>
              <li>Access your dashboard</li>
              <li>Manage your account</li>
              <li>Explore features</li>
            </ul>
          </div>

          <br>

          <a href="http://localhost:8080"
             style="display:inline-block; padding:10px 15px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
             Go to Dashboard
          </a>

          <p style="margin-top:20px;">Best Regards,<br>Your Team</p>
        </div>
      </div>
    `
  });
};

module.exports = {
  sendBlockEmail,
  sendTransactionReceipt,
  sendWelcomeEmail
};