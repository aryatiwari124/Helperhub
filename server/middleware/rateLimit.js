const buckets = new Map();

function createRateLimit({ windowMs = 60_000, max = 30 } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = buckets.get(key);
    const bucket = !current || now - current.startedAt >= windowMs
      ? { startedAt: now, count: 0 }
      : current;

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      const retryAfter = Math.ceil((windowMs - (now - bucket.startedAt)) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again shortly.',
        requestId: req.requestId,
      });
    }

    next();
  };
}

module.exports = { createRateLimit };