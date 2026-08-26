const express = require('express');
const router = express.Router();
const { getCostEstimate } = require('../controllers/estimateController');
const asyncHandler = require('../middleware/asyncHandler');
const requestId = require('../middleware/requestId');
const { createRateLimit } = require('../middleware/rateLimit');

// POST /api/v1/estimate
// Body: { serviceType, jobDescription, city }
router.post('/', requestId, createRateLimit({ windowMs: 60_000, max: 10 }), asyncHandler(getCostEstimate));

module.exports = router;
