const crypto = require("crypto");
const { AppError } = require("../middleware/errorHandler.js");
const { createKey } = require("../repositories/keyRepository.js");
const { findKeysByUserId } = require("../repositories/keyRepository.js");
const { deleteKey } = require("../repositories/keyRepository.js");

async function generateKey(userId, name, scopes) {
  const rawKey = crypto.randomBytes(32).toString("hex");
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const key = await createKey(userId, keyHash, name, scopes);

  return {
    id: key.id,
    name: key.name,
    scopes: key.scopes,
    rawKey
  };
}

async function listKeys(userId) {
  const keys = await findKeysByUserId(userId);

  return keys.map(({ key_hash, ...safeKey }) => safeKey);
}



module.exports = generateKey;