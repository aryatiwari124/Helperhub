UI/UX Design Document
4.1 Design Principles
Trust-first design: verified badges, ratings, clear pricing — since the core problem is trust in hiring strangers.
Simple, low-friction forms — target users may not be highly tech-savvy (both recruiters and helpers).
Mobile-responsive web (even though it's a website, most users will access via phone browsers).
4.2 Key Screens
Landing Page — hero section explaining the platform, "Hire a Helper" / "Find Work" CTAs, category icons (plumber, electrician, carpenter, repair).
Role Selection / Signup — toggle between Recruiter/Job Seeker, then Google button + Email/OTP form.
OTP Verification Screen — 6-box OTP input, resend timer.
Recruiter Dashboard — tabs: "Browse Helpers", "My Jobs", "Post a Job".
Helper Listing Page — card grid: photo, name, category, rating, rate, "View Profile" / "Hire".
Helper Profile Page — bio, skills, service area, rate, reviews, "Hire Now" button.
Post a Job Form — category dropdown, description textarea, location, budget, date picker.
Job Seeker Dashboard — tabs: "My Profile", "Incoming Requests", "Open Jobs Nearby", "Earnings".
Payment/Checkout Page — Stripe embedded card element, job summary, "Pay & Confirm".
Job Detail/Status Page — timeline: Requested → Accepted → Paid → In Progress → Completed → Rated.
Rating & Review Modal — star rating + comment, shown post-completion.
Admin Panel — simple table views for users/jobs/categories.
Updated Visual Style (replaces section 4.3)

Palette — warm & energetic instead of corporate blue:

Primary: a warm coral/orange (
#FF6B4A or similar) — energetic, friendly, feels human.
Secondary/accent: a soft teal or mint green (
#2EC4B6) — pairs well with coral, feels fresh and trustworthy without being sterile.
Background: warm off-white (
#FFF9F5) instead of stark white — softer on the eyes, less "hospital form."
Text: dark charcoal (
#2B2B2B) instead of pure black — friendlier contrast.
Success/completed states: mint green. Alerts: a warm amber, not harsh red.

Typography:

Headings: a rounded, friendly sans-serif like Poppins or Quicksand (softer letterforms than Inter/Helvetica).
Body: Inter or Nunito Sans for readability, keeps some warmth.
Slightly larger base font size (16-17px) and generous line-height — feels relaxed, not cramped.

Shape & feel:

Rounded corners everywhere — cards, buttons, inputs (12-16px radius, not razor-sharp).
Soft drop shadows instead of hard borders — cards should feel like they're gently floating.
Illustrated icons/mascots instead of flat corporate icons — e.g. a friendly hand-drawn style toolbox, wrench, lightbulb for categories rather than generic line icons.
Buttons: pill-shaped or heavily rounded, with a slight hover-bounce/scale animation — playful micro-interactions.
Use of whitespace generously, but broken up with color-blocked sections (not endless white background) — keeps it lively.
Helper cards: photo with a friendly colored ring/badge instead of a plain square thumbnail; rating shown as filled coral stars, not generic yellow.

Tone in copy/microcopy:

"Find your fix-it hero" instead of "Search Service Providers"
"You're all set! 🎉" instead of "Submission successful"
Conversational, warm microcopy throughout — reinforces the friendly visual style.
Updated Stitch Prompt (replaces section 7)

Design a warm, friendly, approachable web platform called "HelperHub" that connects people who need home services (plumbers, electricians, carpenters, repair technicians) with local helpers. It's a two-sided marketplace with two user roles: Recruiters (people hiring help) and Job Seekers (helpers offering services).

Use a warm, energetic color palette — coral/orange as the primary color, soft mint/teal as an accent, and a warm off-white background instead of stark white. Use rounded, friendly typography (like Poppins or Quicksand for headings, Nunito Sans for body text). Make everything feel approachable rather than corporate: rounded corners on cards and buttons, soft shadows instead of hard borders, playful illustrated icons for service categories (plumber, electrician, carpenter, repair) instead of flat generic icons, and pill-shaped buttons with a friendly, slightly playful feel — think a modern lifestyle app rather than enterprise software.

Design the following screens in this cohesive, friendly style:

Landing page with a warm hero section, friendly illustrated category icons, and inviting "Hire a Helper" / "Find Work" buttons.
Signup/login screen with role selection (Recruiter or Job Seeker), a "Sign in with Google" button, and a friendly email/password form with a fun OTP verification step.
Recruiter dashboard with tabs for "Browse Helpers", "My Jobs", and "Post a Job", showing a warm card grid of helper profiles (photo with colored ring, name, category, star rating, rate).
A helper profile page with bio, skills, service area, rate, reviews, and a friendly "Hire Now" button.
A "Post a Job" form with category selection, description field, location, budget, and date picker, styled with soft rounded inputs.
Job Seeker dashboard with tabs for "My Profile", "Incoming Requests", "Open Jobs Nearby", and "Earnings" in a warm, encouraging card layout.
A checkout/payment screen with a friendly job summary card and card payment form.
A job status timeline with warm, encouraging microcopy at each stage (Requested → Accepted → Paid → In Progress → Completed → Rated).

Overall the design should feel like a friendly neighborhood app people trust and enjoy using — warm, human, a little playful — while still being clean and easy to navigate.