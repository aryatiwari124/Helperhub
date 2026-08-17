const mongoose = require('mongoose');

const jobSeekerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    category: [{ type: String }], // e.g. ['Plumber', 'Electrician']
    bio: { type: String, maxlength: 500 },
    city: { type: String },
    serviceAreas: [{ type: String }],
    rate: { type: Number },
    rateType: { type: String, enum: ['hourly', 'fixed'], default: 'hourly' },
    availability: { type: String }, // e.g. 'Mon-Sat, 9am-6pm'
    idProofUrl: { type: String },
    isVerifiedByAdmin: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    yearsExperience: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for search
jobSeekerProfileSchema.index({ category: 1, city: 1 });

module.exports = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);
