// railRadarService.js
// Fetch real train details from Rail Radar API

const RAIL_RADAR_API_KEY = "rr_o7r33nnimx63vzkgyk73r08q6rbwreck";
const RAIL_RADAR_BASE_URL = "https://api.railradar.org/api/v1";

/**
 * Fetch trains between two stations
 * @param {string} fromstation - Source station code e.g. "NDLS"
 * @param {string} tostation - Destination station code e.g. "BCT"
 * @returns {Promise<Object>} API response with data.trains array
 */
export async function getTrainsBetween(fromstation, tostation) {
  const url = `${RAIL_RADAR_BASE_URL}/trains/between?from=${fromstation}&to=${tostation}`;
  const response = await fetch(url, {
    headers: {
      "X-API-Key": RAIL_RADAR_API_KEY,
      "Accept": "application/json",
    }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    console.error(`RailRadar API Error (${response.status}):`, errorText);
    throw new Error(`RailRadar API responded with ${response.status}`);
  }

  return await response.json();
}
