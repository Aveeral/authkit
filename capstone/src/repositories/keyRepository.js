const pool = require("../config/db.js");

async function createKey(userId, keyHash, name, scopes) {
  const result = await pool.query(
    `INSERT INTO api_keys (user_id, key_hash, name, scopes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, keyHash, name, scopes]
  );
  return result.rows[0];
}

async function findKeyByHash(keyHash) {
  const result = await pool.query(
    "SELECT * FROM api_keys WHERE key_hash = $1",
    [keyHash]
  );
  return result.rows[0] || null;
}

async function findKeysByUserId(userId) {
  const result = await pool.query(
    "SELECT * FROM api_keys WHERE user_id = $1",
    [userId]
  );
  return result.rows;
}

async function deleteKey(id, userId) {
  const result = await pool.query(
    "DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  return result.rows[0] || null;
}

async function updateLastUsed(id) {
  await pool.query(
    "UPDATE api_keys SET last_used_at = NOW() WHERE id = $1",
    [id]
  );
}

async function updateKeyHash(id, userId, newKeyHash) {
  const result = await pool.query(
    "UPDATE api_keys SET key_hash = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [newKeyHash, id, userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createKey,
  findKeyByHash,
  findKeysByUserId,
  deleteKey,
  updateLastUsed,
  updateKeyHash
};