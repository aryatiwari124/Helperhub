3. App Flow
3.1 Recruiter Flow
Landing page → "Get Started" → choose role: Recruiter.
Signup (Google or Email+OTP) → land on Recruiter Dashboard.
Two paths:
Browse Helpers: filter by category (plumber/electrician/carpenter/etc.) + location → view helper profile → send hire request.
Post a Job: fill form (category, description, location, budget, preferred date) → job goes live → matching helpers get notified.
Helper accepts → Recruiter gets notification → Recruiter proceeds to payment (Stripe checkout, held as "pending").
Job happens offline → Recruiter marks "Job Completed" → payment released (status update) → Recruiter leaves rating/review.
3.2 Job Seeker (Helper) Flow
Landing page → "Get Started" → choose role: Job Seeker.
Signup (Google or Email+OTP) → complete profile (category/skills, city/service area, hourly/fixed rate, availability, optional ID upload).
Dashboard shows:
Incoming job requests (from recruiters who browsed and hired directly).
Open job posts matching their category/location (they can apply).
Accept/apply → Recruiter pays → Helper performs job → marks "work done" from their side too (mutual confirmation, nice touch for capstone).
Gets rated, sees earnings history (test-mode).
3.3 Admin Flow (optional, adds polish)
Admin login (seeded account, not public signup).
View all users, jobs, disputes.
Manage categories (add/remove "Plumber", "Electrician", etc.).
Suspend/verify helper accounts.