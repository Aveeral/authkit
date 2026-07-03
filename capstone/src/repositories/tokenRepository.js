const pool = require("../config/db.js");

async function createRefreshToken(userId, tokenHash, expiresAt) {
  const result = await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *",
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

async function findRefreshTokenByHash(tokenHash) {
  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token_hash = $1",
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function deleteRefreshTokenByHash(tokenHash) {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE token_hash = $1 RETURNING *",
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function deleteExpiredTokens() {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE expires_at < NOW()"
  );
  return result.rowCount;
}

module.exports = {
  createRefreshToken,
  findRefreshTokenByHash,
  deleteRefreshTokenByHash,
  deleteExpiredTokens
};