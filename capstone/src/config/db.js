const { Pool } = require("pg");
const { DATABASE_URL, NODE_ENV } = require("./env.js");

let sslConfig;
if (NODE_ENV === "production") {
  sslConfig = { rejectUnauthorized: true };
} else {
  sslConfig = { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: sslConfig
});

module.exports = pool;