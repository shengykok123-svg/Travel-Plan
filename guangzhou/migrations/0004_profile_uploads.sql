-- China phone number, per-city room info, uploaded photos
ALTER TABLE members ADD COLUMN cn_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN room_info TEXT NOT NULL DEFAULT '{}';
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  data BLOB NOT NULL,
  created_at INTEGER NOT NULL
);
