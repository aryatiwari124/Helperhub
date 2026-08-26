# LLM API Integration

HelperHub keeps the provider credential on the server. `POST /api/v1/estimate` validates the input, builds prompts, calls OpenRouter, validates the response, and returns a stable API contract.

## Request

```http
POST /api/v1/estimate
Content-Type: application/json

{"serviceType":"Plumber","jobDescription":"Replace a leaking kitchen tap","city":"Pune"}
```

## Integration rules

1. Read the key from `OPENROUTER_API_KEY`; never put it in a `VITE_` variable.
2. Set a timeout and handle provider, network, and parse failures.
3. Use `response_format` with a JSON schema where the provider supports it.
4. Validate again on the server because provider output is untrusted.
5. Return `502` for an upstream/provider contract failure and include `X-Request-ID` for support.

The implementation is in [estimateController.js](../../server/controllers/estimateController.js), with configuration in [env.js](../../server/config/env.js).
