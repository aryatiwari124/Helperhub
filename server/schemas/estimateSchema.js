const estimateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['min_cost', 'max_cost', 'currency', 'reasoning', 'confidence'],
  properties: {
    min_cost: { type: 'integer', minimum: 0 },
    max_cost: { type: 'integer', minimum: 0 },
    currency: { type: 'string', enum: ['INR'] },
    reasoning: { type: 'string', minLength: 1, maxLength: 500 },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
};

function validateEstimate(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Estimate must be a JSON object');
  }

  const { min_cost: minCost, max_cost: maxCost, currency, reasoning, confidence } = value;
  if (!Number.isFinite(minCost) || !Number.isFinite(maxCost)) throw new Error('min_cost and max_cost must be numbers');
  if (!Number.isInteger(minCost) || !Number.isInteger(maxCost)) throw new Error('Costs must be integers');
  if (minCost < 0 || maxCost < 0) throw new Error('Costs cannot be negative');
  if (minCost > maxCost) throw new Error('min_cost must be <= max_cost');
  if (currency !== 'INR') throw new Error('currency must be INR');
  if (typeof reasoning !== 'string' || reasoning.trim().length === 0) throw new Error('reasoning is required');
  if (!['low', 'medium', 'high'].includes(confidence)) throw new Error('confidence must be low, medium, or high');
  return { min_cost: minCost, max_cost: maxCost, currency, reasoning: reasoning.trim(), confidence };
}

module.exports = { estimateSchema, validateEstimate };