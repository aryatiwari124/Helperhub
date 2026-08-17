const HireRequest = require('../models/HireRequest');
const JobPost = require('../models/JobPost');
const JobSeekerProfile = require('../models/JobSeekerProfile');

// @desc  Send hire request (direct hire or from job post)
// @route POST /api/v1/hire
const sendHireRequest = async (req, res) => {
  try {
    const { helperId, jobPostId, jobTitle, jobDescription, jobLocation, scheduledDate, agreedAmount } = req.body;

    const existing = await HireRequest.findOne({
      recruiterId: req.user.id,
      helperId,
      status: { $in: ['pending', 'accepted', 'paid', 'in_progress'] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have an active request with this helper' });
    }

    const hireRequest = await HireRequest.create({
      jobPostId: jobPostId || null,
      recruiterId: req.user.id,
      helperId,
      jobTitle, jobDescription, jobLocation, scheduledDate, agreedAmount,
    });

    // If from job post, update job post status
    if (jobPostId) {
      await JobPost.findByIdAndUpdate(jobPostId, { status: 'assigned', assignedHelperId: helperId });
    }

    res.status(201).json({ success: true, hireRequest });
  } catch (error) {
    console.error('Hire request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get my hire requests (as recruiter)
// @route GET /api/v1/hire/recruiter
const getRecruiterRequests = async (req, res) => {
  try {
    const requests = await HireRequest.find({ recruiterId: req.user.id })
      .populate('helperId', 'name profilePic email')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get incoming hire requests (as helper)
// @route GET /api/v1/hire/helper
const getHelperRequests = async (req, res) => {
  try {
    const requests = await HireRequest.find({ helperId: req.user.id })
      .populate('recruiterId', 'name profilePic email')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Accept or Decline hire request (helper action)
// @route PATCH /api/v1/hire/:id/respond
const respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accepted' or 'declined'
    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const request = await HireRequest.findOneAndUpdate(
      { _id: req.params.id, helperId: req.user.id, status: 'pending' },
      { status: action },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found or already responded' });

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Mark job as done (helper or recruiter side)
// @route PATCH /api/v1/hire/:id/complete
const markComplete = async (req, res) => {
  try {
    const request = await HireRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const isRecruiter = request.recruiterId.toString() === req.user.id;
    const isHelper = request.helperId.toString() === req.user.id;

    if (isRecruiter) request.recruiterMarkedDone = true;
    if (isHelper) request.helperMarkedDone = true;

    // Both sides confirmed → mark as completed
    if (request.helperMarkedDone && request.recruiterMarkedDone) {
      request.status = 'completed';
      // Update helper stats
      await JobSeekerProfile.findOneAndUpdate(
        { userId: request.helperId },
        { $inc: { totalJobs: 1, totalEarnings: request.agreedAmount || 0 } }
      );
    }

    await request.save();
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get single hire request detail
// @route GET /api/v1/hire/:id
const getHireRequest = async (req, res) => {
  try {
    const request = await HireRequest.findById(req.params.id)
      .populate('recruiterId', 'name profilePic email phone')
      .populate('helperId', 'name profilePic email phone');
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { sendHireRequest, getRecruiterRequests, getHelperRequests, respondToRequest, markComplete, getHireRequest };
