const { AppError } = require("./errorHandler.js");

function requireScope(requiredScope) {
  return (req, res, next) => {
    const scopes = req.user?.scopes;

    if (!scopes || !scopes.includes(requiredScope)) {
      return next(new AppError(`Missing required scope: ${requiredScope}`, 403));
    }

    next();
  };
}

module.exports = { requireScope };