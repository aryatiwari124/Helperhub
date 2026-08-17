Backend Schema (MongoDB Collections)
js
// User (base for both roles)
User {
  _id: ObjectId,
  name: String,
  email: String (unique, required),
  password: String (hashed, only if authProvider='local'),
  authProvider: enum['local','google'],
  googleId: String (if applicable),
  role: enum['recruiter','jobseeker','admin'],
  phone: String,
  isVerified: Boolean (email/OTP verified),
  profilePic: String (Cloudinary URL),
  createdAt: Date,
  updatedAt: Date
}

// OTP (temp collection for verification, TTL indexed to auto-expire)
OTP {
  _id: ObjectId,
  email: String,
  otp: String,
  expiresAt: Date (TTL index),
  createdAt: Date
}

// JobSeekerProfile
JobSeekerProfile {
  _id: ObjectId,
  userId: ObjectId (ref: User),
  category: [String], // e.g. ["Plumber","Electrician"]
  bio: String,
  city: String,
  serviceAreas: [String],
  rate: Number,
  rateType: enum['hourly','fixed'],
  availability: String, // e.g. "Mon-Sat, 9am-6pm"
  idProofUrl: String (optional),
  isVerifiedByAdmin: Boolean,
  avgRating: Number (default 0),
  totalJobs: Number (default 0),
  createdAt: Date
}

// JobPost (recruiter posts a requirement)
JobPost {
  _id: ObjectId,
  recruiterId: ObjectId (ref: User),
  category: String,
  description: String,
  location: String,
  budget: Number,
  preferredDate: Date,
  status: enum['open','assigned','in_progress','completed','cancelled'],
  assignedHelperId: ObjectId (ref: User, nullable),
  createdAt: Date
}

// HireRequest (direct hire from browsing, or application to a JobPost)
HireRequest {
  _id: ObjectId,
  jobPostId: ObjectId (ref: JobPost, nullable — null if direct hire),
  recruiterId: ObjectId (ref: User),
  helperId: ObjectId (ref: User),
  status: enum['pending','accepted','declined','paid','completed'],
  createdAt: Date
}

// Payment
Payment {
  _id: ObjectId,
  hireRequestId: ObjectId (ref: HireRequest),
  recruiterId: ObjectId,
  helperId: ObjectId,
  amount: Number,
  stripePaymentIntentId: String,
  status: enum['pending','held','released','refunded'],
  createdAt: Date
}

// Review
Review {
  _id: ObjectId,
  hireRequestId: ObjectId (ref: HireRequest),
  reviewerId: ObjectId,
  revieweeId: ObjectId,
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}

// Category (admin-managed)
Category {
  _id: ObjectId,
  name: String, // "Plumber", "Electrician", etc.
  icon: String,
  isActive: Boolean
}

Indexes to add: User.email (unique), JobSeekerProfile.category + city (compound, for search), JobPost.status + category, OTP.expiresAt (TTL).