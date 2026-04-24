const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"PollPulse 🗳️" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your PollPulse Email Verification OTP',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #06b6d4, #6366f1); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">PollPulse</h1>
          <p style="margin: 5px 0 0; opacity: 0.85; font-size: 14px;">Email Verification</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #94a3b8; margin-top: 0;">Hello! 👋 Use the OTP below to verify your email and complete registration.</p>
          <div style="background: #1e293b; border: 2px solid #06b6d4; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
            <h2 style="color: #06b6d4; font-size: 42px; letter-spacing: 12px; margin: 0; font-family: monospace;">${otp}</h2>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">⏰ This OTP is valid for <strong style="color:#fff;">5 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #1e293b; padding: 15px; text-align: center;">
          <p style="color: #475569; font-size: 11px; margin: 0;">© 2026 PollPulse — All Rights Reserved</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
