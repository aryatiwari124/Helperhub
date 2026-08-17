const express = require('express');
const router = express.Router();
const { createJobPost, getOpenJobs, getMyJobs, getJobPost, updateJobStatus, deleteJobPost } = require('../controllers/jobPostController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getOpenJobs);
router.get('/my', protect, authorize('recruiter'), getMyJobs);
router.post('/', protect, authorize('recruiter'), createJobPost);
router.get('/:id', getJobPost);
router.patch('/:id/status', protect, authorize('recruiter'), updateJobStatus);
router.delete('/:id', protect, authorize('recruiter'), deleteJobPost);

module.exports = router;
