-- =============================================================================
-- TRAQ Database Migration 001 — Initial Relational Schema (SQLite)
-- =============================================================================

-- In V2.1, time-series data (coach_occupancy, sensor_fusion) lives in InfluxDB.
-- This SQLite database stores rigid relational data.

-- Device health table
CREATE TABLE IF NOT EXISTS device_health (
  node_id         TEXT PRIMARY KEY,
  train_number    TEXT NOT NULL,
  coach_number    INTEGER NOT NULL,
  battery_pct     INTEGER,
  firmware_version TEXT,
  last_seen       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address      TEXT,
  nrf_status      TEXT DEFAULT 'offline',
  rf_calibrated   BOOLEAN DEFAULT 0,
  status          TEXT DEFAULT 'offline'
);

-- Node API Keys table (for simulator / edge nodes)
CREATE TABLE IF NOT EXISTS node_api_keys (
  node_id         TEXT PRIMARY KEY,
  api_key_hash    TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at    TEXT
);

-- Trains cache (optional persistent fallback for trainDataService)
CREATE TABLE IF NOT EXISTS train_stations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  station_code    TEXT NOT NULL,
  station_name    TEXT NOT NULL,
  city            TEXT
);

-- Seed train data for search fallback
INSERT OR IGNORE INTO train_stations (station_code, station_name, city) VALUES 
  ('CSTM', 'Chhatrapati Shivaji Maharaj Terminus', 'Mumbai'),
  ('DR', 'Dadar Central', 'Mumbai'),
  ('TNA', 'Thane', 'Thane'),
  ('PNVL', 'Panvel', 'Navi Mumbai'),
  ('BCT', 'Mumbai Central', 'Mumbai'),
  ('NDLS', 'New Delhi', 'Delhi'),
  ('HWH', 'Howrah Junction', 'Kolkata'),
  ('MAS', 'Chennai Central', 'Chennai');
