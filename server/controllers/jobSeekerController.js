const JobSeekerProfile = require('../models/JobSeekerProfile');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc  Create or Update job seeker profile
// @route PUT /api/v1/jobseeker/profile
const upsertProfile = async (req, res) => {
  try {
    const { category, bio, city, serviceAreas, rate, rateType, availability, yearsExperience } = req.body;

    const profileData = { userId: req.user.id, category, bio, city, serviceAreas, rate, rateType, availability, yearsExperience };

    const profile = await JobSeekerProfile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Profile upsert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get my profile
// @route GET /api/v1/jobseeker/profile/me
const getMyProfile = async (req, res) => {
  try {
    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Browse helpers by category + city
// @route GET /api/v1/jobseeker/search?category=Plumber&city=Mumbai&page=1
const searchHelpers = async (req, res) => {
  try {
    const { category, city, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = { $in: [category] };
    if (city) filter.city = { $regex: city, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [profiles, total] = await Promise.all([
      JobSeekerProfile.find(filter)
        .populate('userId', 'name email profilePic')
        .sort({ avgRating: -1, totalJobs: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobSeekerProfile.countDocuments(filter),
    ]);

    res.json({ success: true, profiles, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get helper profile by userId
// @route GET /api/v1/jobseeker/:userId
const getHelperProfile = async (req, res) => {
  try {
    const [profile, reviews] = await Promise.all([
      JobSeekerProfile.findOne({ userId: req.params.userId }).populate('userId', 'name email profilePic'),
      Review.find({ revieweeId: req.params.userId })
        .populate('reviewerId', 'name profilePic')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.json({ success: true, profile, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get all helpers (for featured section)
// @route GET /api/v1/jobseeker/all
const getAllHelpers = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const profiles = await JobSeekerProfile.find()
      .populate('userId', 'name email profilePic')
      .sort({ avgRating: -1 })
      .limit(parseInt(limit));
    res.json({ success: true, profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { upsertProfile, getMyProfile, searchHelpers, getHelperProfile, getAllHelpers };
