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

function _reset() {
    _gattServer = null;
    _verifyChar = null;
    _ticketChar = null;
}

function _encode(str) {
    return new TextEncoder().encode(str);
}

// ── Public: check connection ──────────────────────────────────────────────────
export function isBleConnected() {
    return _gattServer?.connected === true;
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
 * Opens the browser BLE device picker (filtered to "RAILCARD"),
 * connects to the GATT server, and fetches both characteristics.
 *
 * Does NOT send anything yet — call sendTicketViaBle() after this.
 *
 * @returns {Promise<string>} device name on success
 */
export async function connectBleDevice() {
    if (!navigator.bluetooth) {
        throw new Error(
            'Web Bluetooth is not supported in this browser. ' +
            'Please use Chrome or Edge on desktop/Android.'
        );
    }

    console.log('[BLE] Opening device picker for "RAILCARD"…');

    // Disconnect any existing session first
    if (_device?.gatt?.connected) _device.gatt.disconnect();
    _device = null;
    _reset();

    // Request device — MUST use acceptAllDevices:true so Chrome grants full
    // access to optionalServices. Name-based filters prevent service discovery
    // in Chrome's Web Bluetooth implementation.
    try {
        _device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [SERVICE_UUID],
        })
    } catch (e) {
        if (e.name === 'NotFoundError' || e.name === 'NotAllowedError') {
            throw new Error('Device picker was cancelled. Select "RAILCARD" from the list.')
        }
        throw new Error(`BLE device request failed: ${e.message}`)
    }

    // Soft-warn if the user picked a different device, but proceed anyway
    if (_device.name !== 'RAILCARD') {
        console.warn(
            `[BLE] Selected device "${_device.name}" — expected "RAILCARD". ` +
            'Proceeding anyway; disconnect and retry if this is the wrong device.'
        )
    }

    console.log(`[BLE] Selected device: "${_device.name}"`);

    // Listen for hardware disconnects
    _device.addEventListener('gattserverdisconnected', () => {
        console.log('[BLE] Device disconnected (hardware).');
        _reset();
    });

    // Connect to GATT server
    console.log('[BLE] Connecting to GATT Server…');
    try {
        _gattServer = await _device.gatt.connect();
    } catch (e) {
        throw new Error(`GATT connect failed: ${e.message}`);
    }

    // Get the primary service
    console.log('[BLE] Getting primary service…');
    let service;
    try {
        service = await _gattServer.getPrimaryService(SERVICE_UUID);
    } catch (e) {
        throw new Error(
            `Service "${SERVICE_UUID}" not found on device. ` +
            `Ensure the ESP32 is running the correct firmware and the service UUID matches.`
        );
    }

    // Get both characteristics
    console.log('[BLE] Getting characteristics…');
    try {
        _verifyChar = await service.getCharacteristic(VERIFY_CHAR_UUID);
        _ticketChar = await service.getCharacteristic(TICKET_CHAR_UUID);
    } catch (e) {
        throw new Error(`Characteristic not found: ${e.message}`);
    }

    console.log('[BLE] Connected and ready. Characteristics obtained.');
    return _device.name;
}

// ── Public: send ticket ID (handles the full 2-step protocol) ─────────────────
/**
 * Executes the full ESP32 protocol:
 *  1. Writes RCARD0000011 to the verify characteristic
 *  2. Waits 300ms for the ESP32 to validate
 *  3. Writes the 12-char ticket ID to the ticket characteristic
 *
 * @param {string} ticketId - raw ticket ID (will be trimmed to 12 chars, uppercased)
 */
export async function sendTicketViaBle(ticketId) {
    if (!_verifyChar || !_ticketChar) {
        throw new Error(
            'BLE device not connected. Call connectBleDevice() first, then sendTicketViaBle().'
        );
    }

    // Sanitize ticket ID to exactly 12 uppercase alphanumeric chars
    const sanitized = ticketId.replace(/[^A-Za-z0-9]/g, '').substring(0, 12).toUpperCase();
    if (sanitized.length !== 12) {
        throw new Error(`Ticket ID must be 12 alphanumeric characters. Got: "${sanitized}" (${sanitized.length} chars)`);
    }

    // ── Step 1: Send permanent ID for verification ────────────────────────────
    console.log(`[BLE] Step 1 — Sending permanent ID "${PERMANENT_ID}" to verify characteristic…`);
    try {
        await _verifyChar.writeValue(_encode(PERMANENT_ID));
    } catch (e) {
        throw new Error(`Verification write failed: ${e.message}`);
    }

    // Wait for ESP32 to process (it may disconnect if wrong — 300ms buffer)
    await new Promise(r => setTimeout(r, 350));

    // Check if ESP32 disconnected us (wrong ID / bad format)
    if (!_gattServer?.connected) {
        _reset();
        throw new Error('ESP32 rejected the permanent ID and disconnected. Check PERMANENT_ID matches the firmware.');
    }

    // ── Step 2: Send the ticket ID ────────────────────────────────────────────
    console.log(`[BLE] Step 2 — Sending ticket ID "${sanitized}" to ticket characteristic…`);
    try {
        await _ticketChar.writeValue(_encode(sanitized));
    } catch (e) {
        throw new Error(`Ticket write failed: ${e.message}`);
    }

    console.log(`[BLE] ✅ Ticket "${sanitized}" sent successfully! ESP32 will disconnect shortly.`);

    // The ESP32 disconnects after accepting the ticket (by design)
    // Wait briefly then clean up on our side
    await new Promise(r => setTimeout(r, 600));
    _reset();
}
