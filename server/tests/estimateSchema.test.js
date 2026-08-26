const assert = require('assert');
const { parseAndValidateEstimate } = require('../controllers/estimateController');

const valid = parseAndValidateEstimate(JSON.stringify({
  min_cost: 400,
  max_cost: 800,
  currency: 'INR',
  reasoning: 'Common repair',
  confidence: 'high',
}));
assert.strictEqual(valid.min_cost, 400);
assert.strictEqual(valid.max_cost, 800);

assert.throws(
  () => parseAndValidateEstimate(JSON.stringify({
    min_cost: 900,
    max_cost: 100,
    currency: 'INR',
    reasoning: 'Invalid range',
    confidence: 'low',
  })),
  /min_cost must be <= max_cost/
);

assert.throws(
  () => parseAndValidateEstimate(JSON.stringify({
    min_cost: 100.5,
    max_cost: 200,
    currency: 'INR',
    reasoning: 'Fractional values are not allowed',
    confidence: 'medium',
  })),
  /Costs must be integers/
);

console.log('estimate schema contract tests passed');
