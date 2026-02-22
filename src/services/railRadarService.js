// railRadarService.js
// All requests go through the Vite dev-server proxy (/railradar → https://api.railradar.org/api/v1)
// so the browser never makes a cross-origin request — no CORS issues.

const RAIL_RADAR_API_KEY = import.meta.env.VITE_RAIL_RADAR_API_KEY;

// In dev the Vite proxy rewrites /railradar/* → https://api.railradar.org/api/v1/*
// The API key is still sent as a header so the proxy just forwards it.
const BASE = "/railradar";

// ── Shared fetch wrapper ──────────────────────────────────────────────────────
async function railGet(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "X-API-Key": RAIL_RADAR_API_KEY,
      "Accept": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RailRadar ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Search for stations by name or code.
 * API returns: [{ code: "NDLS", name: "New Delhi" }, ...]
 *
 * @param {string} query – partial station name or code (min 2 chars)
 * @returns {Promise<Array<{code:string, name:string}>>}
 */
export async function searchStations(query) {
  if (!query || query.trim().length < 2) return [];
  console.log("query", query);
  try {
    const json = await railGet(`/search/stations?query=${encodeURIComponent(query.trim())}`);
    // Real response: { success: true, data: { stations: [...] }, meta: {...} }
    if (Array.isArray(json)) return json
    if (Array.isArray(json?.data?.stations)) return json.data.stations
    if (Array.isArray(json?.data)) return json.data
    return [];
  } catch (err) {
    console.warn("[searchStations]", err.message);
    return [];
  }
}

/**
 * Fetch all trains running between two stations.
 * API returns: { success: true, data: { trains: [...] } }
 *
 * @param {string} fromstation – station code e.g. "NDLS"
 * @param {string} tostation   – station code e.g. "BCT"
 */
export async function getTrainsBetween(fromstation, tostation) {
  return railGet(`/trains/between?from=${fromstation}&to=${tostation}`);
}
