Implementation Plan
6.1 Suggested Folder Structure
/client (React)
  /src
    /pages (Landing, Signup, Login, RecruiterDashboard, JobSeekerDashboard, HelperProfile, JobDetail, Payment, AdminPanel)
    /components (Navbar, HelperCard, JobCard, OTPInput, RatingModal)
    /context (AuthContext)
    /services (api.js — Axios instance)
/server (Node/Express)
  /models (User, OTP, JobSeekerProfile, JobPost, HireRequest, Payment, Review, Category)
  /routes (auth.js, jobseeker.js, jobpost.js, hire.js, payment.js, review.js, admin.js)
  /controllers
  /middleware (authMiddleware.js — JWT verify, roleCheck.js)
  /utils (sendOtpEmail.js, generateOtp.js)
  server.js
6.2 Build Order (recommended sequence for a solo capstone timeline)
Week 1: Setup MERN boilerplate, MongoDB Atlas connection, User model, JWT middleware.
Week 2: Auth — Google OAuth + Email/OTP signup/login (both roles). Test thoroughly, this is your most complex module.
Week 3: Job Seeker profile creation + Recruiter browse/search helpers (category + location filter).
Week 4: Job posting flow + Hire request flow (accept/decline).
Week 5: Stripe integration (test mode checkout, payment status tracking).
Week 6: Ratings/reviews + job completion flow.
Week 7: Admin panel (basic) + polish UI + responsive fixes.
Week 8: Testing, bug fixes, deployment (Vercel + Render + Atlas), prepare demo/report.
6.3 Key Implementation Notes
Use express-validator for all form input validation.
Store JWT in httpOnly cookie for better security (or localStorage if simpler for your demo — either is acceptable for a capstone).
For Stripe: use stripe.checkout.sessions.create() (Stripe Checkout, hosted page) instead of custom Elements UI — much less code for a capstone, still looks professional.
For OTP emails: use Gmail SMTP with an App Password, or a free-tier transactional email service like Brevo — more reliable deliverability than raw Gmail SMTP for a demo you'll show live.
Seed your DB with a few categories (Plumber, Electrician, Carpenter, AC Repair, Painter, etc.) and 5-10 dummy helper profiles before your demo — makes the browse/search feature look alive.