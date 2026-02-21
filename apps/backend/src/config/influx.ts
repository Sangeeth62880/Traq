import { InfluxDB, Point } from '@influxdata/influxdb-client';

const url = process.env['INFLUX_URL'] || 'http://localhost:8086';
const token = process.env['INFLUX_TOKEN'] || 'my-super-secret-auth-token';
export const org = process.env['INFLUX_ORG'] || 'traq_org';
export const bucket = process.env['INFLUX_BUCKET'] || 'traq_telemetry';

export const influxDB = new InfluxDB({ url, token });

// Export common API clients
export const writeApi = influxDB.getWriteApi(org, bucket, 'ns');
export const queryApi = influxDB.getQueryApi(org);

console.info(`[InfluxDB Core] Initialized connection to ${url}`);
