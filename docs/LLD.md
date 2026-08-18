# HelperHub — Low-Level Design (LLD)

## 1. Database Schema (MongoDB / Mongoose)

### User
```js
{
  name: String,
  email: { type: String, unique: true },
  password: String,          // bcrypt-hashed, 12 rounds
  role: 'jobSeeker' | 'recruiter',
  isVerified: Boolean,
  authProvider: 'local' | 'google',
  googleId: String,          // set if linked to Google
  profilePic: String,
  skills: [String],          // job seekers
  ratings: [{ score: Number, review: String }],
  createdAt: Date
}
```
*(Additional models — Job, Application, Payment — follow the same pattern; extend as implemented.)*

## 2. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/signup` | Create account, trigger OTP |
| POST | `/api/v1/auth/verify-otp` | Verify OTP, activate account |
| POST | `/api/v1/auth/login` | Email/password login |
| POST | `/api/v1/auth/google` | Verify Google ID token, login/create user |
| POST | `/api/v1/estimate` | Get AI cost estimate |
| POST | `/api/v1/payments/checkout` | Create Stripe checkout session |

## 3. LLM Prompt Design (`server/prompts/costEstimation.js`)
- **System prompt**: establishes persona as a local-services pricing expert for India; sets INR as the currency of grounding.
- **User prompt template**: takes `{ serviceType, description, city }`, injected into a structured template.
- **Output constraint**: hard JSON-only instruction with a few-shot schema example to lock format.
- **Schema enforced**:
```json
{
  "min_cost": "number",
  "max_cost": "number",
  "currency": "INR",
  "reasoning": "string",
  "confidence": "low | medium | high"
}
```

## 4. Structured Output Validation (`estimateController.js`)
`parseAndValidateEstimate()`:
- Confirms `min_cost`/`max_cost` are numbers.
- Confirms `currency === "INR"`.
- Confirms `confidence` is one of the enum values.
- Confirms `reasoning` is a non-empty string.
- Returns `502` on any violation rather than passing malformed data to the client.

## 5. Google OAuth Verification (`authController.js`)
```js
const client = new OAuth2Client(clientId);
const ticket = await client.verifyIdToken({
  idToken: googleToken,
  audience: clientId,
});
const payload = ticket.getPayload(); // signature, audience, expiry all verified
```
