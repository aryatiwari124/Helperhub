require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const JobPost = require('../models/JobPost');

const categories = [
  { name: 'Plumber', icon: '🔧', description: 'Water pipe installation and repair' },
  { name: 'Electrician', icon: '⚡', description: 'Electrical wiring and repairs' },
  { name: 'Carpenter', icon: '🪚', description: 'Furniture making and woodwork' },
  { name: 'AC Technician', icon: '❄️', description: 'Air conditioner installation and service' },
  { name: 'Painter', icon: '🎨', description: 'Interior and exterior painting' },
  { name: 'Cleaner', icon: '🧹', description: 'Deep cleaning and housekeeping' },
  { name: 'Mechanic', icon: '🔩', description: 'Vehicle and appliance repair' },
  { name: 'Gardener', icon: '🌿', description: 'Garden maintenance and landscaping' },
];

const helpers = [
  { name: 'Rajesh Kumar', email: 'rajesh@demo.com', category: ['Plumber', 'AC Technician'], city: 'Mumbai', rate: 500, rateType: 'hourly', avgRating: 4.8, totalJobs: 127, yearsExperience: 8, bio: 'Expert plumber with 8+ years experience. Specializing in pipe fitting, leak repair and AC installation. Available on weekends too.' },
  { name: 'Suresh Patel', email: 'suresh@demo.com', category: ['Electrician'], city: 'Delhi', rate: 600, rateType: 'hourly', avgRating: 4.9, totalJobs: 203, yearsExperience: 12, bio: 'Licensed electrician. Handle all types of wiring, switchboards, and electrical appliance fitting. 12 years in the trade.' },
  { name: 'Vikram Singh', email: 'vikram@demo.com', category: ['Carpenter'], city: 'Bangalore', rate: 450, rateType: 'hourly', avgRating: 4.7, totalJobs: 89, yearsExperience: 6, bio: 'Skilled carpenter specializing in modular furniture, door frames, and custom woodwork. Quality guaranteed.' },
  { name: 'Amit Sharma', email: 'amit@demo.com', category: ['Painter'], city: 'Mumbai', rate: 350, rateType: 'hourly', avgRating: 4.6, totalJobs: 156, yearsExperience: 5, bio: 'Professional painter for interior and exterior surfaces. Use premium paints only. Clean work guaranteed.' },
  { name: 'Deepak Yadav', email: 'deepak@demo.com', category: ['Mechanic', 'Plumber'], city: 'Pune', rate: 400, rateType: 'hourly', avgRating: 4.5, totalJobs: 94, yearsExperience: 7, bio: 'Multi-skilled technician. Handle plumbing issues and home appliance repairs. Quick response time.' },
  { name: 'Priya Nair', email: 'priya@demo.com', category: ['Cleaner'], city: 'Bangalore', rate: 300, rateType: 'hourly', avgRating: 4.9, totalJobs: 312, yearsExperience: 4, bio: 'Professional deep cleaner. Residential and commercial spaces. Eco-friendly cleaning products used.' },
  { name: 'Mohan Reddy', email: 'mohan@demo.com', category: ['Electrician', 'AC Technician'], city: 'Hyderabad', rate: 550, rateType: 'hourly', avgRating: 4.8, totalJobs: 178, yearsExperience: 10, bio: 'Master electrician and AC specialist. Handle split ACs, cassette ACs, and all electrical work.' },
  { name: 'Arun Mehta', email: 'arun@demo.com', category: ['Gardener'], city: 'Delhi', rate: 250, rateType: 'hourly', avgRating: 4.7, totalJobs: 65, yearsExperience: 3, bio: 'Passionate gardener. Maintain residential gardens, plant care, landscaping design and lawn management.' },
];

const sampleRecruiters = [
  { name: 'Neha Kapoor', email: 'neha@demo.com' },
  { name: 'Rahul Gupta', email: 'rahul@demo.com' },
];

const autoSeed = async () => {
  const count = await User.countDocuments();
  if (count > 0) return; // already seeded

  console.log('🌱 Populating demo dataset...');
  await Category.deleteMany({});
  await Category.insertMany(categories);

  const hashedPass = await bcrypt.hash('admin123', 12);
  await User.create({
    name: 'Admin User',
    email: 'admin@helperhub.com',
    password: hashedPass,
    role: 'admin',
    authProvider: 'local',
    isVerified: true,
  });

  for (const h of helpers) {
    const user = await User.create({
      name: h.name,
      email: h.email,
      password: hashedPass,
      role: 'jobseeker',
      authProvider: 'local',
      isVerified: true,
      profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(h.name)}`,
    });

    await JobSeekerProfile.create({
      userId: user._id,
      category: h.category,
      bio: h.bio,
      city: h.city,
      serviceAreas: [h.city, 'Nearby Areas'],
      rate: h.rate,
      rateType: h.rateType,
      availability: 'Mon-Sat, 8am-7pm',
      avgRating: h.avgRating,
      totalJobs: h.totalJobs,
      totalEarnings: h.totalJobs * h.rate * 3,
      yearsExperience: h.yearsExperience,
      isVerifiedByAdmin: true,
    });
  }

  for (const r of sampleRecruiters) {
    const user = await User.create({
      name: r.name,
      email: r.email,
      password: hashedPass,
      role: 'recruiter',
      authProvider: 'local',
      isVerified: true,
      profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name)}`,
    });

    await JobPost.create({
      recruiterId: user._id,
      title: 'Urgent Pipe Leak Fix',
      category: 'Plumber',
      description: 'Need an experienced plumber to fix a leaking pipe under the kitchen sink. Water is dripping continuously.',
      location: 'Andheri West, Mumbai',
      budget: 800,
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'open',
    });
  }

  console.log('✅ Demo dataset automatically initialized!');
};

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed...');

    await Category.deleteMany({});
    await User.deleteMany({ email: { $regex: '@demo.com' } });
    await JobSeekerProfile.deleteMany({});
    await JobPost.deleteMany({});

    await autoSeed();
    console.log('\n🎉 Seed complete! Demo credentials:');
    console.log('Admin:     admin@helperhub.com / admin123');
    console.log('Helper:    rajesh@demo.com / admin123');
    console.log('Recruiter: neha@demo.com / admin123');

    if (require.main === module) process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    if (require.main === module) process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData, autoSeed };
