/**
 * bleService.js
 * Singleton Web Bluetooth manager for the RAILCARD / RCARD0000011 device.
 *
 * Device identifiers:
 *  - RAILCARD_DEVICE_NAME = 'RAILCARD'      ← BLE advertised name (what the OS picker shows)
 *  - RAILCARD_DEVICE_ID   = 'RCARD0000011'  ← Permanent logical ID (shown in UI)
 *
 * Auto-connect flow:
 *  1. tryAutoConnect()     – silently reconnects to a previously-granted device
 *  2. connectToCard()      – opens OS picker filtered to name 'RAILCARD'
 *  3. sendTicketsToCard()  – pushes all ticket records over BLE UART
 *
 * BLE packet protocol (sent as UTF-8 strings):
 *   TRAQ:START:<count>          – announces how many tickets follow
 *   TRAQ:TKT:<id>|<from>|<to>|<date>|<pax>|<fare>|<type>
 *   TRAQ:END                    – signals transmission complete
 *
 * Each string is ≤ ~180 chars. Chrome negotiates MTU 512 on modern stacks,
 * but we add a 150 ms delay between packets for safety.
 */

export const RAILCARD_DEVICE_ID = 'RCARD0000011'
export const RAILCARD_DEVICE_NAME = 'RAILCARD'   // BLE advertised name (ESP32 broadcasts this)

// ── Known BLE-UART service UUIDs ─────────────────────────────────────────────
// ALL of these must be listed in optionalServices at requestDevice() time,
// otherwise Chrome blocks access even if the service exists on the device.
const UART_SERVICES = [
    '0000ffe0-0000-1000-8000-00805f9b34fb',   // HM-10 / AT-09 / JDY-08 (most common ESP32)
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e',   // Nordic UART Service (NUS)
    '0000fff0-0000-1000-8000-00805f9b34fb',   // Generic ESP32 UART variant
    '49535343-fe7d-4ae5-8fa9-9fafd205e455',   // Microchip RN4020
    '0000abf0-0000-1000-8000-00805f9b34fb',   // Some custom ESP32 impls
    '0000ab00-0000-1000-8000-00805f9b34fb',
    '0000a002-0000-1000-8000-00805f9b34fb',
    '0000180d-0000-1000-8000-00805f9b34fb',   // Heart Rate (sometimes repurposed)
    '0000180f-0000-1000-8000-00805f9b34fb',   // Battery Service
    '00001800-0000-1000-8000-00805f9b34fb',   // Generic Access
    '00001801-0000-1000-8000-00805f9b34fb',   // Generic Attribute
]

// ── Known writable characteristic UUIDs ──────────────────────────────────────
const UART_TX_CHARS = [
    '0000ffe1-0000-1000-8000-00805f9b34fb',   // HM-10 TX/RX
    '6e400002-b5a3-f393-e0a9-e50e24dcca9e',   // NUS RX (phone → device)
    '0000fff1-0000-1000-8000-00805f9b34fb',   // Generic variant
    '49535343-1e4d-4bd9-ba61-23c647249616',   // Microchip
    '0000abf1-0000-1000-8000-00805f9b34fb',
    '0000ab01-0000-1000-8000-00805f9b34fb',
    '0000a003-0000-1000-8000-00805f9b34fb',
]

const PACKET_DELAY_MS = 150   // ms between BLE writes (safe for most stacks)

// ── Module-level singletons ───────────────────────────────────────────────────
let _device = null
let _characteristic = null
let _disconnectCb = null

function _reset() { _device = null; _characteristic = null }
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Logging helpers ───────────────────────────────────────────────────────────
const tag = '[BLE 🔵]'
const log = (...a) => console.log(tag, ...a)
const warn = (...a) => console.warn(tag, ...a)
const err = (...a) => console.error(tag, ...a)

// ── Status helpers ────────────────────────────────────────────────────────────
export function isConnected() {
    return !!_device && !!_device.gatt?.connected && !!_characteristic
}
export function getDeviceName() {
    return _device?.name || _device?.id || null
}

// ── Internal: write one raw string packet ─────────────────────────────────────
async function _writeRaw(text) {
    const data = new TextEncoder().encode(text)
    try {
        if (_characteristic.properties.write) {
            await _characteristic.writeValue(data)
        } else if (_characteristic.properties.writeWithoutResponse) {
            await _characteristic.writeValueWithoutResponse(data)
        } else {
            throw new Error('No write property on characteristic')
        }
        log(`  ← "${text}"`)
    } catch (e) {
        err(`  ✗ Write failed for "${text}":`, e.name, e.message)
        throw e
    }
}

// ── Internal: GATT connect + service/characteristic discovery ─────────────────
async function _connectGatt(device, onDisconnected) {
    log(`Connecting GATT to "${device.name || device.id}"…`)

    if (_disconnectCb) device.removeEventListener('gattserverdisconnected', _disconnectCb)
    _disconnectCb = () => {
        warn('Device disconnected:', device.name || device.id)
        _reset()
        onDisconnected?.()
    }
    device.addEventListener('gattserverdisconnected', _disconnectCb)

    // ── GATT connect ──────────────────────────────────────────────────────────
    let server
    try {
        server = await device.gatt.connect()
        log('GATT server connected ✓')
    } catch (e) {
        err('GATT connect() failed:', e.name, '-', e.message)
        _reset()
        throw new Error(`GATT connect failed: ${e.message}`)
    }

    // ── Service discovery ─────────────────────────────────────────────────────
    log('Probing services…', UART_SERVICES)
    let service = null
    for (const uuid of UART_SERVICES) {
        try {
            service = await server.getPrimaryService(uuid)
            log(`  ✓ Service found: ${uuid}`)
            break
        } catch (e) {
            warn(`  ✗ Service ${uuid}:`, e.message)
        }
    }
    if (!service) {
        log('Fallback: getPrimaryServices() with no argument…')
        try {
            const all = await server.getPrimaryServices()
            log('  All services on device:', all.map(s => s.uuid))
            // Pick first service that has any characteristic, writable preferred
            service = all[0] ?? null
            if (service) log(`  Using fallback service: ${service.uuid}`)
        } catch (e) {
            if (e.name === 'SecurityError') {
                err(
                    'SecurityError on getPrimaryServices() — this is a Chrome security restriction.',
                    'The firmware service UUID was not declared in optionalServices at requestDevice() time.',
                    'Known UUID list:', UART_SERVICES
                )
            } else {
                err('getPrimaryServices() failed:', e.name, e.message)
            }
        }
    }
    if (!service) {
        device.gatt.disconnect(); _reset()
        const msg =
            `No GATT service found on "${device.name}". ` +
            `Open DevTools → Console and look for the full service UUID list logged above. ` +
            `Then add that UUID to UART_SERVICES in bleService.js, or update your ESP32 firmware ` +
            `to use one of the known UUIDs: 0xFFE0 (HM-10) or the Nordic UART Service.`
        err(msg); throw new Error(msg)
    }

    // ── Characteristic discovery ──────────────────────────────────────────────
    log('Probing characteristics…', UART_TX_CHARS)
    let char = null
    for (const uuid of UART_TX_CHARS) {
        try {
            const c = await service.getCharacteristic(uuid)
            log(`  Found char ${uuid} — write:${c.properties.write} noResp:${c.properties.writeWithoutResponse}`)
            if (c.properties.write || c.properties.writeWithoutResponse) { char = c; break }
            else warn(`  ✗ Char ${uuid} not writable`)
        } catch (e) { warn(`  ✗ Char ${uuid}:`, e.message) }
    }
    if (!char) {
        log('Fallback: getCharacteristics() …')
        try {
            const all = await service.getCharacteristics()
            log('  All characteristics:', all.map(c => `${c.uuid} [w=${c.properties.write} wr=${c.properties.writeWithoutResponse}]`))
            char = all.find(c => c.properties.write || c.properties.writeWithoutResponse) || null
            if (char) log(`  Using fallback char: ${char.uuid}`)
        } catch (e) { err('getCharacteristics() failed:', e.name, e.message) }
    }
    if (!char) {
        device.gatt.disconnect(); _reset()
        const msg = 'No writable characteristic found. Check firmware exposes a write characteristic (0xFFE1 or similar).'
        err(msg); throw new Error(msg)
    }

    _device = device
    _characteristic = char
    log(`✅ Ready — device: "${device.name || device.id}", char: ${char.uuid}`)
    return device.name || device.id
}

// ── Public: auto-reconnect (no picker, silent) ────────────────────────────────
export async function tryAutoConnect(onDisconnected) {
    if (!navigator.bluetooth?.getDevices) {
        warn('getDevices() unavailable (Chrome 85+ needed). Skipping auto-connect.')
        return null
    }
    log(`Checking previously-granted devices for "${RAILCARD_DEVICE_NAME}" (${RAILCARD_DEVICE_ID})…`)
    try {
        const devices = await navigator.bluetooth.getDevices()
        log(`Previously granted (${devices.length}):`, devices.map(d => `${d.name}|${d.id}`))
        const card = devices.find(d => d.name === RAILCARD_DEVICE_NAME)
        if (!card) { log(`"${RAILCARD_DEVICE_NAME}" not in granted list. Pair manually first.`); return null }
        if (_device?.gatt?.connected) _device.gatt.disconnect()
        _reset()
        log(`Found "${RAILCARD_DEVICE_NAME}" (id: ${card.id}). Auto-connecting…`)
        return await _connectGatt(card, onDisconnected)
    } catch (e) {
        err('Auto-connect error:', e.name, '-', e.message)
        return null
    }
}

// ── Public: manual connect ────────────────────────────────────────────────────
// Uses acceptAllDevices + optionalServices so Chrome grants access to ALL
// service UUIDs upfront — required for getPrimaryServices() to work.
// Name verification is done in JS after the user selects a device.
export async function connectToCard({ onDisconnected } = {}) {
    if (!navigator.bluetooth) {
        const msg = 'Web Bluetooth not supported. Use Chrome or Edge on desktop/Android.'
        err(msg); throw new Error(msg)
    }
    log(`Opening picker (acceptAllDevices + optionalServices, will verify name="${RAILCARD_DEVICE_NAME}")…`)
    if (_device?.gatt?.connected) _device.gatt.disconnect()
    _reset()

    let device
    try {
        device = await navigator.bluetooth.requestDevice({
            // acceptAllDevices so the picker is not filtered by the browser
            // (we still verify the name below). This is required so that
            // optionalServices grants full access to all UUIDs for discovery.
            acceptAllDevices: true,
            optionalServices: UART_SERVICES,
        })
        log(`User selected: "${device.name}" (id: ${device.id})`)
    } catch (e) {
        if (e.name === 'NotFoundError' || e.name === 'NotAllowedError') {
            throw new Error('Device picker was closed or cancelled.')
        }
        err('requestDevice() failed:', e.name, '-', e.message)
        throw new Error(`Device selection failed: ${e.message}`)
    }

    // Soft-warn if user picked a different device, but proceed anyway
    if (device.name !== RAILCARD_DEVICE_NAME) {
        warn(
            `Selected device "${device.name}" does not match expected name "${RAILCARD_DEVICE_NAME}".`,
            'Proceeding anyway — if this is the wrong device, disconnect and try again.'
        )
    }

    return _connectGatt(device, onDisconnected)
}

// ── Public: send all user tickets to the card ─────────────────────────────────
/**
 * Sends a structured sequence of BLE packets representing the user's tickets.
 *
 * Protocol:
 *   TRAQ:START:<n>
 *   TRAQ:TKT:<id>|<from>|<to>|<date>|<passengers>|<fare>|<trainType>
 *   ... (one line per ticket)
 *   TRAQ:END
 *
 * @param {Array}  tickets    – array of booking objects from Firestore
 * @param {function} [onProgress]  – called with (sent, total) after each packet
 */
export async function sendTicketsToCard(tickets, onProgress) {
    if (!isConnected()) {
        err('sendTicketsToCard: not connected.')
        throw new Error(`${RAILCARD_DEVICE_ID} not connected. Pair the card first.`)
    }
    if (!tickets?.length) {
        log('No tickets to send.'); return
    }

    log(`Sending ${tickets.length} ticket(s) to ${RAILCARD_DEVICE_ID} (BLE name: "${RAILCARD_DEVICE_NAME}")…`)

    // ── START packet ──────────────────────────────────────────────────────────
    await _writeRaw(`TRAQ:START:${tickets.length}`)
    await sleep(PACKET_DELAY_MS)

    // ── One packet per ticket ─────────────────────────────────────────────────
    for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i]
        const id = t.id || t.firestoreId || 'UNKNOWN'
        const from = t.from || '?'
        const to = t.to || '?'
        const date = t.date || '?'
        const pax = t.passengers || 1
        const fare = t.fare || 0
        const type = (t.trainType || 'GEN').replace(/[|]/g, '-')   // sanitise delimiters

        const packet = `TRAQ:TKT:${id}|${from}|${to}|${date}|${pax}|${fare}|${type}`
        await _writeRaw(packet)
        onProgress?.(i + 1, tickets.length)
        await sleep(PACKET_DELAY_MS)
    }

    // ── END packet ────────────────────────────────────────────────────────────
    await _writeRaw('TRAQ:END')
    log(`✅ All ${tickets.length} ticket(s) sent to ${RAILCARD_DEVICE_ID}.`)
}

// ── Public: write single string ───────────────────────────────────────────────
export async function writeToCard(text) {
    if (!isConnected()) { err('writeToCard: not connected.'); throw new Error(`${RAILCARD_DEVICE_ID} not connected.`) }
    log(`writeToCard: "${text}"`)
    await _writeRaw(text)
}

// ── Public: disconnect ────────────────────────────────────────────────────────
export function disconnectCard() {
    log('Disconnecting…')
    if (_device?.gatt?.connected) _device.gatt.disconnect()
    _reset()
    log('Disconnected.')
}
