/**
 * TRAQ Hardware Simulator
 * Simulates ESP32 + nRF52833 + AD8318/ADS1115 sensor nodes
 * publishing CoachPayload data via MQTT.
 *
 * Usage: pnpm simulate
 *   or:  tsx src/index.ts --trains 5 --coaches 12 --speed 10
 */

import mqtt from 'mqtt';
import dotenv from 'dotenv';
import type {
    CoachPayload,
    SensorFusionResult,
    CoachZone,
} from '@traq/shared-types';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

dotenv.config({ path: '../../../.env' });

// --- Config ---
const MQTT_URL = process.env['MQTT_BROKER_URL'] ?? 'mqtt://localhost:1883';
const TRAIN_COUNT = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--trains') ?? '3', 10);
const COACHES_PER_TRAIN = parseInt(
    process.argv.find((_, i, a) => a[i - 1] === '--coaches') ?? '12',
    10,
);
const SPEED = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--speed') ?? '1', 10);
const INTERVAL_MS = (30 * 1000) / SPEED; // 30s real → adjusted by speed

// --- Influx Config ---
const influxUrl = process.env['INFLUX_URL'] || 'http://localhost:8086';
const influxToken = process.env['INFLUX_TOKEN'] || 'my-super-secret-auth-token';
const influxOrg = process.env['INFLUX_ORG'] || 'traq_org';
const influxBucket = process.env['INFLUX_BUCKET'] || 'traq_telemetry';

const influxDB = new InfluxDB({ url: influxUrl, token: influxToken });
const writeApi = influxDB.getWriteApi(influxOrg, influxBucket, 's'); // Precision: seconds

// --- Realistic Occupancy Patterns ---
function getBaseOccupancy(hour: number): number {
    if (hour >= 7 && hour < 10) return 70 + Math.random() * 25; // morning peak
    if (hour >= 10 && hour < 16) return 30 + Math.random() * 30; // midday
    if (hour >= 17 && hour < 21) return 75 + Math.random() * 20; // evening peak
    return 10 + Math.random() * 20; // night
}

function randomZoneDistribution(total: number): Record<CoachZone, number> {
    const doorA = Math.round(total * (0.2 + Math.random() * 0.1));
    const doorB = Math.round(total * (0.2 + Math.random() * 0.1));
    const middle = total - doorA - doorB;
    return { door_a: doorA, middle: Math.max(0, middle), door_b: doorB, unknown: 0 };
}

function buildPayload(trainNum: string, coach: number, battery: number): CoachPayload {
    const hour = new Date().getHours();
    const occ = Math.min(100, Math.max(0, Math.round(getBaseOccupancy(hour) + (Math.random() - 0.5) * 10)));
    const bleCount = Math.round(occ * 0.72 * (0.9 + Math.random() * 0.2));
    const rfEstimate = Math.round(occ * (0.85 + Math.random() * 0.3));
    const ticketed = Math.round(bleCount * (0.6 + Math.random() * 0.3));

    const fusion: SensorFusionResult = {
        occupancy_pct: occ,
        ticketed_count: ticketed,
        total_ble_count: bleCount,
        rf_occupancy_estimate: Math.min(100, rfEstimate),
        zone_distribution: randomZoneDistribution(bleCount),
        fusion_confidence: 0.6 + Math.random() * 0.35,
        sensors_active: {
            ble_scanner: Math.random() > 0.02,
            rf_power: Math.random() > 0.05,
            aoa: Math.random() > 0.1,
        },
    };

    return {
        node_id: `TRQ-${trainNum}-C${String(coach).padStart(2, '0')}`,
        train_number: trainNum,
        coach_number: coach,
        occupancy_pct: occ,
        ticketed_count: ticketed,
        total_detected: bleCount,
        fusion,
        battery_pct: Math.max(0, Math.round(battery * 10) / 10),
        firmware_version: '1.0.0',
        timestamp: Math.floor(Date.now() / 1000),
    };
}

// --- Main ---
const client = mqtt.connect(MQTT_URL);
const batteries: Record<string, number> = {};
const trains = Array.from({ length: TRAIN_COUNT }, (_, i) => String(10001 + i));

console.log(`influxDB init: URL=${influxUrl}, Bucket=${influxBucket}`);

client.on('connect', () => {
    console.log(`🔌 Connected to MQTT at ${MQTT_URL}`);
    console.log(`🚂 Simulating ${TRAIN_COUNT} trains × ${COACHES_PER_TRAIN} coaches = ${TRAIN_COUNT * COACHES_PER_TRAIN} nodes`);
    console.log(`⚡ Speed: ${SPEED}x (publishing every ${INTERVAL_MS}ms)`);

    // Initialize batteries
    for (const train of trains) {
        for (let c = 1; c <= COACHES_PER_TRAIN; c++) {
            batteries[`${train}-${c}`] = 85 + Math.random() * 15;
        }
    }

    // Publish loop
    setInterval(() => {
        for (const train of trains) {
            for (let c = 1; c <= COACHES_PER_TRAIN; c++) {
                const key = `${train}-${c}`;
                const bat = batteries[key];
                if (bat === undefined) continue;
                batteries[key] = Math.max(0, bat - 0.1 / SPEED);

                const payload = buildPayload(train, c, bat);
                const topic = `traq/trains/${train}/coaches/${c}`;
                client.publish(topic, JSON.stringify(payload), { qos: 1 });

                // Push to InfluxDB
                const point = new Point('coach_occupancy')
                    .tag('train_number', payload.train_number)
                    .tag('coach_number', String(payload.coach_number))
                    .tag('node_id', payload.node_id)
                    .floatField('occupancy_pct', payload.occupancy_pct)
                    .intField('ticketed', payload.ticketed_count)
                    .intField('total', payload.total_detected)
                    .floatField('battery_pct', payload.battery_pct)
                    .floatField('fusion_confidence', payload.fusion.fusion_confidence)
                    .timestamp(new Date(payload.timestamp * 1000));

                writeApi.writePoint(point);
            }
        }
        writeApi.flush().catch((err) => console.error('InfluxDB Flush Error:', err));

        const ts = new Date().toISOString().split('T')[1]?.split('.')[0] ?? '';
        console.log(`📡 [${ts}] Published ${TRAIN_COUNT * COACHES_PER_TRAIN} payloads`);
    }, INTERVAL_MS);
});

client.on('error', (err) => {
    console.error('MQTT error:', err.message);
});
