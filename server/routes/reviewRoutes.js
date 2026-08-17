const express = require('express');
const router = express.Router();
const { submitReview, getHelperReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitReview);
router.get('/:helperId', getHelperReviews);

module.exports = router;
