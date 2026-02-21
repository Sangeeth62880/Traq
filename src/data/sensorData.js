// Traq — Make-a-Ton 2026 | IoT sensor data per coach per train

/**
 * Sensor data structure per train:
 *   trainNo → { totalCapacity, coaches: [...] }
 *
 * Each coach:
 *   coach    — label shown in UI  (e.g. "GEN-1", "S1", "B1", "A1")
 *   type     — human label        (e.g. "General", "Sleeper", "AC 3-Tier")
 *   capacity — max passengers
 *   occupancy — current headcount from sensor
 *   sensorId — IoT sensor identifier
 *   status   — 'online' | 'offline'
 */

export const sensorData = {
    // ── Deccan Express ────────────────────────────────────────────
    '11001': {
        totalCapacity: 1800,
        coaches: [
            { coach: 'GEN-1', type: 'General', capacity: 200, occupancy: 196, sensorId: 'SN-G1', status: 'online' },
            { coach: 'GEN-2', type: 'General', capacity: 200, occupancy: 188, sensorId: 'SN-G2', status: 'online' },
            { coach: 'S1', type: 'Sleeper', capacity: 72, occupancy: 68, sensorId: 'SN-S1', status: 'online' },
            { coach: 'S2', type: 'Sleeper', capacity: 72, occupancy: 42, sensorId: 'SN-S2', status: 'online' },
            { coach: 'S3', type: 'Sleeper', capacity: 72, occupancy: 27, sensorId: 'SN-S3', status: 'online' },
            { coach: 'B1', type: 'AC 3-Tier', capacity: 64, occupancy: 64, sensorId: 'SN-B1', status: 'online' },
            { coach: 'B2', type: 'AC 3-Tier', capacity: 64, occupancy: 55, sensorId: 'SN-B2', status: 'online' },
            { coach: 'A1', type: 'AC 2-Tier', capacity: 46, occupancy: 44, sensorId: 'SN-A1', status: 'online' },
        ],
    },
    // ── Intercity Express ─────────────────────────────────────────
    '12127': {
        totalCapacity: 1600,
        coaches: [
            { coach: 'GEN-1', type: 'General', capacity: 200, occupancy: 152, sensorId: 'SN-G1', status: 'online' },
            { coach: 'GEN-2', type: 'General', capacity: 200, occupancy: 144, sensorId: 'SN-G2', status: 'online' },
            { coach: 'S1', type: 'Sleeper', capacity: 72, occupancy: 50, sensorId: 'SN-S1', status: 'online' },
            { coach: 'S2', type: 'Sleeper', capacity: 72, occupancy: 48, sensorId: 'SN-S2', status: 'online' },
            { coach: 'B1', type: 'AC 3-Tier', capacity: 64, occupancy: 38, sensorId: 'SN-B1', status: 'online' },
            { coach: 'A1', type: 'AC 2-Tier', capacity: 46, occupancy: 22, sensorId: 'SN-A1', status: 'offline' },
        ],
    },
    // ── Madgaon Superfast Express ─────────────────────────────────
    '22109': {
        totalCapacity: 1400,
        coaches: [
            { coach: 'GEN-1', type: 'General', capacity: 200, occupancy: 80, sensorId: 'SN-G1', status: 'online' },
            { coach: 'S1', type: 'Sleeper', capacity: 72, occupancy: 40, sensorId: 'SN-S1', status: 'online' },
            { coach: 'S2', type: 'Sleeper', capacity: 72, occupancy: 38, sensorId: 'SN-S2', status: 'online' },
            { coach: 'B1', type: 'AC 3-Tier', capacity: 64, occupancy: 30, sensorId: 'SN-B1', status: 'online' },
            { coach: 'A1', type: 'AC 2-Tier', capacity: 46, occupancy: 18, sensorId: 'SN-A1', status: 'online' },
        ],
    },
    // ── Mumbai Rajdhani Express ───────────────────────────────────
    '12951': {
        totalCapacity: 1300,
        coaches: [
            { coach: 'A1', type: 'AC 1st', capacity: 18, occupancy: 18, sensorId: 'SN-A1', status: 'online' },
            { coach: '2A-1', type: 'AC 2-Tier', capacity: 46, occupancy: 44, sensorId: 'SN-2A1', status: 'online' },
            { coach: '2A-2', type: 'AC 2-Tier', capacity: 46, occupancy: 40, sensorId: 'SN-2A2', status: 'online' },
            { coach: '3A-1', type: 'AC 3-Tier', capacity: 64, occupancy: 62, sensorId: 'SN-3A1', status: 'online' },
            { coach: '3A-2', type: 'AC 3-Tier', capacity: 64, occupancy: 58, sensorId: 'SN-3A2', status: 'online' },
            { coach: '3A-3', type: 'AC 3-Tier', capacity: 64, occupancy: 54, sensorId: 'SN-3A3', status: 'online' },
        ],
    },
    // ── Karnataka Sampark Kranti ──────────────────────────────────
    '12650': {
        totalCapacity: 1100,
        coaches: [
            { coach: 'S1', type: 'Sleeper', capacity: 72, occupancy: 65, sensorId: 'SN-S1', status: 'online' },
            { coach: 'S2', type: 'Sleeper', capacity: 72, occupancy: 58, sensorId: 'SN-S2', status: 'online' },
            { coach: 'S3', type: 'Sleeper', capacity: 72, occupancy: 48, sensorId: 'SN-S3', status: 'online' },
            { coach: 'B1', type: 'AC 3-Tier', capacity: 64, occupancy: 60, sensorId: 'SN-B1', status: 'online' },
            { coach: 'B2', type: 'AC 3-Tier', capacity: 64, occupancy: 52, sensorId: 'SN-B2', status: 'offline' },
            { coach: 'A1', type: 'AC 2-Tier', capacity: 46, occupancy: 30, sensorId: 'SN-A1', status: 'online' },
        ],
    },
    // ── Howrah Rajdhani Express ───────────────────────────────────
    '12301': {
        totalCapacity: 1200,
        coaches: [
            { coach: 'A1', type: 'AC 1st', capacity: 18, occupancy: 16, sensorId: 'SN-A1', status: 'online' },
            { coach: '2A-1', type: 'AC 2-Tier', capacity: 46, occupancy: 45, sensorId: 'SN-2A1', status: 'online' },
            { coach: '2A-2', type: 'AC 2-Tier', capacity: 46, occupancy: 42, sensorId: 'SN-2A2', status: 'online' },
            { coach: '3A-1', type: 'AC 3-Tier', capacity: 64, occupancy: 60, sensorId: 'SN-3A1', status: 'online' },
            { coach: '3A-2', type: 'AC 3-Tier', capacity: 64, occupancy: 56, sensorId: 'SN-3A2', status: 'online' },
        ],
    },
    // ── Tamil Nadu Express ────────────────────────────────────────
    '12621': {
        totalCapacity: 1400,
        coaches: [
            { coach: 'GEN-1', type: 'General', capacity: 200, occupancy: 110, sensorId: 'SN-G1', status: 'online' },
            { coach: 'S1', type: 'Sleeper', capacity: 72, occupancy: 55, sensorId: 'SN-S1', status: 'online' },
            { coach: 'S2', type: 'Sleeper', capacity: 72, occupancy: 48, sensorId: 'SN-S2', status: 'online' },
            { coach: 'B1', type: 'AC 3-Tier', capacity: 64, occupancy: 50, sensorId: 'SN-B1', status: 'online' },
            { coach: 'A1', type: 'AC 2-Tier', capacity: 46, occupancy: 22, sensorId: 'SN-A1', status: 'online' },
        ],
    },
    // ── Dakshin Express ───────────────────────────────────────────
    '12721': {
        totalCapacity: 1100,
        coaches: [
            { coach: 'GEN-1', type: 'General', capacity: 200, occupancy: 170, sensorId: 'SN-G1', status: 'online' },
            { coach: 'S1', type: 'Sleeper', capacity: 72, occupancy: 60, sensorId: 'SN-S1', status: 'online' },
            { coach: 'S2', type: 'Sleeper', capacity: 72, occupancy: 55, sensorId: 'SN-S2', status: 'online' },
            { coach: 'B1', type: 'AC 3-Tier', capacity: 64, occupancy: 45, sensorId: 'SN-B1', status: 'online' },
        ],
    },
    // ── Shatabdi Express ─────────────────────────────────────────
    '12009': {
        totalCapacity: 900,
        coaches: [
            { coach: 'EC-1', type: 'Exec Chair', capacity: 56, occupancy: 40, sensorId: 'SN-EC1', status: 'online' },
            { coach: 'CC-1', type: 'Chair Car', capacity: 78, occupancy: 60, sensorId: 'SN-CC1', status: 'online' },
            { coach: 'CC-2', type: 'Chair Car', capacity: 78, occupancy: 55, sensorId: 'SN-CC2', status: 'online' },
            { coach: 'CC-3', type: 'Chair Car', capacity: 78, occupancy: 40, sensorId: 'SN-CC3', status: 'online' },
        ],
    },
    // ── Karnataka Express ─────────────────────────────────────────
    '12627': {
        totalCapacity: 1500,
        coaches: [
            { coach: 'GEN-1', type: 'General', capacity: 200, occupancy: 130, sensorId: 'SN-G1', status: 'online' },
            { coach: 'S1', type: 'Sleeper', capacity: 72, occupancy: 64, sensorId: 'SN-S1', status: 'online' },
            { coach: 'S2', type: 'Sleeper', capacity: 72, occupancy: 58, sensorId: 'SN-S2', status: 'online' },
            { coach: 'B1', type: 'AC 3-Tier', capacity: 64, occupancy: 55, sensorId: 'SN-B1', status: 'online' },
            { coach: 'A1', type: 'AC 2-Tier', capacity: 46, occupancy: 35, sensorId: 'SN-A1', status: 'online' },
        ],
    },
    // ── Gujarat Mail ──────────────────────────────────────────────
    '12904': {
        totalCapacity: 1300,
        coaches: [
            { coach: 'GEN-1', type: 'General', capacity: 200, occupancy: 88, sensorId: 'SN-G1', status: 'online' },
            { coach: 'S1', type: 'Sleeper', capacity: 72, occupancy: 44, sensorId: 'SN-S1', status: 'online' },
            { coach: 'B1', type: 'AC 3-Tier', capacity: 64, occupancy: 38, sensorId: 'SN-B1', status: 'online' },
            { coach: 'A1', type: 'AC 2-Tier', capacity: 46, occupancy: 20, sensorId: 'SN-A1', status: 'online' },
        ],
    },
}

// Helper: get crowd level metadata from an occupancy percentage
export function getCrowdMeta(pct, offline = false) {
    if (offline) return { label: 'Offline', hex: '#374151', tailwindBg: 'bg-[#374151]', tailwindText: 'text-[#9CA3AF]' }
    if (pct > 90) return { label: 'Critical', hex: '#EF4444', tailwindBg: 'bg-[#EF4444]', tailwindText: 'text-[#EF4444]' }
    if (pct > 80) return { label: 'High', hex: '#F97316', tailwindBg: 'bg-[#F97316]', tailwindText: 'text-[#F97316]' }
    if (pct > 65) return { label: 'Moderate', hex: '#FACC15', tailwindBg: 'bg-[#FACC15]', tailwindText: 'text-[#FACC15]' }
    if (pct > 40) return { label: 'Fair', hex: '#2F80ED', tailwindBg: 'bg-[#2F80ED]', tailwindText: 'text-[#2F80ED]' }
    return { label: 'Low', hex: '#22C55E', tailwindBg: 'bg-[#22C55E]', tailwindText: 'text-[#22C55E]' }
}
