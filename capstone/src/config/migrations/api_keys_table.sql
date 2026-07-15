CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL,
  name VARCHAR(255),
  scopes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP
);