CREATE TABLE IF NOT EXISTS invites (
  token       TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'host',
  expires_at  TEXT NOT NULL,
  accepted_at TEXT,
  created_by  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Base única de leads do piloto. Escrito por POST /api/pilot (público),
-- lido no painel admin via GET /api/pilot.
CREATE TABLE IF NOT EXISTS pilot_leads (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  whatsapp       TEXT NOT NULL,
  properties     TEXT NOT NULL,
  neighborhoods  TEXT NOT NULL,
  current_supply TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
