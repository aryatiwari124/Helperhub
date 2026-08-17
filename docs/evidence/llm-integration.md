# LLM Integration Evidence — HelperHub AI Cost Estimator

## Feature Summary

HelperHub's **AI Cost Estimator** lets a homeowner describe a repair job (e.g. "kitchen sink pipe leaking"), pick a service type and city, and receive an **AI-generated price range in INR** within 2-3 seconds.

The feature is powered by **Anthropic's Claude (claude-sonnet-4-5)** via the `/v1/messages` API. The estimate is returned as a **validated structured JSON object** (not free text), ensuring the frontend always receives machine-readable cost data with a confidence score and plain-language reasoning.

---

## Architecture Diagram

```
User fills form in LandingPage.jsx
        │
        ▼
POST /api/v1/estimate
{ serviceType, jobDescription, city }
        │
        ▼
estimateController.js
  → builds prompt from costEstimation.js
  → calls Anthropic /v1/messages API (HTTPS)
  → receives raw text from Claude
  → parseAndValidateEstimate() validates JSON shape
  → returns validated object to frontend
        │
        ▼
EstimateResult card renders:
  ₹min_cost – ₹max_cost  |  confidence badge  |  reasoning text
```

---

## File References

### 1. LLM Integration (API Call)

**[`server/controllers/estimateController.js`](../../server/controllers/estimateController.js)**

| Line(s) | What |
|---------|------|
| 1–2 | Imports `https` module and prompt helpers |
| 14 | `const ANTHROPIC_MODEL = 'claude-sonnet-4-5'` — model selection |
| 16–57 | `callAnthropicAPI(systemPrompt, userMessage)` — HTTPS POST to `https://api.anthropic.com/v1/messages` with `x-api-key` auth header and `anthropic-version: 2023-06-01` |
| 23–31 | Request body construction: `{ model, max_tokens: 512, system, messages }` |
| 96–133 | `getCostEstimate` — controller handler: validates input → builds prompt → calls API → validates JSON → responds |

```js
// estimateController.js line 16-57
function callAnthropicAPI(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const body = JSON.stringify({
      model: ANTHROPIC_MODEL,          // claude-sonnet-4-5
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    };
    const req = https.request('https://api.anthropic.com/v1/messages', options, ...);
    ...
  });
}
```

---

### 2. Prompt Engineering

**[`server/prompts/costEstimation.js`](../../server/prompts/costEstimation.js)**

| Line(s) | What |
|---------|------|
| 1–47 | Block comment documenting all 5 prompt design decisions |
| 49–75 | `SYSTEM_PROMPT` constant — persona, output rules, schema, few-shot example |
| 77–89 | `buildUserPrompt(serviceType, jobDescription, city)` — user-turn template |

**Design decisions (summarized):**

1. **Concrete persona** ("senior pricing analyst for local home services in India") rather than generic instruction — anchors to Indian market rates.
2. **Hard output constraint** — "Respond ONLY with a single valid JSON object. No markdown, no code fences." — prevents LLMs wrapping JSON in ` ```json ``` ` fences that break `JSON.parse()`.
3. **Embedded schema + one-shot example** in the prompt locks the output shape (few-shot schema enforcement).
4. **`confidence` field** so the frontend can visually warn users when the model is uncertain (vague descriptions, unusual jobs).
5. **Explicit INR + India** grounding prevents USD-based Western pricing defaults.

```js
// server/prompts/costEstimation.js — SYSTEM_PROMPT (lines 49–75)
const SYSTEM_PROMPT = `You are a senior pricing analyst for local home services in India.
...
STRICT OUTPUT RULES:
- Respond ONLY with a single valid JSON object.
- No markdown, no code fences...

Required JSON schema:
{
  "min_cost": <integer in INR>,
  "max_cost": <integer in INR>,
  "currency": "INR",
  "reasoning": "<1-2 sentence explanation>",
  "confidence": "<low | medium | high>"
}

Example valid response:
{"min_cost":400,"max_cost":800,"currency":"INR","reasoning":"...","confidence":"high"}`;
```

---

### 3. Structured Output & Validation

**[`server/controllers/estimateController.js`](../../server/controllers/estimateController.js) — lines 60–89**

`parseAndValidateEstimate(rawText)` enforces the JSON contract server-side:

```js
function parseAndValidateEstimate(rawText) {
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const parsed = JSON.parse(cleaned);

  // Field-level validation — rejects if malformed
  if (typeof min_cost !== 'number' || typeof max_cost !== 'number') throw ...
  if (min_cost < 0 || max_cost < 0) throw ...
  if (min_cost > max_cost) throw ...
  if (currency !== 'INR') throw ...
  if (!['low', 'medium', 'high'].includes(confidence)) throw ...

  return { min_cost: Math.round(min_cost), max_cost: Math.round(max_cost), currency, reasoning, confidence };
}
```

If validation fails, the endpoint returns `502` with a descriptive error — the frontend shows a friendly error state rather than crashing.

---

### 4. Frontend — Form + Result Card

**[`client/src/pages/LandingPage.jsx`](../../client/src/pages/LandingPage.jsx) — lines 72–95 (state + handler) and ~366–455 (widget JSX)**

- `handleEstimate()` calls `api.post('/estimate', { serviceType, jobDescription, city })`
- Loading spinner shown while waiting on Claude (2-3s)
- On success: renders `min_cost`, `max_cost`, `confidence` badge (green/amber/red), and `reasoning` text
- On error: amber error banner with the backend message

---

## Example Request / Response

**Request:**
```http
POST /api/v1/estimate
Content-Type: application/json

{
  "serviceType": "Plumber",
  "jobDescription": "Kitchen sink pipe is leaking under the counter, water dripping onto the cabinet floor below",
  "city": "Mumbai"
}
```

**Response (Claude output, validated):**
```json
{
  "success": true,
  "estimate": {
    "min_cost": 400,
    "max_cost": 900,
    "currency": "INR",
    "reasoning": "A standard under-sink pipe leak repair in Mumbai typically involves replacing a P-trap or tightening compression fittings, taking 30–90 minutes at local plumber rates of ₹400–900 depending on parts needed.",
    "confidence": "high"
  },
  "meta": {
    "model": "claude-sonnet-4-5",
    "serviceType": "Plumber",
    "city": "Mumbai",
    "generatedAt": "2026-08-17T16:45:00.000Z"
  }
}
```

---

## Environment Setup

Add to `server/.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-...   # get from console.anthropic.com
```

The feature gracefully degrades — if no API key is set, the endpoint returns a clear 502 error rather than silently returning fake data.

---

## Key Files Changed

| File | Purpose |
|------|---------|
| `server/prompts/costEstimation.js` | System prompt + user prompt builder |
| `server/controllers/estimateController.js` | Anthropic API call + JSON validation |
| `server/routes/estimateRoutes.js` | `POST /api/v1/estimate` route |
| `server/server.js` | Mounts the estimate route |
| `server/.env` | `ANTHROPIC_API_KEY` placeholder |
| `client/src/pages/LandingPage.jsx` | Form + result card UI (replaces hardcoded widget) |
