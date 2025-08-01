const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your OTP for Password Reset",
    html: ` <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    <p>Hi,</p>
    <p>Your One-Time Password (OTP) for resetting your password is:</p>
    <p style="font-size: 20px; font-weight: bold; color: #2c3e50;">${otp}</p>
    <p>This code is valid for <strong>5 minutes</strong>.</p>
    <p>If you didn’t request a password reset, please ignore this message or contact support.</p>
    <br/>
    <p>Thanks,<br/>The 2xsmart  Team</p>
  </div>`,
  });
};

module.exports = { sendOTPEmail };
