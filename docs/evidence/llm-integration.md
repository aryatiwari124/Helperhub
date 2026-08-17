# LLM Integration Evidence — HelperHub AI Cost Estimator

## Feature Summary

HelperHub's **AI Cost Estimator** lets a homeowner describe a repair job (e.g. "kitchen sink pipe leaking"), pick a service type and city, and receive an **AI-generated price range in INR** within 2–3 seconds.

The feature is powered by **Claude (anthropic/claude-sonnet-4-5)** accessed via **[OpenRouter](https://openrouter.ai)** — an OpenAI-compatible routing layer that provides a unified endpoint for multiple LLM providers. The estimate is returned as a **validated structured JSON object** (not free text), ensuring the frontend always receives machine-readable cost data with a confidence score and plain-language reasoning.

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
  → POST https://openrouter.ai/api/v1/chat/completions
    (OpenAI-compatible, Authorization: Bearer <OPENROUTER_API_KEY>)
  → receives choices[0].message.content from OpenRouter
  → parseAndValidateEstimate() validates JSON shape server-side
  → returns validated object to frontend
        │
        ▼
EstimateResult card renders:
  ₹min_cost – ₹max_cost  |  confidence badge  |  reasoning text
```

---

## File References

### 1. LLM Integration (API Call via OpenRouter)

**[`server/controllers/estimateController.js`](../../server/controllers/estimateController.js)**

| Line(s) | What |
|---------|------|
| 6 | `const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'` |
| 7 | `const OPENROUTER_MODEL = 'anthropic/claude-sonnet-4-5'` — verified slug |
| 24–72 | `callOpenRouterAPI()` — HTTPS POST with `Authorization: Bearer` token, OpenRouter attribution headers, OpenAI message format |
| 36–40 | OpenAI-compatible request body: `{ model, messages: [{role:"system",...},{role:"user",...}] }` |
| 43–44 | OpenRouter auth: `Authorization: Bearer ${apiKey}` |
| 45–46 | OpenRouter attribution headers: `HTTP-Referer` and `X-Title: HelperHub` |
| 61–63 | Response parsing: `choices[0].message.content` (OpenAI-style, unlike Anthropic native `content[0].text`) |
| 115–134 | `getCostEstimate` controller: validates input → calls API → validates output → responds |

```js
// estimateController.js — OpenRouter call (lines 30–68)
const body = JSON.stringify({
  model: OPENROUTER_MODEL,           // 'anthropic/claude-sonnet-4-5'
  max_tokens: 512,
  messages: [
    { role: 'system', content: systemPrompt },   // OpenAI-style message array
    { role: 'user',   content: userMessage  },
  ],
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${apiKey}`,          // OpenRouter Bearer auth
    'HTTP-Referer':  'http://localhost:5173',     // OpenRouter attribution
    'X-Title':       'HelperHub',
  },
};

// Response: OpenAI-compatible
const text = parsed.choices?.[0]?.message?.content;
```

---

### 2. Prompt Engineering

**[`server/prompts/costEstimation.js`](../../server/prompts/costEstimation.js)**

| Line(s) | What |
|---------|------|
| 1–47 | Block comment documenting all 5 prompt design decisions |
| 49–75 | `SYSTEM_PROMPT` constant — persona, output rules, JSON schema, few-shot example |
| 77–89 | `buildUserPrompt(serviceType, jobDescription, city)` — user-turn template |

**Design decisions (summarized):**

1. **Concrete persona** ("senior pricing analyst for local home services in India") — anchors to Indian market rates rather than global/US pricing.
2. **Hard JSON-only output constraint** — "Respond ONLY with a single valid JSON object. No markdown, no code fences." — prevents ` ```json ``` ` wrapping that breaks `JSON.parse()`.
3. **Embedded schema + one-shot example** — locks the output shape (few-shot schema enforcement).
4. **`confidence` field** — frontend can visually warn users when the model is uncertain.
5. **Explicit INR + India grounding** — prevents USD-based Western pricing defaults.

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

**[`server/controllers/estimateController.js`](../../server/controllers/estimateController.js) — lines 77–101**

`parseAndValidateEstimate(rawText)` enforces the JSON contract server-side, independent of which LLM provider is used:

```js
function parseAndValidateEstimate(rawText) {
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const parsed = JSON.parse(cleaned);

  // Field-level validation — rejects if malformed, triggers 502 to frontend
  if (typeof min_cost !== 'number' || typeof max_cost !== 'number') throw ...
  if (min_cost < 0 || max_cost < 0) throw ...
  if (min_cost > max_cost) throw ...
  if (currency !== 'INR') throw ...
  if (!['low', 'medium', 'high'].includes(confidence)) throw ...

  return { min_cost: Math.round(min_cost), max_cost: Math.round(max_cost), currency, reasoning, confidence };
}
```

If validation fails, the endpoint returns `502` — the frontend shows a friendly error banner.

---

### 4. Frontend — Form + Result Card

**[`client/src/pages/LandingPage.jsx`](../../client/src/pages/LandingPage.jsx) — lines ~72–95 (state + handler) and ~366–455 (widget JSX)**

- `handleEstimate()` calls `api.post('/estimate', { serviceType, jobDescription, city })`
- Spinner shown while waiting on Claude (2–3 s)
- On success: renders `min_cost`, `max_cost`, confidence badge (green/amber/red), and `reasoning`
- On error: amber error banner with the backend message

---

## Example Request / Response

**OpenRouter Request (what the server sends):**
```http
POST https://openrouter.ai/api/v1/chat/completions
Authorization: Bearer sk-or-...
HTTP-Referer: http://localhost:5173
X-Title: HelperHub
Content-Type: application/json

{
  "model": "anthropic/claude-sonnet-4-5",
  "max_tokens": 512,
  "messages": [
    {
      "role": "system",
      "content": "You are a senior pricing analyst for local home services in India..."
    },
    {
      "role": "user",
      "content": "Estimate the cost for the following home service job:\n\nService Type: Plumber\nJob Description: Kitchen sink pipe is leaking under the counter, water dripping onto the cabinet floor below\nCity: Mumbai\n\nRespond only with the JSON object as specified."
    }
  ]
}
```

**OpenRouter Response (raw):**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "{\"min_cost\":400,\"max_cost\":900,\"currency\":\"INR\",\"reasoning\":\"A standard under-sink pipe leak in Mumbai involves P-trap replacement or tightening compression fittings, taking 30–90 min at local plumber rates of ₹400–900 depending on parts.\",\"confidence\":\"high\"}"
    },
    "finish_reason": "end_turn"
  }]
}
```

**API Response to Frontend (after validation):**
```json
{
  "success": true,
  "estimate": {
    "min_cost": 400,
    "max_cost": 900,
    "currency": "INR",
    "reasoning": "A standard under-sink pipe leak in Mumbai involves P-trap replacement or tightening compression fittings, taking 30–90 min at local plumber rates of ₹400–900 depending on parts.",
    "confidence": "high"
  },
  "meta": {
    "provider": "openrouter",
    "model": "anthropic/claude-sonnet-4-5",
    "serviceType": "Plumber",
    "city": "Mumbai",
    "generatedAt": "2026-08-17T16:52:00.000Z"
  }
}
```

---

## Environment Setup

Add to `server/.env`:
```
OPENROUTER_API_KEY=sk-or-...   # get a free key at openrouter.ai/keys
```

The feature gracefully degrades — if no key is set, the endpoint returns a clear 502 error with a setup instruction rather than silently returning fake data.

---

## Key Files

| File | Purpose |
|------|---------|
| `server/prompts/costEstimation.js` | System prompt + user prompt builder |
| `server/controllers/estimateController.js` | OpenRouter API call + JSON validation |
| `server/routes/estimateRoutes.js` | `POST /api/v1/estimate` route |
| `server/server.js` | Mounts the estimate route |
| `server/.env` | `OPENROUTER_API_KEY` |
| `client/src/pages/LandingPage.jsx` | Form + result card UI |
