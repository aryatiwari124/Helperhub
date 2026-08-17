const https = require('https');
const { SYSTEM_PROMPT, buildUserPrompt } = require('../prompts/costEstimation');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-5'; // claude-sonnet-4-6 maps to this API slug

const VALID_SERVICE_TYPES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'AC Technician', 'Cleaner', 'Mechanic', 'Gardener', 'General Repair'];

/**
 * Call the Anthropic Messages API.
 * Returns the raw response text from the first content block.
 */
function callAnthropicAPI(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key') {
      return reject(new Error('ANTHROPIC_API_KEY is not configured'));
    }

    const body = JSON.stringify({
      model: ANTHROPIC_MODEL,
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
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(ANTHROPIC_API_URL, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(`Anthropic API error: ${parsed.error.message}`));
          }
          const text = parsed.content?.[0]?.text;
          if (!text) return reject(new Error('Empty response from Anthropic'));
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Anthropic response: ' + e.message));
        }
      });
    });

    req.on('error', (e) => reject(new Error('Network error calling Anthropic: ' + e.message)));
    req.write(body);
    req.end();
  });
}

/**
 * Parse and strictly validate the structured JSON output from the LLM.
 * Returns the validated object or throws a descriptive error.
 */
function parseAndValidateEstimate(rawText) {
  // Strip any accidental markdown fences the model may have added
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('LLM returned non-JSON output: ' + cleaned.slice(0, 200));
  }

  const { min_cost, max_cost, currency, reasoning, confidence } = parsed;

  if (typeof min_cost !== 'number' || typeof max_cost !== 'number') {
    throw new Error('min_cost and max_cost must be numbers');
  }
  if (min_cost < 0 || max_cost < 0) throw new Error('Costs cannot be negative');
  if (min_cost > max_cost) throw new Error('min_cost must be <= max_cost');
  if (currency !== 'INR') throw new Error('currency must be INR');
  if (!reasoning || typeof reasoning !== 'string') throw new Error('reasoning is required');
  if (!['low', 'medium', 'high'].includes(confidence)) {
    throw new Error('confidence must be low, medium, or high');
  }

  return { min_cost: Math.round(min_cost), max_cost: Math.round(max_cost), currency, reasoning, confidence };
}

// @desc  AI-powered cost estimation for a home service job
// @route POST /api/v1/estimate
const getCostEstimate = async (req, res) => {
  const { serviceType, jobDescription, city } = req.body;

  // Input validation
  if (!serviceType || !jobDescription || !city) {
    return res.status(400).json({
      success: false,
      message: 'serviceType, jobDescription, and city are all required',
    });
  }
  if (jobDescription.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a more descriptive job description (at least 10 characters)',
    });
  }
  if (jobDescription.trim().length > 500) {
    return res.status(400).json({ success: false, message: 'Job description is too long (max 500 chars)' });
  }

  try {
    const userPrompt = buildUserPrompt(serviceType.trim(), jobDescription.trim(), city.trim());
    const rawText = await callAnthropicAPI(SYSTEM_PROMPT, userPrompt);
    const estimate = parseAndValidateEstimate(rawText);

    res.json({
      success: true,
      estimate,
      meta: {
        model: ANTHROPIC_MODEL,
        serviceType,
        city,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[estimateController] LLM error:', error.message);
    res.status(502).json({
      success: false,
      message: error.message || 'Failed to generate estimate from AI',
    });
  }
};

module.exports = { getCostEstimate };
