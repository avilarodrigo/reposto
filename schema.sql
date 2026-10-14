CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'host' CHECK (role IN ('host','admin')),
  whatsapp    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invites (
  token       TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'host',
  expires_at  TEXT NOT NULL,
  accepted_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS properties (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id);

CREATE TABLE IF NOT EXISTS stock_items (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sku_id      TEXT NOT NULL,
  name        TEXT NOT NULL,
  detail      TEXT,
  category    TEXT NOT NULL,
  pct         INTEGER NOT NULL DEFAULT 100,
  threshold   INTEGER NOT NULL DEFAULT 30,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stock_property ON stock_items(property_id);
