const requiredInProduction = [
  'JWT_SECRET',
  'MONGO_URI',
];

const placeholderValues = new Set([
  '',
  'your_jwt_secret_change_this_in_production',
  'your_openrouter_api_key',
]);

function validateEnvironment() {
  if (process.env.NODE_ENV !== 'production') return;

  const missing = requiredInProduction.filter((name) => {
    const value = process.env[name];
    return !value || placeholderValues.has(value);
  });

  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
  }
}

function getConfig() {
  return {
    port: Number(process.env.PORT || 5000),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    llm: {
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
      apiUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
    },
  };
}

module.exports = { getConfig, validateEnvironment };