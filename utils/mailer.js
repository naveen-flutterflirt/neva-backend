require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Create reusable Nodemailer SMTP Transporter
 */
const createTransporter = () => {
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);

  if (user && pass) {
    const isSecure = port === 465 || process.env.EMAIL_SECURE === 'true';

    return nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  return null;
};

/**
 * Send OTP Password Reset Email via Nodemailer SMTP (Pure Professional Setup)
 */
const sendOtpEmail = async (toEmail, otpCode) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP - NIVASHOP</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
        .main-card { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
        .header-logo { font-size: 26px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin: 0; }
        .header-subtitle { margin: 6px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2.5px; opacity: 0.9; text-transform: uppercase; }
        .body-content { padding: 40px 32px; text-align: center; }
        .heading { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; }
        .text { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; }
        .otp-container { background: #f5f3ff; border: 2px dashed #8b5cf6; border-radius: 18px; padding: 20px 24px; margin: 24px 0; display: inline-block; width: 80%; }
        .otp-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6d28d9; margin-bottom: 6px; }
        .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #7c3aed; margin: 0; padding-left: 10px; }
        .warning-box { background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px 16px; margin-top: 24px; text-align: left; font-size: 12px; color: #92400e; line-height: 1.5; }
        .footer { background-color: #f1f5f9; padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main-card">
          <div class="header">
            <h1 class="header-logo">NIVASHOP</h1>
            <p class="header-subtitle">Account Security & Password Reset</p>
          </div>
          <div class="body-content">
            <h2 class="heading">Verification Code</h2>
            <p class="text">
              We received a request to reset the password for your NIVASHOP account (<strong>${toEmail}</strong>). Use the 6-digit OTP code below to proceed:
            </p>

            <div class="otp-container">
              <div class="otp-label">Your 6-Digit OTP Code</div>
              <div class="otp-code">${otpCode}</div>
            </div>

            <p class="text" style="font-size: 13px; color: #64748b; margin-top: 16px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>

            <div class="warning-box">
              <strong>🔒 Security Tip:</strong> If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized activity.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} NIVASHOP Inc. All rights reserved.<br>
            Custom 3D Printing &amp; Smart IoT Hardware Store.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (transporter) {
    try {
      let fromEmail = (process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@nivashop.in').trim();
      const fromName = process.env.EMAIL_FROM_NAME || 'NIVASHOP Security';

      let fromHeader = '';
      if (fromEmail.includes('<') && fromEmail.includes('>')) {
        fromHeader = fromEmail;
      } else {
        fromHeader = `"${fromName}" <${fromEmail}>`;
      }

      const info = await transporter.sendMail({
        from: fromHeader,
        to: toEmail,
        subject: `🔑 ${otpCode} is your NIVASHOP Password Reset Code`,
        html: htmlContent,
      });

      console.log(`\n========================================\n📧 [NODEMAILER SMTP EMAIL SENT SUCCESS]\nMessage ID: ${info.messageId}\nRecipient: ${toEmail}\nOTP Code: ${otpCode}\n========================================\n`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('❌ Nodemailer SMTP Send Error:', err.message || err);
      return { success: false, error: err.message || 'SMTP sending failed' };
    }
  } else {
    console.log(`\n========================================\n📧 [NODEMAILER SMTP DEMO / LOG MODE]\nRecipient: ${toEmail}\nOTP Code: ${otpCode}\n(Note: Set EMAIL_USER and EMAIL_PASS in .env for live SMTP delivery)\n========================================\n`);
    return { success: true, demo: true, otpCode };
  }
};

module.exports = { sendOtpEmail };
