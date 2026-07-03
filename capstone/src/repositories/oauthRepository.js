const pool = require("../config/db.js");

async function createOAuthAccount(userId, provider, providerUserId) {
  const result = await pool.query(
    `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, provider, providerUserId]
  );
  return result.rows[0];
}

async function findOAuthAccount(provider, providerUserId) {
  const result = await pool.query(
    "SELECT * FROM oauth_accounts WHERE provider = $1 AND provider_user_id = $2",
    [provider, providerUserId]
  );
  return result.rows[0] || null;
}

module.exports = { createOAuthAccount, findOAuthAccount };