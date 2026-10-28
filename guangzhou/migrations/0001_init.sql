-- Travel plan: members, shared plan, change log, expenses
CREATE TABLE IF NOT EXISTS members (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  color TEXT,
  room TEXT,
  diet TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS plan (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  rev INTEGER NOT NULL,
  updated_at INTEGER,
  updated_by TEXT
);
CREATE TABLE IF NOT EXISTS log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  email TEXT NOT NULL,
  text TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  day TEXT NOT NULL,
  payer TEXT NOT NULL,
  amount REAL NOT NULL,
  cur TEXT NOT NULL,
  descr TEXT NOT NULL,
  split TEXT NOT NULL,
  created_by TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS meta (
  k TEXT PRIMARY KEY,
  v INTEGER NOT NULL
);
