# Prompt Engineering

The estimator uses a two-message design in [costEstimation.js](../../server/prompts/costEstimation.js).

- The system prompt defines role, geography, currency, constraints, and confidence criteria.
- The user prompt uses named fields: service type, job description, and city.
- The schema and a valid example reduce format drift.
- User input is bounded before interpolation: description is 10 to 500 characters.

Good prompts make the desired behavior observable. For production prompts, keep the template versioned, test representative inputs, and avoid asking for hidden chain-of-thought. HelperHub asks for a short cost rationale suitable for the user instead.
