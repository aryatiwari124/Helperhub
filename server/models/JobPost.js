const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    budget: { type: Number },
    preferredDate: { type: Date },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    assignedHelperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

jobPostSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('JobPost', jobPostSchema);
