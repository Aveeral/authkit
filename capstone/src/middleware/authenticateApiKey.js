const crypto = require("crypto");
const { AppError } = require("./errorHandler.js");
const { findKeyByHash, updateLastUsed } = require("../repositories/keyRepository.js");

async function authenticateApiKey(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authorization header missing", 401);
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AppError("Invalid authorization header format", 401);
    }

    const rawKey = parts[1];

    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const key = await findKeyByHash(keyHash);

    if (!key) {
      throw new AppError("Invalid API key", 401);
    }

    req.user = {
      id: key.id,
      userId: key.user_id,
      scopes: key.scopes,
      name: key.name
    };

    updateLastUsed(key.id).catch(err =>
      console.error("Failed to update last_used_at:", err)
    );

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticateApiKey };