const JobPost = require('../models/JobPost');

// @desc  Create a job post
// @route POST /api/v1/jobpost
const createJobPost = async (req, res) => {
  try {
    const { title, category, description, location, budget, preferredDate } = req.body;
    const job = await JobPost.create({
      recruiterId: req.user.id,
      title, category, description, location, budget, preferredDate,
    });
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get all open job posts (for helpers to browse)
// @route GET /api/v1/jobpost?category=Plumber&page=1
const getOpenJobs = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = { status: 'open' };
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      JobPost.find(filter).populate('recruiterId', 'name profilePic').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      JobPost.countDocuments(filter),
    ]);

    res.json({ success: true, jobs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get my posted jobs (recruiter)
// @route GET /api/v1/jobpost/my
const getMyJobs = async (req, res) => {
  try {
    const jobs = await JobPost.find({ recruiterId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get single job post
// @route GET /api/v1/jobpost/:id
const getJobPost = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id).populate('recruiterId', 'name profilePic email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update job post status
// @route PATCH /api/v1/jobpost/:id/status
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await JobPost.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.user.id },
      { status },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Delete job post
// @route DELETE /api/v1/jobpost/:id
const deleteJobPost = async (req, res) => {
  try {
    const job = await JobPost.findOneAndDelete({ _id: req.params.id, recruiterId: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createJobPost, getOpenJobs, getMyJobs, getJobPost, updateJobStatus, deleteJobPost };
