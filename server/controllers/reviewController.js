const Review = require('../models/Review');
const HireRequest = require('../models/HireRequest');
const JobSeekerProfile = require('../models/JobSeekerProfile');

// @desc  Submit a review
// @route POST /api/v1/review
const submitReview = async (req, res) => {
  try {
    const { hireRequestId, rating, comment } = req.body;

    const hireRequest = await HireRequest.findById(hireRequestId);
    if (!hireRequest) return res.status(404).json({ success: false, message: 'Hire request not found' });
    if (hireRequest.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Job must be completed before reviewing' });
    }

    const isRecruiter = hireRequest.recruiterId.toString() === req.user.id;
    const isHelper = hireRequest.helperId.toString() === req.user.id;

    if (!isRecruiter && !isHelper && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You were not a participant in this job' });
    }

    const targetRevieweeId = req.body.revieweeId || (isRecruiter ? hireRequest.helperId : hireRequest.recruiterId);

    const existing = await Review.findOne({ hireRequestId, reviewerId: req.user.id });
    if (existing) return res.status(409).json({ success: false, message: 'You already reviewed this job' });

    const review = await Review.create({
      hireRequestId,
      reviewerId: req.user.id,
      revieweeId: targetRevieweeId,
      rating: Number(rating) || 5,
      comment,
    });

    // Update hire request status
    await HireRequest.findByIdAndUpdate(hireRequestId, { status: 'rated' });

    // Recalculate helper's average rating if reviewee is helper
    const reviews = await Review.find({ revieweeId: targetRevieweeId });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await JobSeekerProfile.findOneAndUpdate({ userId: targetRevieweeId }, { avgRating: Math.round(avgRating * 10) / 10 });
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get reviews for a helper
// @route GET /api/v1/review/:helperId
const getHelperReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.helperId })
      .populate('reviewerId', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { submitReview, getHelperReviews };
