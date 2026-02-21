import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Default to a local db in the monorepo root var array, or test-specific path
const dbPath = process.env['SQLITE_DB_PATH'] || path.resolve(__dirname, '../../../../var/traq_local.db');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

export const sqliteDb = new Database(dbPath, {
    verbose: process.env['NODE_ENV'] === 'development' ? console.log : undefined
});

// Enable WAL mode for better concurrency performance
sqliteDb.pragma('journal_mode = WAL');

console.info(`[DB Core] SQLite initialized at ${dbPath}`);
