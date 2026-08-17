const express = require('express');
const router = express.Router();
const { getCostEstimate } = require('../controllers/estimateController');

// POST /api/v1/estimate
// Body: { serviceType, jobDescription, city }
router.post('/', getCostEstimate);

module.exports = router;
