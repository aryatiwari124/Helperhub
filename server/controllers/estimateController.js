const https = require('https');
const { SYSTEM_PROMPT, buildUserPrompt } = require('../prompts/costEstimation');

// OpenRouter provides an OpenAI-compatible endpoint that routes to Claude and other models.
// Docs: https://openrouter.ai/docs
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'anthropic/claude-sonnet-4-5'; // verified slug at openrouter.ai/models

/**
 * Call the OpenRouter Chat Completions API (OpenAI-compatible format).
 *
 * OpenRouter request shape:
 *   POST https://openrouter.ai/api/v1/chat/completions
 *   Authorization: Bearer <OPENROUTER_API_KEY>
 *   HTTP-Referer: <app URL>          (recommended by OpenRouter for attribution)
 *   X-Title: <app name>              (recommended by OpenRouter for attribution)
 *   Body: { model, messages: [{role, content}] }
 *
 * OpenRouter response shape (OpenAI-style):
 *   { choices: [{ message: { role, content }, finish_reason }] }
 *   — unlike Anthropic's native API which returns { content: [{ type, text }] }
 *
 * @returns {Promise<string>} raw text content from the LLM response
 */
function callOpenRouterAPI(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key') {
      return reject(new Error('OPENROUTER_API_KEY is not configured. Get a free key at openrouter.ai/keys'));
    }

    // OpenAI-compatible message format: system and user as separate message objects
    const body = JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: 512,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,          // OpenAI-style Bearer token auth
        'HTTP-Referer':  process.env.CLIENT_URL || 'http://localhost:5173', // OpenRouter attribution
        'X-Title':       'HelperHub',                 // OpenRouter attribution
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(OPENROUTER_API_URL, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          // OpenRouter surfaces API-level errors in parsed.error
          if (parsed.error) {
            return reject(new Error(`OpenRouter error (${parsed.error.code}): ${parsed.error.message}`));
          }

          // OpenAI-compatible response: choices[0].message.content
          const text = parsed.choices?.[0]?.message?.content;
          if (!text) return reject(new Error('Empty or unexpected response from OpenRouter'));
          resolve(text.trim());
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response: ' + e.message));
        }
      });
    });

    req.on('error', (e) => reject(new Error('Network error calling OpenRouter: ' + e.message)));
    req.write(body);
    req.end();
  });
}

/**
 * Parse and strictly validate the structured JSON output from the LLM.
 * Returns the validated object or throws a descriptive error.
 *
 * This validation is provider-agnostic — it enforces the contract regardless
 * of whether we're using OpenRouter, Anthropic directly, or any other LLM.
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
    const rawText = await callOpenRouterAPI(SYSTEM_PROMPT, userPrompt);
    const estimate = parseAndValidateEstimate(rawText);

    res.json({
      success: true,
      estimate,
      meta: {
        provider: 'openrouter',
        model: OPENROUTER_MODEL,
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
