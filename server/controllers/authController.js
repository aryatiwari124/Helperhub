const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOtpEmail } = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc  Signup with email/password + OTP
// @route POST /api/v1/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!['recruiter', 'jobseeker'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    // Create unverified user
    const user = await User.create({ name, email, password, role, authProvider: 'local', isVerified: false });

    // Generate & save OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await OTP.deleteMany({ email }); // clear old OTPs
    await OTP.create({ email, otp, expiresAt });

    // Send OTP email (or log to console in dev)
    const emailResult = await sendOtpEmail(email, otp);

    if (!emailResult.success && !emailResult.dev) {
      await User.findByIdAndDelete(user._id);
      await OTP.deleteMany({ email });
      return res.status(502).json({ success: false, message: 'Failed to send verification email. Please try again later.' });
    }

    const isDev = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com' || emailResult?.dev;

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email with the OTP sent.',
      userId: user._id,
      ...(isDev ? { devOtp: otp, note: 'Development mode: OTP displayed on screen and in server console.' } : {}),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Verify OTP
// @route POST /api/v1/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }
    await OTP.deleteMany({ email });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic },
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Resend OTP
// @route POST /api/v1/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });
    const emailResult = await sendOtpEmail(email, otp);
    const isDev = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com' || emailResult?.dev;

    res.json({
      success: true,
      message: 'New OTP sent to your email',
      ...(isDev ? { devOtp: otp } : {}),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Login with email/password
// @route POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.authProvider === 'google') {
      return res.status(400).json({ success: false, message: 'Please use Google Sign-In for this account' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Google OAuth login/signup
// @route POST /api/v1/auth/google
const googleAuth = async (req, res) => {
  try {
    const { token: googleToken, role } = req.body;

    if (!googleToken) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    let payload;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    // Cryptographic verification with google-auth-library
    if (!clientId || clientId === 'your_google_client_id') {
      return res.status(503).json({ success: false, message: 'Google authentication is not configured on this server.' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: clientId,
    });
    payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Could not extract valid user profile from Google token' });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || payload.email.split('@')[0];
    const picture = payload.picture || '';

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      if (!role || !['recruiter', 'jobseeker'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Role is required for new Google users' });
      }
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        role,
        profilePic: picture,
        isVerified: true,
      });
    } else if (!user.googleId) {
      // Link Google ID to existing verified account
      user.googleId = googleId;
      user.authProvider = 'google';
      if (picture && !user.profilePic) user.profilePic = picture;
      await user.save();
    }

    const jwtToken = generateToken(user._id);
    res.json({
      success: true,
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic },
    });
  } catch (error) {
    console.error('Google auth verification error:', error);
    res.status(401).json({ success: false, message: 'Google token verification failed: ' + error.message });
  }
};

// @desc  Get current logged-in user
// @route GET /api/v1/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { signup, verifyOTP, resendOTP, login, googleAuth, getMe };
