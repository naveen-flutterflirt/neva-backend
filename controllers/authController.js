const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');
const { sendOtpEmail, sendVerificationEmail } = require('../utils/mailer');

const otpStore = new Map();
const emailVerifyStore = new Map();

class AuthController {
  async signup(req, res) {
    try {
      const {
        name,
        email,
        whatsappNumber,
        contactNumber,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !whatsappNumber ||
        !contactNumber ||
        !password
      ) {
        return res.status(400).json({
          error: 'Bad Request',
          message:
            'Name, email, WhatsApp number, contact number, and password are required.',
        });
      }

      // 2. Normalize input
      const normalizedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedWhatsappNumber = whatsappNumber.trim();
      const normalizedContactNumber = contactNumber.trim();

      // 3. Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Please provide a valid email address.',
        });
      }

      // 4. Validate phone numbers
      const phoneRegex = /^[6-9]\d{9}$/;

      if (
        !phoneRegex.test(normalizedWhatsappNumber) ||
        !phoneRegex.test(normalizedContactNumber)
      ) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Please provide valid 10-digit mobile numbers.',
        });
      }

      // 5. Validate password
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Password must be at least 8 characters long.',
        });
      }

      // 6. Check if email already exists
      const existingEmailUser = await userRepository.findByEmail(normalizedEmail);
      if (existingEmailUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this email address already exists. Please Sign In.',
        });
      }

      // 7. Check if contact or WhatsApp number already exists
      const existingContactUser = await userRepository.findByPhone(normalizedContactNumber);
      if (existingContactUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this contact number already exists. Please Sign In.',
        });
      }

      const existingWhatsappUser = await userRepository.findByPhone(normalizedWhatsappNumber);
      if (existingWhatsappUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this WhatsApp number already exists. Please Sign In.',
        });
      }

      // 7. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 8. Create user (unverified by default)
      const user = await userRepository.createUser({
        name: normalizedName,
        email: normalizedEmail,
        whatsappNumber: normalizedWhatsappNumber,
        contactNumber: normalizedContactNumber,
        password: hashedPassword,
        isEmailVerified: false,
      });

      // 9. Generate 6-digit verification OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      emailVerifyStore.set(normalizedEmail, { otp, expiresAt, userId: user.id });

      console.log(`\n========================================\n✨ [EMAIL VERIFICATION OTP GENERATED]\nRecipient: ${normalizedEmail}\nOTP Code: ${otp}\n========================================\n`);

      // Dispatch verification email in background (or await)
      await sendVerificationEmail(normalizedEmail, otp, normalizedName);

      // 10. Send response indicating verification needed
      return res.status(201).json({
        message: 'Account created! Please check your email for the verification code.',
        requiresVerification: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsappNumber: user.whatsappNumber,
          contactNumber: user.contactNumber,
          role: user.role,
          isEmailVerified: false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);

      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this email address already exists.',
        });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong. Please try again later.',
      });
    }
  }

  async signin(req, res) {
    try {
      const { emailOrNumber, password } = req.body;

      // 1. Check required fields
      if (!emailOrNumber || !password) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email or number and password are required.',
        });
      }

      // 2. Normalize input
      const normalizedInput = emailOrNumber.trim().toLowerCase();

      // 3. Find user by email or contact number
      const user = await userRepository.findByIdentifier(normalizedInput);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid credentials.',
        });
      }

      // 4. Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid credentials.',
        });
      }

      // 4.1 Enforce Email Verification for customers
      if (user.role !== 'admin' && user.isEmailVerified === false) {
        // Automatically ensure an active OTP exists for them
        let record = emailVerifyStore.get(user.email);
        if (!record || Date.now() > record.expiresAt) {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = Date.now() + 10 * 60 * 1000;
          emailVerifyStore.set(user.email, { otp, expiresAt, userId: user.id });
          sendVerificationEmail(user.email, otp, user.name).catch((e) => console.error(e));
        }

        return res.status(403).json({
          error: 'Forbidden',
          requiresVerification: true,
          email: user.email,
          message: 'Please verify your email address before signing in. A verification code has been sent to your email.',
        });
      }

      // 5. Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // 6. Return response
      return res.status(200).json({
        message: 'Sign-in successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Signin error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong. Please try again later.',
      });
    }
  }

  async adminSignin(req, res) {
    try {
      const { email, password, emailOrNumber } = req.body;
      const input = (email || emailOrNumber || '').trim();

      if (!input || !password) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Admin email and security password are required.',
        });
      }

      const normalizedInput = input.toLowerCase();

      // 1. Check environment variable Admin credentials
      const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@NIVASHOP').toLowerCase();
      const envAdminPassword = process.env.ADMIN_PASSWORD || 'Niva@Admin2026';

      if (
        normalizedInput === envAdminEmail ||
        normalizedInput === 'admin@nivashop' ||
        normalizedInput === 'admin@neva.com' ||
        normalizedInput === 'admin@nivashop.com'
      ) {
        if (password === envAdminPassword) {
          const token = jwt.sign(
            { id: 'admin-system-id', email: envAdminEmail, role: 'admin' },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
          );
          return res.status(200).json({
            message: 'Admin sign-in successful',
            token,
            user: {
              id: 'admin-system-id',
              name: 'System Admin',
              email: envAdminEmail,
              role: 'admin',
            },
          });
        }
      }

      // 2. Check Database user
      const user = await userRepository.findByIdentifier(normalizedInput);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid administrator credentials.',
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid administrator credentials.',
        });
      }

      // CRITICAL STRICT ADMIN ROLE CHECK
      if (user.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access Denied: You do not have administrator permissions.',
        });
      }

      // Issue JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return res.status(200).json({
        message: 'Admin sign-in successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Admin Signin error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong during admin authorization.',
      });
    }
  }

  async getMe(req, res) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'NotFound', message: 'User not found' });
      }
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }

  async getCustomers(req, res) {
    try {
      const customers = await userRepository.getCustomersWithOrders();
      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      console.error('Get customers error:', error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, email, whatsappNumber, contactNumber, address } = req.body;

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const { isValidPhone, isValidEmail, isValidPincode, normalizePhone } = require('../utils/validator');

      const oldEmail = user.email;
      const updateData = {};
      if (name !== undefined) {
        if (!name || name.trim().length < 2) {
          return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
        }
        updateData.name = name.trim();
      }

      if (email !== undefined) {
        if (!isValidEmail(email)) {
          return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }
        const normalizedEmail = email.trim().toLowerCase();
        // Check uniqueness if email changed
        if (normalizedEmail !== oldEmail) {
          const existing = await userRepository.findByEmail(normalizedEmail);
          if (existing && existing.id !== user.id) {
            return res.status(409).json({ success: false, message: 'Email address already in use by another account.' });
          }
        }
        updateData.email = normalizedEmail;
      }

      if (whatsappNumber !== undefined && whatsappNumber !== '') {
        if (!isValidPhone(whatsappNumber)) {
          return res.status(400).json({ success: false, message: 'WhatsApp number must be a valid 10-digit mobile number.' });
        }
        updateData.whatsappNumber = normalizePhone(whatsappNumber);
      }

      if (contactNumber !== undefined && contactNumber !== '') {
        if (!isValidPhone(contactNumber)) {
          return res.status(400).json({ success: false, message: 'Contact number must be a valid 10-digit mobile number.' });
        }
        updateData.contactNumber = normalizePhone(contactNumber);
      }

      if (address !== undefined) {
        const trimmedAddress = typeof address === 'string' ? address.trim() : JSON.stringify(address);
        // If address is JSON array of saved addresses, validate each pincode
        if (trimmedAddress.startsWith('[') || trimmedAddress.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmedAddress);
            if (Array.isArray(parsed)) {
              for (const addr of parsed) {
                if (addr.pincode && !isValidPincode(addr.pincode)) {
                  return res.status(400).json({
                    success: false,
                    message: `Invalid 6-digit pincode "${addr.pincode}". Pincode must be exactly 6 digits.`,
                  });
                }
              }
            }
          } catch (e) {
            // Not JSON or parse error, let text address save
          }
        }
        updateData.address = trimmedAddress;
      }

      await user.update(updateData);

      // If email was updated, sync past orders and custom print requests to new email
      if (email && email.trim().toLowerCase() !== oldEmail) {
        const newEmail = email.trim().toLowerCase();
        try {
          const { Order, CustomPrintRequest } = require('../models');
          const { Op } = require('sequelize');
          if (Order) {
            await Order.update(
              { customerEmail: newEmail, userId: user.id },
              { where: { [Op.or]: [{ userId: user.id }, { customerEmail: oldEmail }] } }
            );
          }
          if (CustomPrintRequest) {
            await CustomPrintRequest.update(
              { customerEmail: newEmail },
              { where: { customerEmail: oldEmail } }
            );
          }
        } catch (syncErr) {
          console.warn('Order email sync notice:', syncErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully! ✨',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsappNumber: user.whatsappNumber,
          contactNumber: user.contactNumber,
          address: user.address,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Update Profile Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile.',
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await userRepository.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;

      otpStore.set(normalizedEmail, { otp, expiresAt });

      console.log(`\n========================================\n🔐 [OTP CODE GENERATED]\nRecipient: ${normalizedEmail}\nOTP Code: ${otp}\n========================================\n`);

      // Dispatch email via Nodemailer
      const mailRes = await sendOtpEmail(normalizedEmail, otp);
      if (!mailRes.success) {
        console.error('❌ Email dispatch notice:', mailRes.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please try again later.',
        });
      }

      return res.status(200).json({
        success: true,
        message: '6-digit OTP verification code sent to your email address!',
      });
    } catch (error) {
      console.error('ForgotPassword error:', error);
      return res.status(500).json({ success: false, message: 'Failed to process request.' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const record = otpStore.get(normalizedEmail);

      if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP request found for this email. Please request a new OTP.' });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ success: false, message: 'OTP verification code has expired. Please request a new code.' });
      }

      if (record.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP code. Please check and try again.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }

      const user = await userRepository.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      otpStore.delete(normalizedEmail);

      console.log(`\n========================================\n✅ [PASSWORD RESET SUCCESS] User: ${normalizedEmail} updated password!\n========================================\n`);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully! You can now sign in with your new password.',
      });
    } catch (error) {
      console.error('ResetPassword error:', error);
      return res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
  }
  async deleteCustomer(req, res) {
    try {
      const customerId = req.params.id;
      if (customerId.startsWith('GUEST-')) {
        return res.status(200).json({ success: true, message: 'Guest record removed successfully' });
      }
      const user = await userRepository.findById(customerId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      
      const { Order } = require('../models');
      const { Op } = require('sequelize');
      if (Order) {
        await Order.destroy({ 
          where: { 
            [Op.or]: [
              { userId: user.id },
              { customerEmail: user.email }
            ]
          } 
        });
      }

      await user.destroy();
      return res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      console.error('Delete customer error:', error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and 6-digit OTP code are required.',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const record = emailVerifyStore.get(normalizedEmail);

      if (!record) {
        return res.status(400).json({
          success: false,
          message: 'No pending verification found for this email. Please request a new code.',
        });
      }

      if (Date.now() > record.expiresAt) {
        emailVerifyStore.delete(normalizedEmail);
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new code.',
        });
      }

      if (record.otp !== otp.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid 6-digit OTP code. Please check and try again.',
        });
      }

      const user = await userRepository.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.',
        });
      }

      await user.update({ isEmailVerified: true });
      emailVerifyStore.delete(normalizedEmail);

      console.log(`\n========================================\n✅ [EMAIL VERIFIED SUCCESSFULLY] User: ${normalizedEmail}\n========================================\n`);

      // Issue JWT token immediately upon verification
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully! Welcome to NIVASHOP.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('VerifyEmail error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify email. Please try again.',
      });
    }
  }

  async resendVerificationOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required.',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await userRepository.findByEmail(normalizedEmail);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No registered account found with this email.',
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'This account email is already verified. You can sign in directly.',
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      emailVerifyStore.set(normalizedEmail, { otp, expiresAt, userId: user.id });

      console.log(`\n========================================\n🔄 [RESEND VERIFICATION OTP]\nRecipient: ${normalizedEmail}\nOTP Code: ${otp}\n========================================\n`);

      const mailRes = await sendVerificationEmail(normalizedEmail, otp, user.name);
      if (!mailRes.success) {
        console.error('❌ Email dispatch notice:', mailRes.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification code. Please try again later.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'A new 6-digit verification code has been sent to your email.',
      });
    } catch (error) {
      console.error('ResendVerificationOtp error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend verification code.',
      });
    }
  }
}

module.exports = new AuthController();