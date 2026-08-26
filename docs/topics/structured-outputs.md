# Structured Outputs

Structured output means the application receives data matching a contract, not prose that it must guess how to parse. HelperHub defines the contract once in [estimateSchema.js](../../server/schemas/estimateSchema.js) and sends the same JSON Schema to OpenRouter.

The server still parses and validates the returned text. It rejects missing fields, extra provider drift, invalid currency, negative costs, reversed ranges, and unsupported confidence values. This defense-in-depth pattern is important because schemas requested from an LLM are not a substitute for application validation.

The public response is stable:

```json
{"success":true,"estimate":{"min_cost":400,"max_cost":800,"currency":"INR","reasoning":"...","confidence":"high"}}
```
