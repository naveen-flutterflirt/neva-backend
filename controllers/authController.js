const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');
const { sendOtpEmail } = require('../utils/mailer');

const otpStore = new Map();

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

      // 8. Create user
      const user = await userRepository.createUser({
        name: normalizedName,
        email: normalizedEmail,
        whatsappNumber: normalizedWhatsappNumber,
        contactNumber: normalizedContactNumber,
        password: hashedPassword,
      });

      // 9. Send response without password
      return res.status(201).json({
        message: 'User registered successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsappNumber: user.whatsappNumber,
          contactNumber: user.contactNumber,
          role: user.role,
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

      const oldEmail = user.email;
      const updateData = {};
      if (name) updateData.name = name.trim();
      if (email) updateData.email = email.trim().toLowerCase();
      if (whatsappNumber) updateData.whatsappNumber = whatsappNumber.trim();
      if (contactNumber) updateData.contactNumber = contactNumber.trim();
      if (address !== undefined) updateData.address = address.trim();

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
}

module.exports = new AuthController();