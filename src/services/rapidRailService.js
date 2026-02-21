// rapidRailService.js
// Fetch real train details from Rapid Rail API

const RAPID_RAIL_API_KEY = "rr_o7r33nnimx63vzkgyk73r08q6rbwreck";
const RAPID_RAIL_BASE_URL = "https://rapidrail.in/api/v1";

/**
 * Fetch real train details from Rapid Rail API
 * @param {string} trainNumber - Train number to fetch details for
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Train details
 */
export async function fetchRealTrainDetails(tostation, fromstation) {
  const url = `$https://api.railradar.org/api/v1/trains/between?from=${fromstation}&to=${tostation}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${RAPID_RAIL_API_KEY}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch train details");
  }
  return await response.json();
}
