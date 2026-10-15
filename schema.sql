CREATE TABLE IF NOT EXISTS invites (
  token       TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'host',
  expires_at  TEXT NOT NULL,
  accepted_at TEXT,
  created_by  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
