require('dotenv').config();
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : null;
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '').trim() : null;

  if (user && pass) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465', 10),
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  return null;
};

/**
 * Send OTP Password Reset Email via Nodemailer
 */
const sendOtpEmail = async (toEmail, otpCode) => {
  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset OTP - NIVASHOP.IN</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; color: #1f2937; margin: 0; padding: 0; }
        .container { max-width: 550px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 35px 30px; text-align: center; }
        .otp-box { display: inline-block; background-color: #f5f3ff; border: 2px dashed #8b5cf6; border-radius: 16px; padding: 15px 30px; margin: 25px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #7c3aed; margin: 0; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NIVASHOP.IN</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">SECURITY VERIFICATION</p>
        </div>
        <div class="content">
          <h2 style="font-size: 20px; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            We received a request to reset the password for your account linked to <strong>${toEmail}</strong>.
          </p>
          <div class="otp-box">
            <p className="otp-code" style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #7c3aed; margin: 0;">${otpCode}</p>
          </div>
          <p style="font-size: 12px; color: #9ca3af;">
            This 6-digit OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} NIVASHOP.IN. All rights reserved. Custom 3D Printing &amp; Smart IoT Hardware.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'NIVASHOP Security'}" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `🔑 Your 6-Digit Password Reset OTP - NIVASHOP.IN`,
        html: htmlContent,
      });

      console.log(`\n========================================\n📧 [NODEMAILER EMAIL SENT SUCCESS]\nMessage ID: ${info.messageId}\nRecipient: ${toEmail}\n========================================\n`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('❌ Nodemailer Send Error:', err);
      // Fallback console log if send fails
      return { success: false, error: err.message };
    }
  } else {
    console.log(`\n========================================\n📧 [NODEMAILER DEMO MODE]\n(Set EMAIL_USER & EMAIL_PASS in backend .env to send real emails to inbox!)\nRecipient: ${toEmail}\nOTP Code: ${otpCode}\n========================================\n`);
    return { success: true, demo: true };
  }
};

module.exports = { sendOtpEmail };
