
const nodemailer = require("nodemailer");

async function sendAlert(subject, message) {
  const transporter = nodemailer.createTransport({
    host: "smtp.example.com",
    port: 587,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: `"Mutual Fund Tracker" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject,
    text: message
  });
}

module.exports = { sendAlert };
