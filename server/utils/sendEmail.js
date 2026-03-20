// ═══════════════════════════════════════════════════════════
//                   SEND EMAIL UTILITY
//              Nodemailer — Gmail / SMTP
// ═══════════════════════════════════════════════════════════
const nodemailer = require("nodemailer");

// ─────────────────────────────────────────
//   Create Transporter
// ─────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,   // Gmail App Password
    },
  });
};

// ═══════════════════════════════════════════════════════════
//   Base Send Email Function
// ═══════════════════════════════════════════════════════════
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from    : `"1000 Din" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html    : html || `<p>${text}</p>`,
      text    : text || "",
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`\x1b[32m[Email] Sent to ${to} → Message ID: ${info.messageId}\x1b[0m`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`\x1b[31m[Email Error] Failed to send to ${to}: ${error.message}\x1b[0m`);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════
//   EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════

// ── Base HTML wrapper
const baseTemplate = (content, title = "1000 Din") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; color: #333; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 26px; letter-spacing: 1px; }
    .header p  { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 4px; }
    .body { padding: 36px 40px; }
    .body h2 { font-size: 20px; color: #1a1a2e; margin-bottom: 12px; }
    .body p  { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 14px; }
    .btn { display: inline-block; margin: 20px 0; padding: 13px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #fff !important; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .info-box { background: #f8f9ff; border-left: 4px solid #4F46E5; padding: 14px 18px; border-radius: 6px; margin: 20px 0; }
    .info-box p { margin: 4px 0; font-size: 14px; color: #444; }
    .info-box strong { color: #4F46E5; }
    .divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
    .footer { background: #f8f9ff; padding: 20px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #888; line-height: 1.6; }
    .footer a { color: #4F46E5; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🚀 1000 Din</h1>
      <p>Building the future, one day at a time</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} 1000 Din. All rights reserved.</p>
      <p>If you didn't request this email, please <a href="#">ignore it</a>.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────
//   Send Password Reset Email
// ─────────────────────────────────────────
const sendPasswordResetEmail = async (user, resetUrl) => {
  const content = `
    <h2>🔐 Reset Your Password</h2>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>You requested to reset your password. Click the button below to set a new password. This link will expire in <strong>30 minutes</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <hr class="divider"/>
    <p style="font-size:13px; color:#999;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="font-size:12px; color:#4F46E5; word-break: break-all;">${resetUrl}</p>
  `;

  return await sendEmail({
    to     : user.email,
    subject: "🔐 Password Reset — 1000 Din",
    html   : baseTemplate(content, "Password Reset"),
  });
};

// ─────────────────────────────────────────
//   Send Welcome Email
// ─────────────────────────────────────────
const sendWelcomeEmail = async (user) => {
  const content = `
    <h2>🎉 Welcome to 1000 Din!</h2>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>We're excited to have you on board! Your account has been created successfully.</p>
    <div class="info-box">
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Joined:</strong> ${new Date().toLocaleDateString("en-BD")}</p>
    </div>
    <p>You can now explore our services, watch YouTube videos, read blogs, and more!</p>
    <a href="${process.env.CLIENT_URL}" class="btn">Visit Website</a>
  `;

  return await sendEmail({
    to     : user.email,
    subject: "🎉 Welcome to 1000 Din!",
    html   : baseTemplate(content, "Welcome"),
  });
};

// ─────────────────────────────────────────
//   Send Order Confirmation Email
// ─────────────────────────────────────────
const sendOrderConfirmationEmail = async (order) => {
  const content = `
    <h2>📦 Order Received!</h2>
    <p>Hi <strong>${order.customerInfo.name}</strong>,</p>
    <p>Your service order has been received successfully. We will review your requirements and get back to you soon!</p>
    <div class="info-box">
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Service:</strong> ${order.service?.title || "—"}</p>
      <p><strong>Status:</strong> Pending Review</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-BD")}</p>
    </div>
    <p>We typically respond within <strong>24 hours</strong>. Keep an eye on your email!</p>
    <a href="${process.env.CLIENT_URL}" class="btn">Visit Website</a>
  `;

  return await sendEmail({
    to     : order.customerInfo.email,
    subject: `📦 Order Confirmed — ${order.orderId} | 1000 Din`,
    html   : baseTemplate(content, "Order Confirmation"),
  });
};

// ─────────────────────────────────────────
//   Send Order Status Update Email
// ─────────────────────────────────────────
const sendOrderStatusEmail = async (order, newStatus, note = "") => {
  const statusEmoji = {
    confirmed  : "✅",
    "in-progress": "🔧",
    review     : "👀",
    completed  : "🎉",
    cancelled  : "❌",
  };

  const emoji = statusEmoji[newStatus] || "📋";

  const content = `
    <h2>${emoji} Order Status Updated</h2>
    <p>Hi <strong>${order.customerInfo.name}</strong>,</p>
    <p>Your order status has been updated.</p>
    <div class="info-box">
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Service:</strong> ${order.service?.title || "—"}</p>
      <p><strong>New Status:</strong> <span style="color:#4F46E5; font-weight:600; text-transform:capitalize;">${newStatus}</span></p>
      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
    </div>
    ${newStatus === "completed"
      ? "<p>🎊 Your project is complete! Thank you for choosing 1000 Din.</p>"
      : "<p>We will keep you updated as your project progresses.</p>"
    }
    <a href="${process.env.CLIENT_URL}" class="btn">View Order</a>
  `;

  return await sendEmail({
    to     : order.customerInfo.email,
    subject: `${emoji} Order Update — ${order.orderId} | 1000 Din`,
    html   : baseTemplate(content, "Order Update"),
  });
};

// ─────────────────────────────────────────
//   Send Admin Notification (New Order)
// ─────────────────────────────────────────
const sendAdminOrderNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const content = `
    <h2>🔔 New Order Received!</h2>
    <p>A new service order has been placed.</p>
    <div class="info-box">
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Customer:</strong> ${order.customerInfo.name}</p>
      <p><strong>Email:</strong> ${order.customerInfo.email}</p>
      <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
      <p><strong>Service:</strong> ${order.service?.title || "—"}</p>
      <p><strong>Budget:</strong> ${order.budget?.amount || 0} ${order.budget?.currency || "BDT"}</p>
    </div>
    <p><strong>Requirements:</strong></p>
    <p style="background:#f0f0f0; padding:12px; border-radius:6px; font-size:14px;">${order.requirements}</p>
    <a href="${process.env.CLIENT_URL}/admin/orders/${order._id}" class="btn">View in Admin Panel</a>
  `;

  return await sendEmail({
    to     : adminEmail,
    subject: `🔔 New Order: ${order.orderId} from ${order.customerInfo.name}`,
    html   : baseTemplate(content, "New Order Notification"),
  });
};

// ═══════════════════════════════════════════════════════════

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendAdminOrderNotification,
};
