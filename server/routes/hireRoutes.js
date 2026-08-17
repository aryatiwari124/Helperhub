const express = require('express');
const router = express.Router();
const { sendHireRequest, getRecruiterRequests, getHelperRequests, respondToRequest, markComplete, getHireRequest } = require('../controllers/hireController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('recruiter'), sendHireRequest);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterRequests);
router.get('/helper', protect, authorize('jobseeker'), getHelperRequests);
router.patch('/:id/respond', protect, authorize('jobseeker'), respondToRequest);
router.patch('/:id/complete', protect, markComplete);
router.get('/:id', protect, getHireRequest);

module.exports = router;
