const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');

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
      const existingUser = await userRepository.findByEmail(
        normalizedEmail
      );

      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this email address already exists.',
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
}

module.exports = new AuthController();