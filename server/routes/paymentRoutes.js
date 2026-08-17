const express = require('express');
const router = express.Router();
const { createCheckout, confirmPayment, releasePayment, getPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkout', protect, authorize('recruiter'), createCheckout);
router.patch('/:hireRequestId/confirm', protect, confirmPayment);
router.patch('/:hireRequestId/release', protect, releasePayment);
router.get('/:hireRequestId', protect, getPayment);

module.exports = router;
