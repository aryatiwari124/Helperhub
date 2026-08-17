const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    // If email credentials not configured, log OTP to console (development fallback)
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
      console.log(`\n📧 [DEV MODE] Email to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html.replace(/<[^>]*>/g, '')}\n`);
      return { success: true, dev: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"HelperHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendOtpEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #003d9b; font-size: 28px; margin: 0;">HelperHub</h1>
        <p style="color: #434654; margin: 8px 0 0;">Your trusted service marketplace</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e1e2e4;">
        <h2 style="color: #191c1e; font-size: 20px; margin: 0 0 16px;">Email Verification</h2>
        <p style="color: #434654; margin: 0 0 24px;">Use the code below to verify your email address. This code expires in 5 minutes.</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #003d9b;">${otp}</span>
        </div>
        <p style="color: #737685; font-size: 14px; margin: 0;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail(email, 'HelperHub - Your OTP Verification Code', html);
};

module.exports = { sendEmail, sendOtpEmail };
