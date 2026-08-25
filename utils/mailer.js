require('dotenv').config();
const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const resendApiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : null;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Create reusable transporter fallback
const createTransporter = () => {
  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : null;
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '').trim() : null;

  if (user && pass) {
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const isSecure = port === 465;

    return nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
    });
  }

  return null;
};

/**
 * Send OTP Password Reset Email via Resend API or Nodemailer SMTP
 */
const sendOtpEmail = async (toEmail, otpCode) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset OTP - NIVASHOP</title>
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
          <h1>NIVASHOP</h1>
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
          &copy; ${new Date().getFullYear()} NIVASHOP. All rights reserved. Custom 3D Printing &amp; Smart IoT Hardware.
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Try Resend API first if configured
  if (resend) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const data = await resend.emails.send({
        from: `NIVASHOP Security <${fromEmail}>`,
        to: [toEmail],
        subject: `🔑 Your 6-Digit Password Reset OTP - NIVASHOP`,
        html: htmlContent,
      });

      if (data && data.error) {
        console.error('❌ Resend API Error:', data.error);
      } else {
        console.log(`\n========================================\n🚀 [RESEND API EMAIL SENT SUCCESS]\nMessage ID: ${data?.id || 'OK'}\nRecipient: ${toEmail}\n========================================\n`);
        return { success: true, messageId: data?.id };
      }
    } catch (resendErr) {
      console.error('❌ Resend API Exception:', resendErr.message || resendErr);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  const transporter = createTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'NIVASHOP Security'}" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `🔑 Your 6-Digit Password Reset OTP - NIVASHOP`,
        html: htmlContent,
      });

      console.log(`\n========================================\n📧 [NODEMAILER EMAIL SENT SUCCESS]\nMessage ID: ${info.messageId}\nRecipient: ${toEmail}\n========================================\n`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('❌ Nodemailer Send Error:', err);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`\n========================================\n📧 [DEMO MODE]\nRecipient: ${toEmail}\nOTP Code: ${otpCode}\n========================================\n`);
    return { success: true, demo: true };
  }
};

module.exports = { sendOtpEmail };
