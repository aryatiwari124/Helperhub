const express = require('express');
const router = express.Router();
const { upsertProfile, getMyProfile, searchHelpers, getHelperProfile, getAllHelpers } = require('../controllers/jobSeekerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/search', searchHelpers);
router.get('/all', getAllHelpers);
router.get('/profile/me', protect, authorize('jobseeker'), getMyProfile);
router.put('/profile', protect, authorize('jobseeker'), upsertProfile);
router.get('/:userId', getHelperProfile);

module.exports = router;
