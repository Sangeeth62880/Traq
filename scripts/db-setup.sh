#!/bin/bash
# =============================================================================
# TRAQ — Database Setup Script
# =============================================================================
# Runs all database migrations against the configured PostgreSQL instance.
# Usage: make db:setup
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load env vars safely
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

DATABASE_URL="${DATABASE_URL:-postgresql://traq:password@localhost:5432/traq_db}"

echo "🗄️  Running TRAQ database setup (SQLite/InfluxDB)..."
pnpm --filter backend run db:migrate

echo "✅ Database setup complete."
