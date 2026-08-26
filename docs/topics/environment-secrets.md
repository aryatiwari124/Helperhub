# Environment Variables and Secrets Management

Configuration is externalized so code can move between local, CI, and production environments. Copy `server/.env.example` to `server/.env` locally; do not commit `.env`.

Rules:

- Server-only secrets include `JWT_SECRET`, `MONGO_URI`, `OPENROUTER_API_KEY`, Stripe secrets, and SMTP credentials.
- Browser-exposed Vite variables must use `VITE_` and must not contain secrets.
- Production startup validates critical values in [env.js](../../server/config/env.js).
- Use a managed secret store in production, rotate credentials, and grant each service only the permissions it needs.
- Never log tokens, passwords, connection strings, or full provider payloads.
