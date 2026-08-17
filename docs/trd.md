2. TRD (Technical Requirements Document)
2.1 Tech Stack
Frontend: React (Vite recommended over CRA for speed), React Router, Axios, TailwindCSS (fast styling), Context API or Redux Toolkit for state (Context API is enough for this scope).
Backend: Node.js + Express.js
Database: MongoDB (Atlas free tier — good for a capstone, no local DB setup needed for demo/deployment).
Auth:
Google Sign-In → Google OAuth 2.0 via @react-oauth/google (frontend) + google-auth-library (backend verifies ID token).
Email/Password + OTP → Nodemailer (send OTP via email, e.g. Gmail SMTP or a free service like Brevo/SendGrid) + bcrypt for password hashing + JWT for session tokens.
Payment: Stripe (test mode) — stripe npm package (backend), @stripe/react-stripe-js + @stripe/stripe-js (frontend).
File/image upload (profile pics, ID proof for helpers): Multer + Cloudinary (free tier) — simpler than raw S3 for a capstone.
Deployment: Frontend → Vercel/Netlify. Backend → Render/Railway (free tiers). DB → MongoDB Atlas free cluster.
2.2 Non-Functional Requirements
Security: Passwords hashed (bcrypt), JWT with expiry, HTTPS in production, input validation (express-validator), rate-limiting on OTP endpoint (prevent spam).
Scalability: Not a hard requirement for capstone, but design schema/APIs so they could scale (indexed queries, pagination on listings).
Performance: Basic caching not required; keep API responses lean, paginate helper listings.
Availability: Demo-grade — free-tier hosting is fine.
2.3 API Style

RESTful JSON APIs. Versioned under /api/v1/.

2.4 High-Level Architecture
[React Frontend] <--REST/JSON--> [Express API Server] <---> [MongoDB Atlas]
                                        |
                                        |--> Google OAuth verification
                                        |--> Nodemailer (OTP emails)
                                        |--> Stripe API (payments)
                                        |--> Cloudinary (image uploads)
2.5 Authentication Design

Two parallel signup/login paths per role:

A. Google Sign-In

Frontend gets Google ID token via @react-oauth/google.
Sends token to POST /api/v1/auth/google.
Backend verifies token with Google, extracts email/name.
If user doesn't exist → create user (role selected at this step: recruiter or job seeker).
Issue JWT, return to frontend, store in httpOnly cookie or localStorage.

B. Email/Password + OTP

POST /api/v1/auth/signup — user submits email, password, role. Backend hashes password, generates 6-digit OTP, saves OTP + expiry (5 min) against a temp/unverified user record, emails OTP via Nodemailer.
POST /api/v1/auth/verify-otp — user submits email + OTP. Backend checks match + expiry → marks user verified, issues JWT.
POST /api/v1/auth/login — email + password → bcrypt compare → issue JWT.
POST /api/v1/auth/resend-otp — regenerate + resend, rate-limited.

Both paths converge into the same User collection with a role field (recruiter / jobseeker / admin) and authProvider field (google / local).