/**
 * wifiCardService.js
 * Handles communication with the Railway Card (ESP32) over WiFi/HTTP.
 */

// Default IP for ESP32 in Access Point mode. 
// If the card is on a local network, this would be its local IP.
const CARD_BASE_URL = import.meta.env.VITE_CARD_BASE_URL || 'http://192.168.4.1';


/**
 * Sends a ticket ID to the card.
 * @param {string} ticketId - 12 character ticket ID
 * @returns {Promise<boolean>} - Success status
 */
export async function sendTicketToCard(ticketId) {
    // Ensure the ticket ID is exactly 12 characters (or take first 12)
    const sanitizedId = ticketId.substring(0, 12).toUpperCase();

    console.log(`[WiFi Card] Sending ticket ID: ${sanitizedId} to ${CARD_BASE_URL}`);

    try {
        // Use a simple GET request for maximum compatibility with ESP32 WebServer
        // We use 'no-cors' if we don't need to read the response and want to avoid preflight,
        // but 'cors' is better if the ESP32 is configured to handle it correctly.
        // For simplicity, we'll try a standard fetch.
        const response = await fetch(`${CARD_BASE_URL}/ticket?id=${sanitizedId}`, {
            method: 'GET',
            mode: 'cors', // ESP32 side should handle Access-Control-Allow-Origin: *
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        console.log('[WiFi Card] Success:', data);
        return true;
    } catch (error) {
        console.error('[WiFi Card] Error sending ticket:', error);
        throw error;
    }
}

/**
 * Pings the card to check if it's reachable.
 */
export async function checkCardConnection() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const response = await fetch(`${CARD_BASE_URL}/status`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.warn('[WiFi Card] Card unreachable:', error.message);
        return false;
    }
}
