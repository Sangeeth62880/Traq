// Traq — InfluxDB Integration | Make-a-Ton 2026
/**
 * influxService.js
 * Communicates with InfluxDB Cloud via Flux queries + native fetch().
 *
 * REAL DB SCHEMA (confirmed from live bucket):
 *   bucket:      density-reading
 *   measurement: crowd_data
 *   tags:
 *     train       — train number  e.g. "12626"
 *     train_name  — train name     e.g. "Kerala_Express"
 *     coach       — coach/compartment e.g. "G1"
 *     location    — optional location tag e.g. "hall1"
 *   fields:
 *     people      — integer: current headcount (primary)
 *     density     — float: crowd density
 *     ble         — integer: BLE device count
 *     wifi        — integer: Wi-Fi device count
 *     rf          — integer: RF tag count
 */

import { sensorData } from '../data/sensorData'

// ── Connection constants ──────────────────────────────────────────────────────
const INFLUX_URL = 'https://us-east-1-1.aws.cloud2.influxdata.com'
const INFLUX_ORG = '1537318cd43c7ef4'
const INFLUX_TOKEN = 'W1yj6PRq_6q7tCkVL9EBUvRNYa0OSI8lJ-ngRGJSMTSsyHvSQAvobQ0jWSroPC4wRI4LiY47LGjND4BWpvi8Aw=='
const BUCKET = 'density-reading'
const QUERY_URL = `${INFLUX_URL}/api/v2/query?org=${INFLUX_ORG}`

// ── Boarding status from occupancy ratio ──────────────────────────────────────
function boardingStatus(ratio) {
    if (ratio < 0.40) return 'Board Now'
    if (ratio < 0.65) return 'Comfortable'
    if (ratio < 0.80) return 'Filling Up'
    if (ratio < 0.85) return 'Almost Full'
    if (ratio < 1.00) return 'Avoid'
    return 'Overcrowded'
}

// ── Annotated CSV parser ──────────────────────────────────────────────────────
// InfluxDB returns multi-table annotated CSV. Each table starts with fresh
// #group/#datatype/#default lines followed by a header row, then data rows.
// We reset headers each time we see a new non-# header line.
export function parseInfluxCSV(csvText) {
    const results = []
    const lines = csvText.split('\n')
    let headers = null

    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue   // blank separator between tables
        if (line.startsWith('#')) continue   // annotation row

        const cols = line.split(',')

        // A header row: starts with empty string (the result/table annotation col)
        // and contains recognisable field names like "_time", "_value", "_field"
        if (cols[0] === '' && (cols.includes('_time') || cols.includes('_value') || cols.includes('_field') || cols.includes('_start'))) {
            headers = cols
            continue
        }

        if (!headers) continue

        if (cols.length >= headers.length) {
            const obj = {}
            headers.forEach((h, i) => { obj[h.trim()] = (cols[i] ?? '').trim() })
            results.push(obj)
        }
    }

    return results
}

// ── Raw Flux query helper ─────────────────────────────────────────────────────
async function runFluxQuery(fluxQuery) {
    const res = await fetch(QUERY_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${INFLUX_TOKEN}`,
            'Content-Type': 'application/vnd.flux',
            'Accept': 'application/csv',
        },
        body: fluxQuery,
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`InfluxDB HTTP ${res.status}: ${text.slice(0, 300)}`)
    }
    return res.text()
}

// ── Mock fallback ─────────────────────────────────────────────────────────────
function mockFallback(trainNumber) {
    const trainData = sensorData[trainNumber]
    if (!trainData) return []
    return trainData.coaches.map(c => {
        const ratio = c.capacity > 0 ? c.occupancy / c.capacity : 0
        return {
            compartmentId: c.coach,
            coachType: c.type,
            currentCount: c.occupancy,
            capacity: c.capacity,
            occupancyRatio: ratio,
            boardingStatus: boardingStatus(ratio),
            lastUpdated: new Date().toISOString(),
            isLive: false,
        }
    })
}

// ── Build compartment object from a parsed DB row ─────────────────────────────
// The `people` field is the real headcount.
// Capacity is not stored in DB so we default it reasonably (100).
function rowToCompartment(row) {
    const people = Math.round(parseFloat(row['_value'] ?? '0'))
    const capacity = 100   // DB does not store capacity; use default
    const ratio = people / capacity
    return {
        compartmentId: (row['coach'] || 'Coach').trim(),
        coachType: (row['coach'] || 'General').trim(),
        currentCount: people,
        capacity,
        occupancyRatio: Math.min(ratio, 1.1),
        boardingStatus: boardingStatus(ratio),
        lastUpdated: row['_time'] || new Date().toISOString(),
        isLive: true,
    }
}

// ════════════════════════════════════════════════════════════════════════════
// FUNCTION 1 — fetchTrainCrowdData(trainNumber)
// Fetches latest people-count per coach for one train.
// ════════════════════════════════════════════════════════════════════════════
export async function fetchTrainCrowdData(trainNumber) {
    const query = `
from(bucket: "${BUCKET}")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "crowd_data")
  |> filter(fn: (r) => r["train"] == "${trainNumber}")
  |> filter(fn: (r) => r["_field"] == "people")
  |> last()
`.trim()

    try {
        const csv = await runFluxQuery(query)
        const rows = parseInfluxCSV(csv)

        if (rows.length === 0) {
            console.warn(`⚠️ InfluxDB: no data for train ${trainNumber}. Falling back to mock.`)
            return { error: false, data: mockFallback(trainNumber), isLive: false }
        }

        return { error: false, data: rows.map(rowToCompartment), isLive: true }
    } catch (err) {
        console.error('fetchTrainCrowdData error:', err)
        return { error: true, message: err.message, data: mockFallback(trainNumber), isLive: false }
    }
}

// ════════════════════════════════════════════════════════════════════════════
// FUNCTION 2 — fetchStationCrowdData(stationCode)
// ════════════════════════════════════════════════════════════════════════════
export async function fetchStationCrowdData(stationCode) {
    const query = `
from(bucket: "${BUCKET}")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "crowd_data")
  |> filter(fn: (r) => r["location"] == "${stationCode}")
  |> filter(fn: (r) => r["_field"] == "people")
  |> last()
`.trim()

    try {
        const csv = await runFluxQuery(query)
        const rows = parseInfluxCSV(csv)
        if (rows.length === 0) return { error: false, data: [], grouped: {}, isLive: false }

        const grouped = {}
        for (const row of rows) {
            const tn = row['train'] || 'unknown'
            if (!grouped[tn]) grouped[tn] = []
            grouped[tn].push(rowToCompartment(row))
        }
        return { error: false, data: rows.map(rowToCompartment), grouped, isLive: true }
    } catch (err) {
        console.error('fetchStationCrowdData error:', err)
        return { error: true, message: err.message, data: [], grouped: {}, isLive: false }
    }
}

// ════════════════════════════════════════════════════════════════════════════
// FUNCTION 3 — fetchLatestCrowdData()
// ════════════════════════════════════════════════════════════════════════════
export async function fetchLatestCrowdData() {
    const query = `
from(bucket: "${BUCKET}")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "crowd_data")
  |> filter(fn: (r) => r["_field"] == "people")
  |> last()
`.trim()

    try {
        const csv = await runFluxQuery(query)
        const rows = parseInfluxCSV(csv)
        if (rows.length === 0) return { error: false, data: [], grouped: {}, isLive: false }

        const grouped = {}
        for (const row of rows) {
            const tn = row['train'] || 'unknown'
            if (!grouped[tn]) grouped[tn] = []
            grouped[tn].push(rowToCompartment(row))
        }
        return { error: false, data: rows.map(rowToCompartment), grouped, isLive: true }
    } catch (err) {
        console.error('fetchLatestCrowdData error:', err)
        return { error: true, message: err.message, data: [], grouped: {}, isLive: false }
    }
}

// ════════════════════════════════════════════════════════════════════════════
// FUNCTION 4 — fetchCrowdHistory(trainNumber, coachId)
// ════════════════════════════════════════════════════════════════════════════
export async function fetchCrowdHistory(trainNumber, coachId) {
    const query = `
from(bucket: "${BUCKET}")
  |> range(start: -30m)
  |> filter(fn: (r) => r["_measurement"] == "crowd_data")
  |> filter(fn: (r) => r["train"] == "${trainNumber}")
  |> filter(fn: (r) => r["coach"] == "${coachId}")
  |> filter(fn: (r) => r["_field"] == "people")
  |> aggregateWindow(every: 5m, fn: mean)
`.trim()

    try {
        const csv = await runFluxQuery(query)
        const rows = parseInfluxCSV(csv)
        return { error: false, data: rows.map(r => ({ time: r['_time'], currentCount: parseFloat(r['_value'] ?? 0) })) }
    } catch (err) {
        return { error: true, message: err.message, data: [] }
    }
}

// ════════════════════════════════════════════════════════════════════════════
// FUNCTION 5 — fetchAvailableTrains()
// Queries all distinct (train, train_name, coach) combos with latest
// people count — used to populate the live search dropdown.
// ════════════════════════════════════════════════════════════════════════════
export async function fetchAvailableTrains() {
    const query = `
from(bucket: "${BUCKET}")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "crowd_data")
  |> filter(fn: (r) => r["_field"] == "people")
  |> last()
`.trim()

    try {
        const csv = await runFluxQuery(query)
        const rows = parseInfluxCSV(csv)

        if (rows.length === 0) {
            console.warn('⚠️ fetchAvailableTrains: no trains in InfluxDB. Using mock list.')
            return { error: false, data: [], isLive: false }
        }

        // Group by train number
        const byTrain = {}
        for (const row of rows) {
            const tn = (row['train'] || '').trim()
            const trainName = (row['train_name'] || '').trim()
            if (!tn) continue

            if (!byTrain[tn]) {
                byTrain[tn] = {
                    trainNumber: tn,
                    name: trainName.replace(/_/g, ' '),  // e.g. "Kerala_Express" → "Kerala Express"
                    coaches: [],
                    totalCount: 0,
                    totalCapacity: 0,
                    from: '',
                    to: '',
                }
            }

            const count = Math.round(parseFloat(row['_value'] ?? '0'))
            byTrain[tn].coaches.push({
                compartmentId: (row['coach'] || 'Coach').trim(),
                coachType: (row['coach'] || 'General').trim(),
                currentCount: count,
                capacity: 100,
                lastUpdated: row['_time'] || new Date().toISOString(),
            })
            byTrain[tn].totalCount += count
            byTrain[tn].totalCapacity += 100
        }

        return { error: false, data: Object.values(byTrain), isLive: true }
    } catch (err) {
        console.error('fetchAvailableTrains error:', err)
        return { error: true, message: err.message, data: [], isLive: false }
    }
}
