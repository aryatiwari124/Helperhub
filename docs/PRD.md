PRD (Product Requirements Document)
1.1 Project Name

HelperHub (placeholder — rename as you like)

1.2 Problem Statement

In city areas, people struggle to find reliable general helpers — plumbers, electricians, carpenters, repair technicians — quickly and with confidence. There's no centralized, trustworthy platform; people rely on word-of-mouth, local ads, or unreliable directory listings. On the other side, skilled helpers have no easy digital channel to find consistent work.

1.3 Goal

Build a web platform connecting two user types:

Recruiters (people who need a helper) — post a requirement or browse available helpers and hire based on need.
Job Seekers (helpers) — plumbers, electricians, carpenters, etc. — create a profile, list skills/availability, get hired, and get paid through the platform.
1.4 Target Users
Recruiters: urban households/small businesses needing on-demand or scheduled help.
Job Seekers: independent tradespeople (plumbers, electricians, carpenters, repairmen) looking for consistent leads.
1.5 Core User Roles
Recruiter — posts jobs, browses/hires helpers, pays via platform, rates helpers.
Job Seeker (Helper) — creates profile, sets skills/service area/availability, accepts jobs, gets paid, gets rated.
Admin (optional but recommended for a capstone demo — shows depth) — manages users, disputes, categories.
1.6 MVP Feature Scope
Feature	Included in MVP
Recruiter signup/login (Google + Email/OTP)	✅
Job Seeker signup/login (Google + Email/OTP)	✅
Job Seeker profile creation (skills, category, city/area, rate, availability)	✅
Browse/search helpers by category + location	✅
Post a job requirement (category, description, budget, location, date)	✅
Job Seeker can view & accept/decline job requests	✅
In-app booking/hiring flow	✅
Payment gateway (Stripe test mode) — recruiter pays, held until job marked complete	✅
Ratings & reviews after job completion	✅
Basic admin dashboard (user list, job list, category management)	✅ (stretch if time-constrained)
Chat/messaging between recruiter & helper	❌ (v2 — nice-to-have, not MVP)
Real-time location tracking	❌ (out of scope)
Mobile app	❌ (web only per your scope)
1.7 Out of Scope (for MVP)
Native mobile apps
Real-time in-app chat (can substitute with a simple "contact" reveal after hire)
Complex dispute resolution workflows
Multi-language support
Real payment payouts to helpers (test mode only, since this is a capstone)
1.8 Success Metrics (for your capstone evaluation/demo)
End-to-end flow works: signup → post job/browse helper → hire → pay (test) → complete → rate.
Both auth methods (Google + OTP) functional for both roles.
Clean, demonstrable UI.
Reasonably structured, scalable backend (even if not production-hardened).
1.9 Assumptions
Single city/region scope is fine for demo (no need for geo-scaling infra).
"Payment held until job complete" can be simulated logically (a status field) rather than true escrow, since Stripe Connect/escrow adds real complexity for a