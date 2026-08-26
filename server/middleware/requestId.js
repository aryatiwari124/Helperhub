const crypto = require('crypto');

const requestId = (req, res, next) => {
  const id = req.get('X-Request-ID') || crypto.randomUUID();
  req.requestId = id;
  res.set('X-Request-ID', id);
  next();
};

module.exports = requestId;