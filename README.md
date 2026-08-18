# HelperHub

A local services marketplace connecting job seekers (plumbers, electricians, carpenters, repair technicians) with recruiters who need to hire local help — with an AI-powered cost estimator to help both sides gauge fair pricing upfront.

## Features
- Email/password signup with OTP verification, and Google OAuth (verified server-side via `google-auth-library`)
- AI Cost Estimator — LLM-powered, structured JSON output, via OpenRouter
- Job posting, browsing, and hiring flow between recruiters and job seekers
- Payments via Stripe
- Dark / light theming
- Multi-language support (7 languages)

## Tech Stack
- **Frontend**: React (Vite), Context API for state management
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **LLM**: OpenRouter (OpenAI-compatible endpoint, routed to Claude)
- **Auth**: Email/OTP + Google OAuth (Google Identity Services + google-auth-library)
- **Payments**: Stripe

## Project Structure
```
project100/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   ├── controllers/
│   ├── models/
│   ├── prompts/     # LLM prompt templates
│   ├── routes/
├── docs/            # PRD, HLD, LLD, TRD, evidence docs
```

## Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance, or the app will fall back to an in-memory MongoDB for dev/testing)
- An OpenRouter API key ([get one here](https://openrouter.ai/keys))
- A Google OAuth Client ID ([Google Cloud Console](https://console.cloud.google.com/))
- A Stripe account (test mode is fine)

### 1. Clone and install
```bash
git clone https://github.com/aryatiwari124/Helperhub.git
cd Helperhub

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment variables

**`server/.env`**
```env
MONGO_URI=mongodb://localhost:27017/helperhub
OPENROUTER_API_KEY=sk-or-v1-your-key-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
STRIPE_SECRET_KEY=sk_test_your-stripe-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
> If `EMAIL_USER`/`EMAIL_PASS` are left as placeholders, the app runs in dev mode: OTPs are printed to the server console and auto-filled on the verification screen instead of being emailed.

**`client/.env`**
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Run the app
```bash
# Terminal 1 — backend
cd server
node server.js

# Terminal 2 — frontend
cd client
npm run dev
```

The backend runs on `http://localhost:5000`, the frontend on `http://localhost:5173`.

## Documentation
See the [`docs/`](./docs) folder for the full PRD, HLD, LLD, and TRD, plus implementation evidence for the Kalvium Project Assessor rubric in [`docs/evidence/`](./docs/evidence).