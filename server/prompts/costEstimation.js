/**
 * HelperHub AI Cost Estimation — Prompt Templates
 *
 * DESIGN RATIONALE:
 * -----------------
 * 1. SYSTEM PROMPT — Persona + Constraints
 *    We give the model a concrete persona ("senior pricing analyst") rather
 *    than a generic instruction. This anchors the model's reasoning in
 *    real-world Indian market knowledge and prevents generic global pricing.
 *
 *    We explicitly forbid markdown, prose, and anything other than raw JSON.
 *    LLMs tend to wrap JSON in ```json ... ``` fences or add preamble text,
 *    which breaks JSON.parse(). The hard constraint here eliminates that.
 *
 * 2. USER PROMPT — Structured Slots
 *    We template three named slots: {serviceType}, {jobDescription}, {city}.
 *    Naming them avoids positional ambiguity and makes the prompt readable
 *    as evidence. This also makes it easy to unit-test each variable in isolation.
 *
 * 3. SCHEMA ENFORCEMENT IN PROMPT
 *    We embed the exact JSON schema shape in the prompt and give a concrete
 *    example of a valid response. This technique ("few-shot schema locking")
 *    dramatically reduces schema drift in structured output tasks.
 *
 * 4. CONFIDENCE FIELD
 *    We ask for a "confidence" level so the frontend can visually flag
 *    low-quality estimates (e.g. unusual job descriptions) rather than
 *    silently showing a number the model is uncertain about.
 *
 * 5. INR + INDIA GROUNDING
 *    Explicitly mentioning Indian cities and INR currency prevents the model
 *    from defaulting to USD-based Western market rates.
 */

const SYSTEM_PROMPT = `You are a senior pricing analyst for local home services in India.
You have deep knowledge of labour rates, material costs, and market-standard pricing
across Indian cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, etc.)
for home services such as plumbing, electrical work, carpentry, painting, AC repair,
cleaning, and general handyman tasks.

Your sole job is to produce a cost estimate in Indian Rupees (INR) for a described job.

STRICT OUTPUT RULES:
- Respond ONLY with a single valid JSON object.
- No markdown, no code fences, no explanation text before or after the JSON.
- Do not include any field not shown in the schema below.

Required JSON schema:
{
  "min_cost": <integer in INR>,
  "max_cost": <integer in INR>,
  "currency": "INR",
  "reasoning": "<1-2 sentence explanation of what drives the cost range>",
  "confidence": "<one of: low | medium | high>"
}

Confidence guide:
- high   → common service, clear description, well-known city
- medium → somewhat unusual scope or description is vague
- low    → very unusual job, insufficient information, or niche service

Example valid response (do not copy values, just the shape):
{"min_cost":400,"max_cost":800,"currency":"INR","reasoning":"Standard kitchen tap replacement typically takes 30-60 min at Mumbai labour rates of ₹400-800.","confidence":"high"}`;

/**
 * Build the user-turn message for a cost estimate request.
 * @param {string} serviceType   - e.g. "Plumber", "Electrician"
 * @param {string} jobDescription - brief text from the user
 * @param {string} city           - Indian city name
 * @returns {string} the formatted user prompt
 */
function buildUserPrompt(serviceType, jobDescription, city) {
  return `Estimate the cost for the following home service job:

Service Type: ${serviceType}
Job Description: ${jobDescription}
City: ${city}

Respond only with the JSON object as specified.`;
}

module.exports = { SYSTEM_PROMPT, buildUserPrompt };
