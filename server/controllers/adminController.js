const User = require('../models/User');
const JobPost = require('../models/JobPost');
const HireRequest = require('../models/HireRequest');
const Category = require('../models/Category');
const JobSeekerProfile = require('../models/JobSeekerProfile');

// @desc  Get platform stats
// @route GET /api/v1/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalHires, totalCategories, verifiedHelpers] = await Promise.all([
      User.countDocuments(),
      JobPost.countDocuments(),
      HireRequest.countDocuments(),
      Category.countDocuments(),
      JobSeekerProfile.countDocuments({ isVerifiedByAdmin: true }),
    ]);
    res.json({ success: true, stats: { totalUsers, totalJobs, totalHires, totalCategories, verifiedHelpers } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get all users
// @route GET /api/v1/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Suspend/activate user
// @route PATCH /api/v1/admin/users/:id/toggle
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isVerified = !user.isVerified;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Verify a helper
// @route PATCH /api/v1/admin/helpers/:userId/verify
const verifyHelper = async (req, res) => {
  try {
    const profile = await JobSeekerProfile.findOneAndUpdate(
      { userId: req.params.userId },
      { isVerifiedByAdmin: true },
      { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get all categories
// @route GET /api/v1/admin/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Create category
// @route POST /api/v1/admin/categories
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const category = await Category.create({ name, icon, description });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Toggle category active state
// @route PATCH /api/v1/admin/categories/:id/toggle
const toggleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    category.isActive = !category.isActive;
    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Delete category
// @route DELETE /api/v1/admin/categories/:id
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get all job posts
// @route GET /api/v1/admin/jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await JobPost.find().populate('recruiterId', 'name email').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getStats, getAllUsers, toggleUser, verifyHelper, getCategories, createCategory, toggleCategory, deleteCategory, getAllJobs };
