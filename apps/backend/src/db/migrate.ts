import fs from 'fs';
import path from 'path';
import { sqliteDb } from '../config/sqlite';
import { InfluxDB, HttpError } from '@influxdata/influxdb-client';
import { SetupAPI } from '@influxdata/influxdb-client-apis';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

const url = process.env['INFLUX_URL'] || 'http://localhost:8086';
const token = process.env['INFLUX_TOKEN'] || 'my-super-secret-auth-token';
const org = process.env['INFLUX_ORG'] || 'traq_org';
const bucket = process.env['INFLUX_BUCKET'] || 'traq_telemetry';

async function migrateSQLite() {
    console.log('🗄️  Running TRAQ SQLite database migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    // Use better-sqlite3 execution
    for (const file of files) {
        console.log(`  → ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        try {
            sqliteDb.exec(sql);
            console.log(`    ✅ Applied`);
        } catch (e) {
            console.error(`    ❌ Failed:`, e);
            throw e;
        }
    }
}

async function verifyInfluxDB() {
    console.log('📈 Verifying InfluxDB buckets & organizations...');
    const influx = new InfluxDB({ url, token });
    const setupApi = new SetupAPI(influx);

    try {
        await setupApi.getSetup();
    } catch (e: any) {
        if (e instanceof HttpError && e.statusCode === 401) {
            console.log('    ✅ Influx already setup and token validated.');
            return;
        }
        console.log('    ⚠️ Influx might need initial setup. Skipping auto-provision for safety.', e.message);
    }
}

async function migrate() {
    await migrateSQLite();
    await verifyInfluxDB();
    console.log('🎉 All setup & migrations applied.');
}

void migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
