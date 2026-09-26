-- Simple accounts: phone + password, cookie sessions, invite code
ALTER TABLE members ADD COLUMN pw_hash TEXT;
ALTER TABLE members ADD COLUMN pw_salt TEXT;
ALTER TABLE members ADD COLUMN fails INTEGER NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN locked_until INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);
