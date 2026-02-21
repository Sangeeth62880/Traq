import axios from 'axios';
import { CONFIG } from '../config/constants';

// ============================================================
// INFLUXDB SCHEMA (confirmed from real data):
//
//   Bucket: density-reading
//   Tags:   train (string)      → train number, e.g., "12626"
//           train_name (string) → train name, e.g., "Kerala_Express"
//   Fields: people (double)     → people count detected by IoT sensor
//           rf (double)         → RF signal (not used)
//           wifi (double)       → WiFi count (not used)
// ============================================================

const influxClient = axios.create({
    baseURL: CONFIG.influx.url,
    timeout: 15000,
    headers: {
        'Authorization': `Token ${CONFIG.influx.token}`,
        'Content-Type': 'application/vnd.flux',
        'Accept': 'application/csv',
    },
});

export interface TrainReading {
    trainNumber: string;      // from "train" tag
    trainName: string;        // from "train_name" tag
    peopleCount: number;      // from "people" field
    timestamp: Date;          // from "_time"
    rf: number;               // from "rf" field (optional)
    wifi: number;             // from "wifi" field (optional)
}

export interface TrainSummary {
    trainNumber: string;
    trainName: string;
    displayName: string;      // "Kerala Express" (formatted with spaces)
    latestPeopleCount: number;
    readings: TrainReading[];  // historical readings
    lastUpdated: Date;
}

// ============================================================
// FLUX QUERY EXECUTION
// ============================================================

async function executeQuery(fluxQuery: string): Promise<TrainReading[]> {
    try {
        console.log('[InfluxDB] Executing query...');
        const response = await influxClient.post(
            '/api/v2/query',
            fluxQuery,
            { params: { org: CONFIG.influx.org } }
        );

        if (typeof response.data !== 'string') {
            console.warn('[InfluxDB] Unexpected response type:', typeof response.data);
            return [];
        }

        return parseCsvToReadings(response.data);
    } catch (error: any) {
        console.error('[InfluxDB] Query error:', error.message);
        if (error.response) {
            console.error('[InfluxDB] Status:', error.response.status);
            console.error('[InfluxDB] Body:', error.response.data?.toString().substring(0, 500));
        }
        return [];
    }
}

function parseCsvToReadings(csv: string): TrainReading[] {
    const lines = csv.split('\n');
    const readings: TrainReading[] = [];
    let headers: string[] | null = null;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and InfluxDB annotations (lines starting with #)
        if (!trimmed || trimmed.startsWith('#')) {
            if (!trimmed) headers = null; // Reset headers for new table
            continue;
        }

        const values = splitCsvLine(trimmed);

        // First non-annotation, non-empty line after a reset is the header row
        if (!headers) {
            headers = values;
            console.log('[InfluxDB] CSV headers:', headers);
            continue;
        }

        // Parse data row
        if (values.length >= headers.length) {
            const row: Record<string, string> = {};
            for (let i = 0; i < headers.length; i++) {
                row[headers[i]] = values[i] || '';
            }

            // Extract using EXACT known column names from Flux result
            // Note: InfluxDB flux queries return the field value in `_value`
            // since we filter by `r["_field"] == "people"`.
            const trainNumber = row['train'] || '';
            const trainName = row['train_name'] || '';

            // If the row is specifically the 'people' field
            let peopleValueStr = '0';
            if (row['_field'] === 'people') {
                peopleValueStr = row['_value'] || '0';
            } else if (row['people']) {
                // Fallback just in case a pivot was used or it comes as 'people' directly
                peopleValueStr = row['people'];
            }

            const people = parseFloat(peopleValueStr);
            const rf = parseFloat(row['rf'] || row['_field'] === 'rf' ? row['_value'] : '0');
            const wifi = parseFloat(row['wifi'] || row['_field'] === 'wifi' ? row['_value'] : '0');
            const time = row['_time'] || '';

            if (trainNumber || trainName) {
                const parsedPeople = isNaN(people) ? 0 : Math.round(people);
                console.log(`[InfluxDB] Raw people count parsed for train ${trainNumber}:`, parsedPeople);

                readings.push({
                    trainNumber,
                    trainName,
                    peopleCount: parsedPeople,
                    timestamp: time ? new Date(time) : new Date(),
                    rf: isNaN(rf) ? 0 : rf,
                    wifi: isNaN(wifi) ? 0 : wifi,
                });
            }
        }
    }

    console.log(`[InfluxDB] Parsed ${readings.length} readings`);
    return readings;
}

function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// ============================================================
// PUBLIC API: FETCH TRAIN DATA
// ============================================================

/**
 * Get the latest reading for ALL trains that have reported data recently.
 * Used for the initial dashboard view and train search suggestions.
 */
export async function getAllActiveTrains(): Promise<TrainSummary[]> {
    const fluxQuery = `
from(bucket: "${CONFIG.influx.bucket}")
  |> range(start: -2h)
  |> filter(fn: (r) => r["_field"] == "people")
  |> last()
`;

    const readings = await executeQuery(fluxQuery);
    if (readings.length === 0) return [];

    // Group by train number
    const trainMap = new Map<string, TrainReading[]>();
    for (const reading of readings) {
        const key = reading.trainNumber || reading.trainName;
        if (!trainMap.has(key)) trainMap.set(key, []);
        trainMap.get(key)!.push(reading);
    }

    const summaries: TrainSummary[] = [];
    for (const [, trainReadings] of trainMap) {
        // Get the latest reading
        const latest = trainReadings.reduce((a, b) =>
            a.timestamp > b.timestamp ? a : b
        );

        summaries.push({
            trainNumber: latest.trainNumber,
            trainName: latest.trainName,
            displayName: formatTrainName(latest.trainName),
            latestPeopleCount: latest.peopleCount,
            readings: trainReadings,
            lastUpdated: latest.timestamp,
        });
    }

    console.log(`[InfluxDB] Found ${summaries.length} active trains`);
    return summaries;
}

/**
 * Get data for a SPECIFIC train, searched by either number or name.
 *
 * @param searchInput - Can be a train number ("12626") or name ("Kerala")
 */
export async function getTrainData(searchInput: string): Promise<TrainSummary | null> {
    const trimmed = searchInput.trim();
    if (!trimmed) return null;

    // Determine if input is a number or a name
    const isNumber = /^\d+$/.test(trimmed);

    let filterClause: string;
    if (isNumber) {
        // Search by train number (exact match on "train" tag)
        filterClause = `|> filter(fn: (r) => r["train"] == "${trimmed}")`;
        console.log(`[InfluxDB] Searching by train number: ${trimmed}`);
    } else {
        // Search by train name (contains match on "train_name" tag)
        // InfluxDB Flux doesn't support LIKE, so we fetch all and filter in JS
        // For exact match: r["train_name"] == "Kerala_Express"
        // For partial: we fetch all and filter below
        const underscored = trimmed.replace(/\s+/g, '_');
        filterClause = `|> filter(fn: (r) => r["train_name"] =~ /(?i)${escapeRegex(underscored)}/)`;
        console.log(`[InfluxDB] Searching by train name: ${underscored}`);
    }

    const fluxQuery = `
from(bucket: "${CONFIG.influx.bucket}")
  |> range(start: -6h)
  |> filter(fn: (r) => r["_field"] == "people")
  ${filterClause}
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 50)
`;

    const readings = await executeQuery(fluxQuery);

    if (readings.length === 0) {
        console.log(`[InfluxDB] No data found for "${trimmed}"`);

        // If regex search failed, try fetching all and filtering in JS
        if (!isNumber) {
            return await getTrainDataByNameFallback(trimmed);
        }
        return null;
    }

    const latest = readings[0]; // Already sorted desc

    const summary: TrainSummary = {
        trainNumber: latest.trainNumber,
        trainName: latest.trainName,
        displayName: formatTrainName(latest.trainName),
        latestPeopleCount: latest.peopleCount,
        readings: readings,
        lastUpdated: latest.timestamp,
    };

    console.log(`[InfluxDB] ✅ Found train: ${summary.trainNumber} - ${summary.displayName}, People: ${summary.latestPeopleCount}`);
    return summary;
}

/**
 * Fallback: fetch all recent data and search by name in JavaScript.
 * Used when Flux regex doesn't match.
 */
async function getTrainDataByNameFallback(searchName: string): Promise<TrainSummary | null> {
    console.log(`[InfluxDB] Fallback: searching all trains for name containing "${searchName}"`);

    const fluxQuery = `
from(bucket: "${CONFIG.influx.bucket}")
  |> range(start: -6h)
  |> filter(fn: (r) => r["_field"] == "people")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 200)
`;

    const readings = await executeQuery(fluxQuery);
    if (readings.length === 0) return null;

    const searchLower = searchName.toLowerCase().replace(/[_\s]+/g, '');

    // Filter readings where train_name contains the search term
    const matched = readings.filter((r) => {
        const name = r.trainName.toLowerCase().replace(/[_\s]+/g, '');
        return name.includes(searchLower);
    });

    if (matched.length === 0) {
        console.log(`[InfluxDB] No train name matches "${searchName}"`);
        // Log available train names for debugging
        const names = [...new Set(readings.map((r) => r.trainName))];
        console.log('[InfluxDB] Available train names:', names);
        return null;
    }

    const latest = matched[0];
    const trainReadings = matched.filter(
        (r) => r.trainNumber === latest.trainNumber
    );

    return {
        trainNumber: latest.trainNumber,
        trainName: latest.trainName,
        displayName: formatTrainName(latest.trainName),
        latestPeopleCount: latest.peopleCount,
        readings: trainReadings,
        lastUpdated: latest.timestamp,
    };
}

/**
 * Get the people count history for a specific train over the last N hours.
 * For charts and trend visualization.
 */
export async function getTrainHistory(
    trainNumber: string,
    hoursBack: number = 6
): Promise<TrainReading[]> {
    const fluxQuery = `
from(bucket: "${CONFIG.influx.bucket}")
  |> range(start: -${hoursBack}h)
  |> filter(fn: (r) => r["_field"] == "people")
  |> filter(fn: (r) => r["train"] == "${trainNumber}")
  |> sort(columns: ["_time"], desc: false)
`;

    return await executeQuery(fluxQuery);
}

/**
 * Get all DISTINCT train numbers and names from recent data.
 * Used for search autocomplete / suggestions.
 */
export async function getAvailableTrains(): Promise<Array<{
    trainNumber: string;
    trainName: string;
    displayName: string;
}>> {
    const fluxQuery = `
from(bucket: "${CONFIG.influx.bucket}")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_field"] == "people")
  |> last()
  |> keep(columns: ["train", "train_name"])
`;

    const readings = await executeQuery(fluxQuery);

    const trainMap = new Map<string, { trainNumber: string; trainName: string }>();
    for (const r of readings) {
        if (!trainMap.has(r.trainNumber)) {
            trainMap.set(r.trainNumber, {
                trainNumber: r.trainNumber,
                trainName: r.trainName,
            });
        }
    }

    const result = Array.from(trainMap.values()).map((t) => ({
        ...t,
        displayName: formatTrainName(t.trainName),
    }));

    console.log(`[InfluxDB] Available trains:`, result);
    return result;
}

/**
 * Test InfluxDB connection by querying for any recent data.
 */
export async function testConnection(): Promise<{
    connected: boolean;
    trainCount: number;
    sampleTrain: string | null;
}> {
    try {
        const trains = await getAvailableTrains();
        return {
            connected: trains.length > 0,
            trainCount: trains.length,
            sampleTrain: trains.length > 0
                ? `${trains[0].trainNumber} - ${trains[0].displayName}`
                : null,
        };
    } catch {
        return { connected: false, trainCount: 0, sampleTrain: null };
    }
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Format train name from InfluxDB format (underscores) to display format (spaces).
 * "Kerala_Express" → "Kerala Express"
 */
function formatTrainName(name: string): string {
    if (!name) return 'Unknown Train';
    return name.replace(/_/g, ' ');
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
