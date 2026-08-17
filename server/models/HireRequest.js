const mongoose = require('mongoose');

const hireRequestSchema = new mongoose.Schema(
  {
    jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', default: null },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'paid', 'in_progress', 'completed', 'rated'],
      default: 'pending',
    },
    jobTitle: { type: String },
    jobDescription: { type: String },
    jobLocation: { type: String },
    scheduledDate: { type: Date },
    agreedAmount: { type: Number },
    helperMarkedDone: { type: Boolean, default: false },
    recruiterMarkedDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

hireRequestSchema.index({ recruiterId: 1, createdAt: -1 });
hireRequestSchema.index({ helperId: 1, createdAt: -1 });
hireRequestSchema.index({ status: 1 });

module.exports = mongoose.model('HireRequest', hireRequestSchema);
