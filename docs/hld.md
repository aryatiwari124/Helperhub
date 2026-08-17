# HelperHub — High-Level Design (HLD)

## Architecture Overview
A standard MERN-stack architecture with an added LLM service layer for cost estimation.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│  - AuthPage (email/OTP + Google Sign-In via GSI SDK)          │
│  - LandingPage (AI Cost Estimator widget)                     │
│  - Job Seeker / Recruiter Dashboards                          │
│  - AuthContext, LanguageContext (state mgmt)                  │
│  - Theming via CSS variables (data-theme attribute)           │
└───────────────────────────┬────────────────────────────────┘
                             │ REST (JSON, HTTPS)
┌───────────────────────────▼────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  - authController (signup, OTP, Google OAuth verification)   │
│  - estimateController (LLM cost estimation)                  │
│  - paymentController (Stripe checkout)                       │
│  - Routes: /api/v1/auth, /api/v1/estimate, /api/v1/payments  │
└───────┬─────────────────────┬────────────────────┬──────────┘
        │                     │                    │
┌───────▼──────┐   ┌──────────▼─────────┐  ┌───────▼────────┐
│   MongoDB     │   │  OpenRouter API     │  │  Stripe API    │
│ (Users, Jobs, │   │ (LLM cost estimate, │  │ (Checkout,     │
│  Profiles)    │   │  OpenAI-compatible) │  │  payments)     │
└───────────────┘   └─────────────────────┘  └────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ Google Identity   │
                    │ Services (OAuth)  │
                    └───────────────────┘
```

## Key Flows

### Auth flow (email/OTP)
1. User signs up → backend creates user (password hashed via bcrypt) → OTP generated and sent (or dev-mode auto-filled).
2. User verifies OTP → account marked `isVerified: true` → session token issued.

### Auth flow (Google OAuth)
1. Frontend loads Google Identity Services SDK, user clicks "Continue with Google."
2. Google returns a signed ID token to the frontend.
3. Frontend POSTs token to `/api/v1/auth/google`.
4. Backend verifies the token's signature via `google-auth-library`'s `OAuth2Client.verifyIdToken()` (checks signature, audience, expiry).
5. New user created with `authProvider: 'google'`, or linked to an existing email-based account via `googleId`.
6. Same session token/user shape returned as email login — `AuthContext` treats both identically.

### AI Cost Estimation flow
1. User submits service type, job description, city on the frontend widget.
2. Backend builds a system + user prompt (`costEstimation.js`) and calls OpenRouter's chat completions endpoint (OpenAI-compatible format, routed to a Claude model).
3. Backend strictly validates the returned JSON (`min_cost`, `max_cost`, `currency`, `reasoning`, `confidence`) — rejects with a 502 on schema violation.
4. Validated JSON returned to frontend and rendered as an estimate card.

### Payment flow
1. Recruiter initiates payment for a hire → backend creates a Stripe Checkout session.
2. Stripe handles the actual payment UI/processing.
3. Backend confirms payment completion via Stripe webhook/response.

## Cross-Cutting Concerns
- **Theming**: CSS variables toggled via a `data-theme` attribute on `<html>`, persisted to `localStorage`, applied before first paint to avoid flash.
- **i18n**: dictionary-based translations via `LanguageContext`, persisted to `localStorage`.
- **State management**: React Context API (`AuthContext`, `LanguageContext`) + local component state.
