# Middleware

Express middleware runs in order and can enrich a request, reject it, or pass control with `next()`.

HelperHub now demonstrates four reusable concerns:

- `requestId.js` creates or preserves `X-Request-ID` for tracing.
- `asyncHandler.js` forwards rejected promises to the error handler.
- `rateLimit.js` bounds expensive estimator calls per IP.
- The server-level readiness middleware returns `503` while MongoDB is unavailable.

Keep middleware focused. Authentication belongs in auth middleware, validation belongs near a route, and the final error handler should avoid leaking stack traces in production.
