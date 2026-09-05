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
			auth: {
				user,
				pass
			},
			tls: {
				rejectUnauthorized: false
			},
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
	const htmlContent = ` <!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta name="color-scheme" content="light"> <meta name="supported-color-schemes" content="light"> <title>NIVASHOP Password Reset</title> </head> <body style=" margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased; "> <!-- Main Wrapper --> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 15px;" > <tr> <td align="center"> <!-- Main Card --> <table width="100%" cellpadding="0" cellspacing="0" border="0" style=" max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; " > <!-- Header --> <tr> <td align="center" style=" background-color: #6d28d9; padding: 36px 25px; " > <div style=" font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; "> NIVASHOP </div> <div style=" margin-top: 7px; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #ede9fe; text-transform: uppercase; "> Account Security </div> </td> </tr> <!-- Body --> <tr> <td align="center" style="padding: 40px 30px;" > <!-- Heading --> <div style=" font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px; "> Password Reset </div> <!-- Description --> <div style=" font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 28px; "> We received a request to reset the password for your NIVASHOP account. Use the verification code below to continue. </div> <!-- OTP Box --> <table width="100%" cellpadding="0" cellspacing="0" border="0" style=" background-color: #f5f3ff; border: 2px dashed #8b5cf6; border-radius: 16px; " > <tr> <td align="center" style="padding: 20px 15px;"> <div style=" font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #6d28d9; text-transform: uppercase; margin-bottom: 8px; "> Your Verification Code </div> <div style=" font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #7c3aed; padding-left: 8px; "> ${otpCode} </div> </td> </tr> </table> <!-- Expiry --> <div style=" margin-top: 20px; font-size: 13px; color: #64748b; line-height: 1.6; "> This verification code will expire in <strong style="color: #334155;">10 minutes</strong>. </div> <!-- Security Warning --> <table width="100%" cellpadding="0" cellspacing="0" border="0" style=" margin-top: 25px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; " > <tr> <td style=" padding: 14px 16px; font-size: 12px; line-height: 1.6; color: #92400e; text-align: left; " > <strong>🔒 Security tip</strong><br> If you didn't request a password reset, you can safely ignore this email. Never share this verification code with anyone. </td> </tr> </table> <!-- Support Text --> <div style=" margin-top: 28px; font-size: 12px; line-height: 1.6; color: #94a3b8; "> For your security, NIVASHOP will never ask you to share your verification code. </div> </td> </tr> <!-- Footer --> <tr> <td align="center" style=" background-color: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 22px 25px; " > <div style=" font-size: 12px; color: #64748b; line-height: 1.6; "> &copy; ${new Date().getFullYear()} NIVASHOP. All rights reserved. </div> <div style=" margin-top: 4px; font-size: 11px; color: #94a3b8; "> Custom 3D Printing &amp; Smart IoT Hardware Store </div> </td> </tr> </table> <!-- Bottom spacing --> <div style="height: 20px;"></div> </td> </tr> </table> </body> </html> `;
	const transporter = createTransporter();
	if (transporter) {
		try {
			let fromEmail = (process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@nivashop.in').trim();
			const fromName = process.env.EMAIL_FROM_NAME || 'NIVASHOP';
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
			return {
				success: true,
				messageId: info.messageId
			};
		} catch (err) {
			console.error('❌ Nodemailer SMTP Send Error:', err.message || err);
			return {
				success: false,
				error: err.message || 'SMTP sending failed'
			};
		}
	} else {
		console.log(`\n========================================\n📧 [NODEMAILER SMTP DEMO / LOG MODE]\nRecipient: ${toEmail}\nOTP Code: ${otpCode}\n(Note: Set EMAIL_USER and EMAIL_PASS in .env for live SMTP delivery)\n========================================\n`);
		return {
			success: true,
			demo: true,
			otpCode
		};
	}
};
/**
 * Send Order Status Update Email via Nodemailer SMTP
 */
const sendOrderStatusEmail = async (toEmail, orderDetails) => {
	const {
		orderNumber = 'NIVA-ORDER',
			customerName = 'Customer',
			orderStatus = 'processing',
			trackingNumber = null,
			totalAmount = 0,
			shippingAddress = '',
			items = [],
	} = orderDetails || {};
	const statusKey = (orderStatus || '').toLowerCase();
	let statusConfig = {
		subject: `📦 Order #${orderNumber} Status Updated: ${orderStatus.toUpperCase()}`,
		title: 'Order Status Update',
		badgeBg: '#4f46e5',
		badgeText: '#ffffff',
		icon: '📦',
		headerBg: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
		message: `Your order status has been updated to <strong>${orderStatus.toUpperCase()}</strong>.`,
	};
	if (statusKey === 'shipped') {
		statusConfig = {
			subject: `🚚 Great News! Order #${orderNumber} Has Been Shipped`,
			title: 'Your Order is On Its Way!',
			badgeBg: '#2563eb',
			badgeText: '#ffffff',
			icon: '🚚',
			headerBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
			message: 'Your order has been packaged and handed over to our courier partner.',
		};
	} else if (statusKey === 'delivered') {
		statusConfig = {
			subject: `🎉 Order #${orderNumber} Has Been Delivered!`,
			title: 'Package Delivered!',
			badgeBg: '#059669',
			badgeText: '#ffffff',
			icon: '🎉',
			headerBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
			message: 'Your order has been delivered successfully. We hope you love your product!',
		};
	} else if (statusKey === 'processing') {
		statusConfig = {
			subject: `⚙️ Order #${orderNumber} is Being Processed & Printed`,
			title: 'In Production',
			badgeBg: '#7c3aed',
			badgeText: '#ffffff',
			icon: '⚙️',
			headerBg: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
			message: 'Our engineers are currently processing and custom printing your order.',
		};
	} else if (statusKey === 'confirmed') {
		statusConfig = {
			subject: `✅ Order #${orderNumber} Confirmed!`,
			title: 'Order Confirmed',
			badgeBg: '#16a34a',
			badgeText: '#ffffff',
			icon: '✅',
			headerBg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
			message: 'We have received and confirmed your order details.',
		};
	} else if (statusKey === 'cancelled') {
		statusConfig = {
			subject: `❌ Order #${orderNumber} Has Been Cancelled`,
			title: 'Order Cancelled',
			badgeBg: '#dc2626',
			badgeText: '#ffffff',
			icon: '❌',
			headerBg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
			message: 'Your order has been cancelled. If you have questions, please reach out to support.',
		};
	}
	const itemsListHtml = Array.isArray(items) && items.length > 0 ? items.map(item => `
			<tr style="border-bottom: 1px solid #f1f5f9;">
				<td style="padding: 10px 0; color: #334155; font-size: 13px;">
					<strong>${item.productName || item.name || 'Product'}</strong> (x${item.quantity || 1})
				</td>
				<td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">
					₹${Number(item.totalPrice || item.unitPrice * item.quantity || item.price || 0).toLocaleString()}
				</td>
			</tr>
		`).join('') : `
			<tr style="border-bottom: 1px solid #f1f5f9;">
				<td style="padding: 10px 0; color: #334155; font-size: 13px;">Order Items</td>
				<td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">₹${Number(totalAmount).toLocaleString()}</td>
			</tr>
		`;
	const trackingHtml = trackingNumber ? `
		<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin-top: 20px;">
			<tr>
				<td style="padding: 16px; text-align: center;">
					<div style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Logistics & Tracking</div>
					<div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">Tracking No: <span style="font-family: monospace; letter-spacing: 1px;">${trackingNumber}</span></div>
				</td>
			</tr>
		</table>
	` : '';
	const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${statusConfig.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
	<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 30px 15px;">
		<tr>
			<td align="center">
				<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
					
					<!-- Header -->
					<tr>
						<td align="center" style="background: ${statusConfig.headerBg}; padding: 32px 25px; color: #ffffff;">
							<div style="font-size: 24px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; color: #ffffff;">NIVASHOP</div>
							<div style="margin-top: 6px; font-size: 11px; font-weight: 700; letter-spacing: 2px; opacity: 0.9; text-transform: uppercase; color: #ffffff;">Order Status Notification</div>
						</td>
					</tr>

					<!-- Content Body -->
					<tr>
						<td style="padding: 32px 28px;">
							<div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
								Hi ${customerName},
							</div>
							<div style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
								${statusConfig.message}
							</div>

							<!-- Status Pill -->
							<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
								<tr>
									<td align="center">
										<div style="display: inline-block; background-color: ${statusConfig.badgeBg}; color: ${statusConfig.badgeText}; padding: 10px 24px; border-radius: 9999px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
											${statusConfig.icon} STATUS: ${orderStatus.toUpperCase()}
										</div>
									</td>
								</tr>
							</table>

							${trackingHtml}

							<!-- Order Summary Table -->
							<div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
								Order Details (#${orderNumber})
							</div>

							<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
								${itemsListHtml}
								<tr>
									<td style="padding: 12px 0; font-weight: 800; color: #0f172a; font-size: 14px;">Total Amount</td>
									<td style="padding: 12px 0; text-align: right; font-weight: 900; font-size: 16px; color: #7c3aed;">
										₹${Number(totalAmount).toLocaleString()}
									</td>
								</tr>
							</table>

							${shippingAddress ? `
							<!-- Address -->
							<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px;">
								<tr>
									<td style="padding: 14px 16px; font-size: 12px; color: #475569; line-height: 1.5;">
										<strong style="color: #0f172a;">Shipping Address:</strong><br>
										${shippingAddress}
									</td>
								</tr>
							</table>
							` : ''}

						</td>
					</tr>

					<!-- Footer -->
					<tr>
						<td align="center" style="background-color: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 20px 25px;">
							<div style="font-size: 12px; color: #64748b;">
								&copy; ${new Date().getFullYear()} NIVASHOP. All rights reserved.
							</div>
							<div style="margin-top: 4px; font-size: 11px; color: #94a3b8;">
								Custom 3D Printing &amp; Smart IoT Hardware Store
							</div>
						</td>
					</tr>

				</table>
			</td>
		</tr>
	</table>
</body>
</html>
	`;
	const transporter = createTransporter();
	if (transporter) {
		try {
			let fromEmail = (process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@nivashop.in').trim();
			const fromName = process.env.EMAIL_FROM_NAME || 'NIVASHOP';
			let fromHeader = fromEmail.includes('<') ? fromEmail : `"${fromName}" <${fromEmail}>`;
			const info = await transporter.sendMail({
				from: fromHeader,
				to: toEmail,
				subject: statusConfig.subject,
				html: htmlContent,
			});
			console.log(`\n========================================\n📧 [ORDER STATUS EMAIL SENT SUCCESS]\nMessage ID: ${info.messageId}\nRecipient: ${toEmail}\nOrder: ${orderNumber}\nStatus: ${orderStatus}\n========================================\n`);
			return {
				success: true,
				messageId: info.messageId
			};
		} catch (err) {
			console.error('❌ Nodemailer Order Status Email Error:', err.message || err);
			return {
				success: false,
				error: err.message || 'SMTP sending failed'
			};
		}
	} else {
		console.log(`\n========================================\n📧 [DEMO MODE - ORDER STATUS EMAIL LOGGED]\nRecipient: ${toEmail}\nOrder: ${orderNumber}\nStatus: ${orderStatus}\n========================================\n`);
		return {
			success: true,
			demo: true
		};
	}
};
module.exports = {
	sendOtpEmail,
	sendOrderStatusEmail,
};
