/**
 * bleService.js
 * BLE communication with the Railway Card (ESP32 "RAILCARD" device).
 *
 * ESP32 Protocol (must match firmware exactly):
 *  ① Connect to device named "RAILCARD"
 *  ② Write permanentID ("RCARD0000011") → VERIFY_CHAR  (22222222-...)
 *     → ESP32 validates: if wrong ID it disconnects immediately
 *  ③ Write 12-char ticket ID          → TICKET_CHAR  (33333333-...)
 *     → ESP32 accepts ticket and disconnects
 *
 * UUIDs match the firmware defines:
 *   SERVICE_UUID     = "11111111-1111-1111-1111-111111111111"
 *   VERIFY_CHAR_UUID = "22222222-2222-2222-2222-222222222222"
 *   TICKET_CHAR_UUID = "33333333-3333-3333-3333-333333333333"
 */

// ── UUIDs (must match ESP32 firmware exactly) ─────────────────────────────────
const SERVICE_UUID = '11111111-1111-1111-1111-111111111111';
const VERIFY_CHAR_UUID = '22222222-2222-2222-2222-222222222222';
const TICKET_CHAR_UUID = '33333333-3333-3333-3333-333333333333';

// ── Permanent ID hardcoded to match the ESP32 ────────────────────────────────
const PERMANENT_ID = 'RCARD0000011';

// ── Module-level connection state ─────────────────────────────────────────────
let _device = null;
let _gattServer = null;
let _verifyChar = null;
let _ticketChar = null;
let _sessionVerified = false;

// ── Callback for connection status changes ──────────────────────────────────
let _onDisconnect = null;

export function setBleDisconnectHandler(handler) {
    _onDisconnect = handler;
}

function _reset() {
    _gattServer = null;
    _verifyChar = null;
    _ticketChar = null;
    _sessionVerified = false;
}

function _encode(str) {
    return new TextEncoder().encode(str);
}

// ── Public: check connection ──────────────────────────────────────────────────
export function isBleConnected() {
    return _gattServer?.connected === true && _sessionVerified;
}

// ── Public: disconnect ────────────────────────────────────────────────────────
export function disconnectBle() {
    if (_device?.gatt?.connected) {
        _device.gatt.disconnect();
        console.log('[BLE] Disconnected manually.');
    }
    _device = null;
    _reset();
}

// ── Public: connect to RAILCARD and authenticate ──────────────────────────────
/**
 * Opens the browser BLE device picker, connects, and performs the 
 * "Handshake" (writing PERMANENT_ID to verify characteristic).
 *
 * @returns {Promise<string>} device name on success
 */
export async function connectBleDevice() {
    if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser.');
    }

    // Disconnect any existing session first
    if (_device?.gatt?.connected) _device.gatt.disconnect();
    _device = null;
    _reset();

    try {
        _device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'RAILCARD' }],
            optionalServices: [SERVICE_UUID],
        })
    } catch (e) {
        if (e.name === 'NotFoundError') {
            throw new Error('No Railway Card found. Ensure your card is ON and nearby.')
        }
        throw new Error(`BLE device selection failed: ${e.message}`)
    }

    _device.addEventListener('gattserverdisconnected', () => {
        console.log('[BLE] Device disconnected (hardware).');
        _reset();
        if (_onDisconnect) _onDisconnect();
    });

    console.log('[BLE] Connecting to GATT Server…');
    _gattServer = await _device.gatt.connect();

    console.log('[BLE] Getting primary service…');
    const service = await _gattServer.getPrimaryService(SERVICE_UUID);

    console.log('[BLE] Getting characteristics…');
    _verifyChar = await service.getCharacteristic(VERIFY_CHAR_UUID);
    _ticketChar = await service.getCharacteristic(TICKET_CHAR_UUID);

    // ── MANDATORY HANDSHAKE (Pairing Verification) ──────────────────────────
    console.log('[BLE] Performing Handshake — Verifying Permanent ID…');
    try {
        await _verifyChar.writeValue(_encode(PERMANENT_ID));
        // Wait briefly for ESP32 to validate
        await new Promise(r => setTimeout(r, 600));

        if (!_gattServer.connected) {
            throw new Error('ESP32 rejected the connection (ID Mismatch).');
        }
        _sessionVerified = true;
    } catch (e) {
        _device.gatt.disconnect();
        _reset();
        throw new Error(`Handshake failed: ${e.message}`);
    }

    console.log('[BLE] ✅ Handshake Successful. Device is paired and verified.');
    return _device.name;
}

// ── Public: send ticket ID (handles the full 2-step protocol) ─────────────────
/**
 * Executes the full ESP32 protocol:
 *  1. Writes RCARD0000011 to verify (Step 1)
 *  2. Waits 800ms for hardware to authorize
 *  3. Writes the ticket ID (Step 2)
 *
 * NOTE: The ESP32 is designed to disconnect immediately after a successful ticket write.
 * We catch the resulting disconnect error and treat it as a "success".
 *
 * @param {string} ticketId - raw ticket ID
 */
export async function sendTicketViaBle(ticketId) {
    // ── Pre-flight checks ─────────────────────────────────────────────────────
    if (!_gattServer?.connected || !_verifyChar || !_ticketChar) {
        _reset();
        throw new Error('Railway Card is not connected. Please pair again.');
    }

    // Sanitize ticket ID to exactly 12 uppercase alphanumeric chars
    const sanitized = ticketId.replace(/[^A-Za-z0-9]/g, '').substring(0, 12).toUpperCase();
    if (sanitized.length !== 12) {
        throw new Error(`Invalid Ticket ID: Must be 12 characters. Got: "${sanitized}"`);
    }

    console.log(`[BLE] 🚀 Syncing Ticket "${sanitized}" to hardware…`);

    try {
        // ── Step 1: Verification Handshake ───────────────────────────────────
        // We ALWAYS do this right before the ticket write to ensure authorization is fresh
        console.log(`[BLE] Step 1/2 — Authorizing Session…`);
        try {
            await _verifyChar.writeValue(_encode(PERMANENT_ID));
        } catch (err) {
            throw new Error(`Authorization failed: ${err.message}`);
        }

        // Wait for ESP32 to cycle its internal state
        await new Promise(r => setTimeout(r, 800));

        if (!_gattServer?.connected) {
            _reset();
            throw new Error('Connection lost after authorization. Try again.');
        }

        // ── Step 2: Push Ticket ID ──────────────────────────────────────────
        console.log(`[BLE] Step 2/2 — Pushing Ticket Data…`);
        try {
            await _ticketChar.writeValue(_encode(sanitized));
            console.log('[BLE] ✅ Write confirmed by browser.');
        } catch (e) {
            /**
             * CRITICAL HARDWARE BEHAVIOR:
             * The ESP32 often closes the BLE link immediately upon receiving the ticket ID 
             * to save power/reboot. This can happen BEFORE the browser receives the GATT 
             * ACK, causing a "GATT operation failed" or "Disconnected" error. 
             *
             * If we are at Step 2 and the error is "disconnected", it almost always means 
             * the card accepted the ticket and then hung up.
             */
            if (e.message.toLowerCase().includes('disconnected') || e.message.toLowerCase().includes('gatt')) {
                console.warn('[BLE] Write triggered hardware disconnect. Assuming SUCCESS (standard ESP32 behavior).');
            } else {
                throw e; // Real peripheral error
            }
        }

        console.log(`[BLE] 🎯 Ticket "${sanitized}" synced successfully!`);

        // Wait briefly for the hardware to finish its work before we clean up
        await new Promise(r => setTimeout(r, 600));

    } catch (e) {
        console.error('[BLE] Sync Process Error:', e.message);
        throw e;
    } finally {
        // Always reset after any ticket attempt (success or fail) as the ESP32 
        // disconnects anyway.
        _reset();
    }
}


