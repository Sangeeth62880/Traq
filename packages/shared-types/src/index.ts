// =============================================================================
// TRAQ — Shared TypeScript Types
// IoT + ML Real-Time Train Crowd Intelligence Platform
// =============================================================================
// This package is the SINGLE SOURCE OF TRUTH for all data contracts shared
// across backend, dashboard, simulator, and ML service.
// =============================================================================

// =============================================================================
// ENUMS & LITERAL UNION TYPES
// =============================================================================

export type CoachClass = '1AC' | '2AC' | '3AC' | 'SL' | 'CC' | 'EC' | 'GN' | '2S';

export type TicketStatus = 'active' | 'used' | 'expired' | 'removed';

export type AlertType = 'occupancy' | 'device' | 'ticketing' | 'security';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type TrainRunningStatus = 'running' | 'arrived' | 'departed' | 'cancelled' | 'unknown';

export type DeviceStatus = 'online' | 'stale' | 'offline';

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu';

// =============================================================================
// HARDWARE-SPECIFIC TYPES
// =============================================================================

// -- nRF52833 BLE 5.1 Scanner ------------------------------------------------

export type CoachZone = 'door_a' | 'middle' | 'door_b' | 'unknown';

export interface AoASample {
    /** Anonymized hash of advertisement payload (NOT MAC address) */
    device_hash: string;
    /** Horizontal angle in degrees (-90 to +90) */
    azimuth_deg: number;
    /** Vertical angle in degrees (-90 to +90) */
    elevation_deg: number;
    /** Signal strength in dBm */
    rssi_dbm: number;
    /** Coach zone computed from AoA */
    zone: CoachZone;
}

export interface BLEScanReport {
    /** HyperLogLog cardinality estimate of unique devices */
    unique_device_estimate: number;
    /** Validated Railway Card BLE advertisements */
    traq_cards: CardHeader[];
    /** Duration of BLE scan in milliseconds */
    scan_duration_ms: number;
    /** Angle of Arrival measurements from nRF52833 */
    aoa_samples: AoASample[];
}

// -- AD8318 + ADS1115 RF Power Module ----------------------------------------

export type RFBand =
    | 'wifi_2_4ghz'
    | 'wifi_5ghz'
    | 'cellular_900mhz'
    | 'cellular_1800mhz'
    | 'unknown';

export interface RFPowerReading {
    /** ADS1115 channel being read (0-3) */
    channel: number;
    /** Raw 16-bit ADC value */
    raw_adc: number;
    /** Converted voltage in millivolts */
    voltage_mv: number;
    /** Converted RF power in dBm (via AD8318 log slope) */
    power_dbm: number;
    /** Frequency band being measured */
    frequency_band: RFBand;
    /** Whether calibration offsets have been applied */
    calibrated: boolean;
}

// -- ADS1115 I2C Configuration -----------------------------------------------

export type ADSGain = '2/3x' | '1x' | '2x' | '4x' | '8x' | '16x';

export type ADSDataRate = 8 | 16 | 32 | 64 | 128 | 250 | 475 | 860;

export type ADSMux =
    | 'AIN0_GND'
    | 'AIN1_GND'
    | 'AIN2_GND'
    | 'AIN3_GND'
    | 'AIN0_AIN1'
    | 'AIN0_AIN3'
    | 'AIN1_AIN3'
    | 'AIN2_AIN3';

export interface ADS1115Config {
    /** I2C address (default 0x48) */
    i2c_address: number;
    /** Programmable gain amplifier setting */
    gain: ADSGain;
    /** Samples per second */
    data_rate: ADSDataRate;
    /** Input multiplexer configuration */
    mux: ADSMux;
}

// -- Multi-Sensor Fusion (ESP32 aggregates all sensors) ----------------------

export interface SensorFusionResult {
    /** Final fused occupancy estimate (0-100) */
    occupancy_pct: number;
    /** Validated Railway Card count (ticketed passengers) */
    ticketed_count: number;
    /** Total BLE devices from HyperLogLog */
    total_ble_count: number;
    /** Occupancy estimate from AD8318/ADS1115 RF power (0-100) */
    rf_occupancy_estimate: number;
    /** Device count per coach zone from AoA */
    zone_distribution: Record<CoachZone, number>;
    /** Overall fusion confidence (0.0 to 1.0) */
    fusion_confidence: number;
    /** Status of each sensor subsystem */
    sensors_active: {
        /** nRF52833 BLE scanner responding */
        ble_scanner: boolean;
        /** ADS1115 RF power module responding */
        rf_power: boolean;
        /** AoA data being received */
        aoa: boolean;
    };
}

// -- Inter-Chip UART Protocol (nRF52833 ↔ ESP32) ----------------------------

export interface NRFCommand {
    cmd: 'SCAN' | 'STATUS' | 'RESET' | 'SET_TRAIN' | 'GET_CARDS';
    params?: Record<string, string | number>;
}

export interface NRFResponse {
    status: 'OK' | 'ERROR' | 'BUSY';
    data?: BLEScanReport | string;
    error_code?: number;
}

// =============================================================================
// IoT LAYER — COACH PAYLOAD
// =============================================================================

/** 28-byte BLE advertisement payload from Railway Card (parsed by nRF52833) */
export interface CardHeader {
    /** Magic bytes: [0x54, 0x52] ("TR") */
    magic: [number, number];
    /** Unique ticket identifier (12 alphanumeric chars) */
    ticket_id: string;
    /** Train number (up to 8 chars) */
    train_number: string;
    /** Assigned coach number */
    coach_assigned: number;
    /** Ticket validity as Unix epoch (seconds) */
    validity_epoch: number;
    /** XOR checksum of all preceding bytes */
    checksum: number;
}

/** Coach occupancy payload sent from ESP32 node via MQTT every 30 seconds */
export interface CoachPayload {
    /** Unique node identifier, e.g. "TRQ-12345-C03" */
    node_id: string;
    /** Train number, e.g. "12345" */
    train_number: string;
    /** Coach number (1-24) */
    coach_number: number;
    /** Fused occupancy percentage (0-100) */
    occupancy_pct: number;
    /** Count of ticketed passengers (validated Railway Cards) */
    ticketed_count: number;
    /** Total estimated people (sensor fusion) */
    total_detected: number;
    /** Full sensor fusion result */
    fusion: SensorFusionResult;
    /** Node battery percentage (0-100) */
    battery_pct: number;
    /** Firmware version string, e.g. "1.2.0" */
    firmware_version: string;
    /** Unix timestamp (seconds) */
    timestamp: number;
}

// =============================================================================
// TRAIN DATA
// =============================================================================

export interface StationInfo {
    code: string;
    name: string;
    scheduled_arrival?: string;
    scheduled_departure?: string;
    actual_arrival?: string;
    actual_departure?: string;
    delay_minutes: number;
    stop_number: number;
    platform?: string;
    distance_km?: number;
}

export interface TrainResult {
    train_number: string;
    train_name: string;
    from_station: string;
    to_station: string;
    departure_time: string;
    arrival_time: string;
    duration_minutes: number;
    coach_classes: CoachClass[];
    days_of_operation: string[];
}

export interface TrainStatus {
    train_number: string;
    train_name: string;
    current_station: string;
    delay_minutes: number;
    status: TrainRunningStatus;
    route: StationInfo[];
    position?: {
        latitude: number;
        longitude: number;
    };
    avg_occupancy_pct?: number;
    last_updated: string;
    stale?: boolean;
}

// =============================================================================
// OCCUPANCY
// =============================================================================

export interface CoachOccupancy {
    coach_number: number;
    coach_label: string;
    coach_class: CoachClass;
    occupancy_pct: number;
    ticketed_count: number;
    total_detected: number;
    zone_distribution?: Record<CoachZone, number>;
    recommended: boolean;
    node_online: boolean;
}

/** Row in the coach_occupancy TimescaleDB hypertable */
export interface OccupancyRecord {
    time: string;
    train_number: string;
    coach_number: number;
    occupancy_pct: number;
    ticketed: number;
    total: number;
    node_id: string;
    battery_pct: number;
    ble_count?: number;
    rf_estimate?: number;
    fusion_confidence?: number;
}

// =============================================================================
// ROUTE OPTIMIZATION
// =============================================================================

export interface RouteOption {
    train_number: string;
    train_name: string;
    departure_time: string;
    arrival_time: string;
    duration_minutes: number;
    avg_occupancy_pct?: number;
    delay_minutes: number;
    /** Composite score (higher = better) */
    score: number;
    recommended: boolean;
    occupancy_unknown: boolean;
}

// =============================================================================
// TICKETING
// =============================================================================

export interface Ticket {
    ticket_id: string;
    user_uid: string;
    train_number: string;
    train_name?: string;
    journey_date: string;
    from_station: string;
    to_station: string;
    coach: string;
    coach_class: CoachClass;
    seat: string;
    passenger_name: string;
    pnr?: string;
    qr_data: string;
    status: TicketStatus;
    created_at: string;
    updated_at?: string;
}

export interface QRPayload {
    /** Payload version */
    v: number;
    /** Ticket ID */
    tid: string;
    /** Train number */
    tr: string;
    /** Journey date (YYYY-MM-DD) */
    dt: string;
    /** Coach label */
    ch: string;
    /** Seat number */
    st: string;
    /** HMAC-SHA256 signature */
    sig: string;
    /** Key ID for key rotation */
    kid: string;
}

export interface TicketValidation {
    valid: boolean;
    reason?:
    | 'signature_invalid'
    | 'expired'
    | 'wrong_train'
    | 'not_found'
    | 'replay_detected';
    ticket?: Pick<
        Ticket,
        'ticket_id' | 'train_number' | 'coach' | 'seat' | 'passenger_name' | 'journey_date'
    >;
}

// =============================================================================
// USER PROFILE
// =============================================================================

export interface SavedRoute {
    from_station: string;
    to_station: string;
    label?: string;
}

export interface UserProfile {
    uid: string;
    display_name: string;
    email?: string;
    phone?: string;
    photo_url?: string;
    preferred_language: SupportedLanguage;
    saved_routes: SavedRoute[];
    consent_given: boolean;
    consent_version?: string;
    consent_timestamp?: string;
    created_at: string;
    updated_at?: string;
}

// =============================================================================
// DEVICE HEALTH
// =============================================================================

export interface DeviceHealth {
    node_id: string;
    train_number: string;
    coach_number: number;
    battery_pct: number;
    firmware_version: string;
    last_seen: string;
    ip_address?: string;
    nrf_status: DeviceStatus;
    rf_calibrated: boolean;
    status: DeviceStatus;
}

// =============================================================================
// ML PREDICTION
// =============================================================================

export interface OccupancyPrediction {
    train_number: string;
    coach_number: number;
    current_occupancy: number;
    horizons: number[];
}

export interface PredictionPoint {
    horizon_minutes: number;
    predicted_pct: number;
    confidence: number;
}

export interface PredictionResponse {
    predictions: PredictionPoint[];
    model_version: string;
    features_used: string[];
    insufficient_data?: boolean;
}

// =============================================================================
// ALERTS
// =============================================================================

export interface TraqAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    train_number: string;
    coach_number?: number;
    node_id?: string;
    message: string;
    created_at: string;
    acknowledged: boolean;
    acknowledged_by?: string;
    acknowledged_at?: string;
}

// =============================================================================
// SOCKET.IO EVENTS
// =============================================================================

export interface SocketEvents {
    coach_update: CoachPayload;
    coach_alert: TraqAlert;
    train_position: {
        train_number: string;
        latitude: number;
        longitude: number;
        speed_kmph?: number;
    };
}

// =============================================================================
// API RESPONSE WRAPPERS
// =============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    meta?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}
