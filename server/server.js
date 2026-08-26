require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { getConfig, validateEnvironment } = require('./config/env');
const requestId = require('./middleware/requestId');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
const jobPostRoutes = require('./routes/jobPostRoutes');
const hireRoutes = require('./routes/hireRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const estimateRoutes = require('./routes/estimateRoutes');

const app = express();

validateEnvironment();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    // Fallback: allow for seamless deployment
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

const mongoose = require('mongoose');
const path = require('path');

// DB readiness check middleware
app.use('/api/v1', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is initializing/connecting, please retry in a few moments...',
    });
  }
  next();
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'HelperHub API is running 🚀', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobseeker', jobSeekerRoutes);
app.use('/api/v1/jobpost', jobPostRoutes);
app.use('/api/v1/hire', hireRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/estimate', estimateRoutes);

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.statusCode ? err.message : 'Internal server error',
    requestId: req.requestId,
  });
});

const PORT = getConfig().port;
app.listen(PORT, () => {
  console.log(`\n🚀 HelperHub Server running on http://localhost:${PORT}`);
  console.log(`📋 API Health: http://localhost:${PORT}/api/v1/health\n`);
});
